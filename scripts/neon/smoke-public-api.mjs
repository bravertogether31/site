import assert from "node:assert/strict";
import { createInternalNeonAuth } from "@neondatabase/auth";
import { SupabaseAuthAdapter } from "@neondatabase/auth/vanilla/adapters";
import { PostgrestClient } from "@supabase/postgrest-js";

const authUrl = process.env.NEON_AUTH_BASE_URL;
const apiUrl = process.env.NEON_DATA_API_URL;
if (!authUrl || !apiUrl) {
  throw new Error("Set NEON_AUTH_BASE_URL and NEON_DATA_API_URL for an isolated test branch.");
}
for (const [value, type] of [[authUrl, ".neonauth."], [apiUrl, ".apirest."]]) {
  const url = new URL(value);
  assert.equal(url.protocol, "https:");
  assert.ok(url.hostname.endsWith(".neon.tech") && url.hostname.includes(type));
}
const auth = createInternalNeonAuth(authUrl, {
  adapter: SupabaseAuthAdapter(),
  allowAnonymous: true,
});
const token = await auth.getJWTToken();
assert.ok(typeof token === "string" && token.split(".").length === 3, "Neon anonymous JWT required");

const client = new PostgrestClient(apiUrl, {
  fetch: (input, init) => {
    const headers = new Headers(init?.headers);
    headers.set("Authorization", `Bearer ${token}`);
    return fetch(input, { ...init, headers });
  },
});

for (const table of ["resource_categories", "competitions", "public_advisors"]) {
  const { data, error, status } = await client.from(table).select("id").limit(4);
  assert.equal(error, null, table);
  assert.equal(status, 200, table);
  assert.ok(Array.isArray(data) && data.length > 0, `Expected public data for ${table}`);
  console.log("PASS public RLS query:", table);
}
for (const table of ["messages", "user_roles"]) {
  const { data, error } = await client.from(table).select("id").limit(2);
  assert.equal(data, null, `Unauthorized ${table} rows must not be returned`);
  assert.ok(error && /permission denied/i.test(error.message), `Expected explicit denial for ${table}`);
  console.log("PASS private RLS denial:", table);
}
const essay = await client.from("essay_submissions").select("id").limit(2);
assert.equal(essay.error, null);
assert.deepEqual(essay.data, [], "Anonymous requests must not see private essay records");
console.log("PASS private essay isolation");
console.log("Neon Auth anonymous token, public data and private isolation: VERIFIED.");
