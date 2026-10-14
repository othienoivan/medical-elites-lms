import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read=(path)=>readFile(new URL(`../${path}`,import.meta.url),"utf8");

test("service worker ignores non-cacheable application requests",async()=>{
  const source=await read("public/sw.js");
  assert.match(source,/if \(!isCacheableSameOriginRequest\(request\)\) return/);
});

test("successful navigations refresh the canonical SPA shell",async()=>{
  const source=await read("public/sw.js");
  assert.match(source,/request\.mode === "navigate" \? "\/index\.html" : request/);
  assert.match(source,/caches\.match\("\/index\.html"\) \|\| await caches\.match\("\/"\)/);
});

test("cache version is rotated for route recovery",async()=>{
  const source=await read("public/sw.js");
  assert.match(source,/medical-elites-v3-route-recovery-20261014/);
});
