import assert from "node:assert/strict";
import test from "node:test";

import { authSearchSchema } from "./auth-search.ts";

test("password reset URL accepts TanStack JSON-parsed numeric recovery flag", () => {
  const token = "synthetic-test-token-" + "a".repeat(32);
  for (const recovery of [1, "1"]) {
    assert.deepEqual(authSearchSchema.parse({ mode: "signin", recovery, token }), {
      mode: "signin",
      recovery: "1",
      token,
    });
  }
});

test("ordinary account creation and sign-in links are unaffected", () => {
  assert.deepEqual(authSearchSchema.parse({ mode: "signup" }), { mode: "signup" });
  assert.deepEqual(authSearchSchema.parse({ mode: "signin" }), { mode: "signin" });
});

test("malformed or oversized recovery URL parameters fail safely", () => {
  assert.deepEqual(authSearchSchema.parse({ mode: "signin", recovery: 2 }), {
    mode: "signin", recovery: undefined,
  });
  assert.deepEqual(authSearchSchema.parse({
    mode: "signin", recovery: 1, token: "x".repeat(5000),
  }), { mode: "signin", recovery: "1", token: undefined });
});
