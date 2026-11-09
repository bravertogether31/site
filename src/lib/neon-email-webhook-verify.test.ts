import assert from "node:assert/strict";
import { generateKeyPairSync, sign } from "node:crypto";
import { test } from "node:test";
import { verifyNeonEmailWebhook } from "./neon-email-webhook-verify.server.ts";

const BASE = "https://ep-braver.neonauth.c-3.ap-southeast-1.aws.neon.tech/neondb/auth";
const EVENT_ID = "550e8400-e29b-41d4-a716-446655440000";
const KID = "braver-test-public-key";
const pair = generateKeyPairSync("ed25519");
const jwk = pair.publicKey.export({format:"jwk"}) as Record<string,unknown>;
const sourceFetch = globalThis.fetch;

function signed(payload:Record<string,unknown>,timestamp=Date.now().toString()) {
  const raw = JSON.stringify(payload);
  const headerB64 = Buffer.from(JSON.stringify({alg:"EdDSA",kid:KID})).toString("base64url");
  const encodedPayload = Buffer.from(raw).toString("base64url");
  const signedTimestamp = Buffer.from(timestamp + "." + encodedPayload).toString("base64url");
  const digest = sign(null,Buffer.from(headerB64 + "." + signedTimestamp),pair.privateKey).toString("base64url");
  const headers = new Headers({
    "X-Neon-Signature": headerB64 + ".." + digest,
    "X-Neon-Signature-Kid": KID,
    "X-Neon-Timestamp": timestamp,
    "X-Neon-Event-Type": String(payload.event_type),
    "X-Neon-Event-Id": String(payload.event_id),
  });
  return {raw,headers};
}

function example() {
  return {
    event_id:EVENT_ID,event_type:"send.otp",
    user:{email:"member@example.com",name:"Member"},
    event_data:{otp_code:"123456",otp_type:"email-verification"},
  };
}

test("accepts correctly signed Neon email events and rejects tampering",async()=>{
  globalThis.fetch = async()=>new Response(JSON.stringify({keys:[{...jwk,kid:KID,alg:"EdDSA",use:"sig"}]}),{status:200});
  try {
    const event = signed(example());
    const parsed = await verifyNeonEmailWebhook(event.raw,event.headers,BASE);
    assert.equal(parsed.user.email,"member@example.com");
    assert.equal(parsed.event_data.otp_type,"email-verification");
    await assert.rejects(
      ()=>verifyNeonEmailWebhook(event.raw.replace("123456","123457"),event.headers,BASE),
      /Invalid webhook signature/,
    );
  } finally {globalThis.fetch=sourceFetch;}
});

test("rejects stale timestamps, unrelated signers and invalid event types",async()=>{
  const old=signed(example(),String(Date.now()-600_000));
  await assert.rejects(()=>verifyNeonEmailWebhook(old.raw,old.headers,BASE),/Invalid webhook metadata/);
  const unrelated=signed(example());
  unrelated.headers.set("X-Neon-Signature-Kid","other");
  await assert.rejects(()=>verifyNeonEmailWebhook(unrelated.raw,unrelated.headers,BASE),/Unexpected JWS algorithm or signer/);
  const unexpected=signed({...example(),event_type:"user.created"});
  await assert.rejects(()=>verifyNeonEmailWebhook(unexpected.raw,unexpected.headers,BASE),/Invalid webhook metadata/);
});

test("refuses malformed JSON and unexpected JWKS origins",async()=>{
  const bad=signed(example());
  await assert.rejects(()=>verifyNeonEmailWebhook(bad.raw,bad.headers,"https://example.com/auth"),/Unexpected Neon Auth source/);
  await assert.rejects(()=>verifyNeonEmailWebhook("x".repeat(21_000),bad.headers,BASE),/Oversized webhook/);
});

test("verifies password-reset links, but not attacker-controlled redirect hosts",async()=>{
  globalThis.fetch = async()=>new Response(JSON.stringify({keys:[{...jwk,kid:KID,alg:"EdDSA",use:"sig"}]}),{status:200});
  try {
    const valid=signed({
      event_id:EVENT_ID,event_type:"send.magic_link",
      user:{email:"member@example.com"},
      event_data:{link_type:"forget-password",link_url:BASE+"/reset-password?token=test"},
    });
    const parsed=await verifyNeonEmailWebhook(valid.raw,valid.headers,BASE);
    assert.equal(parsed.event_data.link_type,"forget-password");
    const malicious=signed({
      event_id:EVENT_ID,event_type:"send.magic_link",
      user:{email:"member@example.com"},
      event_data:{link_type:"forget-password",link_url:"https://malicious.example/password?token=stolen"},
    });
    await assert.rejects(
      ()=>verifyNeonEmailWebhook(malicious.raw,malicious.headers,BASE),
      /Unexpected reset link target/,
    );
  } finally {globalThis.fetch=sourceFetch;}
});
