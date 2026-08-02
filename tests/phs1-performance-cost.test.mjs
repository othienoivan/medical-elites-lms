import test from "node:test"; import assert from "node:assert/strict"; import fs from "node:fs";
const read=p=>fs.readFileSync(p,"utf8");
test("performance budget is configured",()=>{const b=JSON.parse(read("performance-budget.json"));assert.ok(b.singleChunkRawKb<=900);});
test("bundle analyzer and validator are wired",()=>{const p=JSON.parse(read("package.json"));assert.match(p.scripts["release:check"],/validate:performance/);assert.ok(p.scripts["analyze:bundle"]);});
test("runtime performance monitoring is enabled",()=>{assert.match(read("src/main.tsx"),/startPerformanceMonitoring/);assert.match(read("src/performance/metrics.ts"),/largest-contentful-paint/);});
test("platform metrics use TTL caching",()=>{assert.match(read("src/firebase/platformMetrics.ts"),/withTtlCache/);});
test("required composite indexes exist",()=>{const i=read("firestore.indexes.json");for(const c of ["conversations","messages","quizAttempts"])assert.match(i,new RegExp(`\\"collectionGroup\\": \\"${c}\\"`));});
