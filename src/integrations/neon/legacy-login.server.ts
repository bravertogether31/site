import { createHmac } from "node:crypto";
import { compare as compareLegacyBcrypt, hashSync } from "bcryptjs";
import { hashPassword as hashNativePassword } from "better-auth/crypto";
import { Pool, type PoolClient } from "pg";

/**
 * Server-side first-login migration, never called during public rendering.
 * The existing Supabase bcrypt hash is used only to verify the password the
 * user actually supplies. ONLY a freshly generated native scrypt hash is
 * stored in Neon Auth. No hash export, reset email, or plaintext persistence.
 *
 * Requires per-identity throttling and an explicit opt-in to prevent accidental
 * exposure or usage before the full auth/session cutover has been validated.
 */
const FAKE_BCRYPT = hashSync("dummy-neon-legacy-only", 10);
const MAX_ATTEMPTS = 6;
const WINDOW_SECONDS = 600;
const BCRYPT_PATTERN = /^\$2a\$\d{2}\$[./A-Za-z0-9]{53}$/;

type LegacyUser = {
  id: string;
  email: string;
  encrypted_password: string | null;
  email_confirmed_at: string | null;
  raw_user_meta_data: Record<string, unknown> | null;
  banned_until: string | null;
  deleted_at: string | null;
  created_at: string;
  display_name: string | null;
};

let pool: Pool | undefined;

function getDatabasePool(): Pool {
  if (pool) return pool;
  const raw = process.env.NEON_DATABASE_URL?.trim();
  if (!raw) throw new Error("Neon server database connection is not configured.");
  const url = new URL(raw);
  if (
    !["postgres:", "postgresql:"].includes(url.protocol) ||
    !url.hostname.endsWith(".neon.tech") ||
    !url.username ||
    !url.password ||
    !["require", "verify-full"].includes(url.searchParams.get("sslmode") ?? "")
  ) {
    throw new Error("Invalid TLS-enforced Neon database connection.");
  }
  pool = new Pool({
    connectionString: raw,
    ssl: { rejectUnauthorized: true },
    max: 2,
    idleTimeoutMillis: 15000,
    connectionTimeoutMillis: 8000,
    allowExitOnIdle: true,
  });
  return pool;
}

export function getNeonServerDatabasePool(): Pool {
  return getDatabasePool();
}

function normalizedEmail(value: string): string | null {
  const email = value.trim().toLowerCase();
  return email.length <= 320 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}

async function recordAttempt(client: PoolClient, email: string): Promise<boolean> {
  const salt = process.env.NEON_LEGACY_LOGIN_RATE_SALT ?? "";
  if (salt.length < 32) throw new Error("Neon legacy rate-limit key not configured.");
  const digest = createHmac("sha256", salt).update("braver-login:" + email).digest("hex");
  const result = await client.query<{ attempts: number }>(
    `INSERT INTO private.braver_login_throttle(identity_digest,window_start,attempts,updated_at)
     VALUES($1,now(),1,now())
     ON CONFLICT(identity_digest)
     DO UPDATE SET
       attempts=CASE WHEN private.braver_login_throttle.window_start<now()-make_interval(secs=>$2::integer)
         THEN 1 ELSE private.braver_login_throttle.attempts+1 END,
       window_start=CASE WHEN private.braver_login_throttle.window_start<now()-make_interval(secs=>$2::integer)
         THEN now() ELSE private.braver_login_throttle.window_start END,
       updated_at=now()
     RETURNING attempts`,
    [digest, WINDOW_SECONDS],
  );
  return Number(result.rows[0]?.attempts ?? MAX_ATTEMPTS + 1) <= MAX_ATTEMPTS;
}

async function upgradeCredential(
  client: PoolClient,
  email: string,
  password: string,
): Promise<boolean> {
  // No mutable JWT metadata may supply the user ID or role.
  const legacy = await client.query<LegacyUser>(
    `SELECT u.id::text AS id,lower(u.email) AS email,u.encrypted_password,
      u.email_confirmed_at,u.raw_user_meta_data,u.banned_until,u.deleted_at,u.created_at,
      p.display_name
     FROM auth.users u LEFT JOIN public.profiles p ON p.id=u.id
     WHERE lower(u.email)=$1 LIMIT 2 FOR UPDATE OF u`,
    [email],
  );
  if (legacy.rows.length !== 1) {
    await compareLegacyBcrypt(password, FAKE_BCRYPT);
    return false;
  }
  const user = legacy.rows[0];
  if (
    !user.encrypted_password ||
    !BCRYPT_PATTERN.test(user.encrypted_password) ||
    user.deleted_at ||
    (user.banned_until && Date.parse(user.banned_until) > Date.now()) ||
    user.raw_user_meta_data?.signup_completed === false ||
    !user.email_confirmed_at
  ) {
    await compareLegacyBcrypt(password, FAKE_BCRYPT);
    return false;
  }

  const native = await client.query<{ id: string; email: string }>(
    `SELECT id::text AS id,lower(email) AS email FROM neon_auth."user"
     WHERE id=$1::uuid OR lower(email)=$2 LIMIT 2 FOR UPDATE`,
    [user.id, email],
  );
  if (
    native.rows.length > 1 ||
    (native.rows[0] && (native.rows[0].id !== user.id || native.rows[0].email !== email))
  ) {
    return false;
  }
  if (native.rows.length === 1) {
    const account = await client.query(
      `SELECT id FROM neon_auth.account WHERE "userId"=$1::uuid AND "providerId"='credential' LIMIT 2`,
      [user.id],
    );
    // Native credentials are authoritative. Do not reactivate an old password
    // after a user changes it through Neon Auth.
    if (account.rows.length > 0) return false;
  }
  if (!(await compareLegacyBcrypt(password, user.encrypted_password))) return false;
  const nativeHash = await hashNativePassword(password);
  if (!native.rows.length) {
    const inserted = await client.query(
      `INSERT INTO neon_auth."user"(id,name,email,"emailVerified","createdAt","updatedAt")
       VALUES($1::uuid,$2,$3,true,$4::timestamptz,now()) RETURNING id`,
      [user.id, (user.display_name?.trim() || email.split("@")[0]).slice(0, 255), email, user.created_at],
    );
    if (inserted.rowCount !== 1) throw new Error("Native identity creation failed.");
  }
  const credential = await client.query(
    `INSERT INTO neon_auth.account("accountId","providerId","userId",password,"createdAt","updatedAt")
     VALUES($1,'credential',$2::uuid,$3,now(),now()) RETURNING id`,
    [user.id, user.id, nativeHash],
  );
  if (credential.rowCount !== 1) throw new Error("Native credential creation failed.");
  return true;
}

export async function prepareLegacyNeonSignIn(input: {
  email: string;
  password: string;
}): Promise<boolean> {
  if (process.env.NEON_LEGACY_LOGIN_ENABLED !== "1") {
    throw new Error("Legacy Neon login is disabled pending staging acceptance.");
  }
  const email = normalizedEmail(input.email);
  if (!email || !input.password || input.password.length > 4096) return false;

  const client = await getDatabasePool().connect();
  try {
    await client.query("BEGIN");
    await client.query("SET LOCAL statement_timeout = '15s'");
    await client.query(
      "SELECT pg_advisory_xact_lock(hashtext('braver-legacy-neon:' || $1))",
      [email],
    );
    const allowed = await recordAttempt(client, email);
    const success = allowed ? await upgradeCredential(client, email, input.password) : false;
    await client.query("COMMIT");
    return success;
  } catch {
    await client.query("ROLLBACK").catch(() => undefined);
    // No account existence, password, hash or query parameters in errors/logs.
    throw new Error("Secure sign-in preparation is temporarily unavailable.");
  } finally {
    client.release();
  }
}
