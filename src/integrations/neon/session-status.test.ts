import assert from "node:assert/strict";
import { test } from "node:test";
import { clearNeonSessionStatus, loadNeonSessionStatus } from "./session-status.browser.ts";

const originalFetch = globalThis.fetch;

test("single session-state request serves both navigation and browser identity", async () => {
  clearNeonSessionStatus();
  let calls = 0;
  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    calls++;
    assert.equal(String(input),"/api/neon-signup");
    assert.equal(init?.credentials, "same-origin");
    return Response.json({
      id: "550e8400-e29b-41d4-a716-446655440000",
      email: "test@example.com", name: "Test",
      signup_completed: false,
    });
  };
  try {
    const [one,two]=await Promise.all([loadNeonSessionStatus(),loadNeonSessionStatus()]);
    assert.equal(calls,1);
    assert.deepEqual(one,two);
    assert.equal(one?.signup_completed,false);
    assert.equal((await loadNeonSessionStatus())?.name,"Test");
    assert.equal(calls,1);
  } finally { globalThis.fetch=originalFetch; clearNeonSessionStatus(); }
});

test("cache invalidation forces a new session read after authentication changes",async()=>{
  clearNeonSessionStatus();
  let calls = 0;
  globalThis.fetch = async (): Promise<Response> => {
    calls++;
    return calls===1 ? new Response(null,{status:401}) :
      Response.json({
        id:"550e8400-e29b-41d4-a716-446655440000",
        email:"test@example.com",name:null,signup_completed:true,
      });
  };
  try {
    assert.equal(await loadNeonSessionStatus(),null);
    assert.equal(await loadNeonSessionStatus(),null);
    assert.equal(calls,1);
    clearNeonSessionStatus();
    assert.equal((await loadNeonSessionStatus())?.signup_completed,true);
    assert.equal(calls,2);
  } finally { globalThis.fetch=originalFetch; clearNeonSessionStatus(); }
});

test("server errors and malformed session data are never cached as completed accounts",async()=>{
  clearNeonSessionStatus();
  let calls=0;
  globalThis.fetch = async ():Promise<Response>=>{
    calls++;
    return calls===1 ? new Response(null,{status:503}) :
      Response.json({id:"test",email:"test@example.com",signup_completed:"true"});
  };
  try{
    await assert.rejects(()=>loadNeonSessionStatus(),/temporarily unavailable/);
    await assert.rejects(()=>loadNeonSessionStatus(),/Incomplete Neon session status/);
    assert.equal(calls,2);
  } finally {globalThis.fetch=originalFetch;clearNeonSessionStatus();}
});
