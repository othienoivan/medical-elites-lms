import fs from "node:fs";
const b=JSON.parse(fs.readFileSync("performance-budget.json","utf8"));
for (const key of ["initialJsGzipKb","singleChunkRawKb","totalJsRawKb","totalCssRawKb"]) {
  if (!Number.isFinite(b[key]) || b[key] <= 0) throw new Error(`Invalid performance budget: ${key}`);
}
console.log("Performance budget validation passed.");
