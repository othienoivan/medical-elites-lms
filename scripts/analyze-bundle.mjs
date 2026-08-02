import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
const dist=path.resolve("dist/assets");
if(!fs.existsSync(dist)){console.log("Bundle analysis skipped: dist/assets not found.");process.exit(0)}
const files=fs.readdirSync(dist).filter(f=>/\.(js|css)$/.test(f));
const rows=files.map(name=>{const b=fs.readFileSync(path.join(dist,name));return {name,raw:b.length,gzip:zlib.gzipSync(b).length}}).sort((a,b)=>b.raw-a.raw);
console.log("\nBundle analysis (largest first)");
for(const r of rows.slice(0,25)) console.log(`${(r.raw/1024).toFixed(1)} KB raw | ${(r.gzip/1024).toFixed(1)} KB gzip | ${r.name}`);
const js=rows.filter(r=>r.name.endsWith('.js')); const css=rows.filter(r=>r.name.endsWith('.css'));
console.log(`Totals: JS ${(js.reduce((s,r)=>s+r.raw,0)/1024).toFixed(1)} KB raw; CSS ${(css.reduce((s,r)=>s+r.raw,0)/1024).toFixed(1)} KB raw`);
