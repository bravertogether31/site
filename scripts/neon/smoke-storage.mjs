import assert from "node:assert/strict";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { readFileSync, statSync } from "node:fs";

if (process.env.BRAVER_ALLOW_SYNTHETIC_STORAGE_TEST !== "1") {
  throw new Error("Explicit isolated storage test flag required.");
}
const credPath = "/tmp/braver-neon-staging-secrets-20261107/s3.json";
if ((statSync(credPath).mode & 0o077) !== 0) {
  throw new Error("Storage credential file is not owner-only");
}
const settings = JSON.parse(readFileSync(credPath, "utf8"));
if (!new URL(settings.endpoint).hostname.startsWith("br-twilight-recipe-azi9p8zg.")) {
  throw new Error("Refusing to run against production Neon Storage");
}
process.env.NEON_STORAGE_ENDPOINT = settings.endpoint;
process.env.NEON_STORAGE_REGION = settings.region;
process.env.NEON_STORAGE_ACCESS_KEY_ID = settings.accessKeyId;
process.env.NEON_STORAGE_SECRET_ACCESS_KEY = settings.secretAccessKey;
const {
  presignPrivateDocumentUpload,
  presignPrivateDocumentRead,
  downloadPrivateDocument,
  deletePrivateDocument,
  documentExists,
} = await import("../../src/integrations/neon/storage.server.ts");

const key = `${randomUUID()}/${randomUUID()}/test-${randomUUID()}.pdf`;
const source = Buffer.concat([Buffer.from("%PDF-1.4\n"),randomBytes(1536),Buffer.from("\n%%EOF")]);
const sha = createHash("sha256").update(source).digest("hex");
for (const bucket of ["essay-submissions", "advisor-cvs"]) {
  try {
    assert.equal(await documentExists(bucket, key), false);
    const presigned = await presignPrivateDocumentUpload({ bucket, key, mimeType: "application/pdf" });
    assert.equal(new URL(presigned).protocol, "https:");
    const uploaded = await fetch(presigned, {
      method: "PUT", headers: { "Content-Type": "application/pdf" }, body: source,
    });
    assert.equal(uploaded.status, 200, `Upload failed for ${bucket}`);
    assert.equal(await documentExists(bucket, key), true);
    const downloaded = await downloadPrivateDocument(bucket,key,10*1024*1024);
    assert.equal(downloaded.length,source.length);
    assert.equal(createHash("sha256").update(downloaded).digest("hex"),sha);
    const readUrl = await presignPrivateDocumentRead(bucket,key,"synthetic.pdf");
    const readResponse = await fetch(readUrl);
    assert.equal(readResponse.status,200);
    assert.equal(createHash("sha256").update(Buffer.from(await readResponse.arrayBuffer())).digest("hex"),sha);
    console.log("PASS",bucket,"private signed PUT, HEAD, GET, download integrity");
  } finally {
    await deletePrivateDocument(bucket, key);
    assert.equal(await documentExists(bucket,key),false);
    console.log("PASS",bucket,"synthetic object deleted");
  }
}
console.log("Neon branchable private S3 Storage synthetic upload test completed.");
