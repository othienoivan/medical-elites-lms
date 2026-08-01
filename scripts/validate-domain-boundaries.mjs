import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve("src/domains");
const FORBIDDEN_DOMAIN_IMPORTS = [
  /from\s+["'](?:firebase|react|react-router-dom)(?:\/[^"']*)?["']/,
  /import\s+["'](?:firebase|react|react-router-dom)(?:\/[^"']*)?["']/,
];

async function walk(directory) {
  const entries = await readdir(directory);
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(directory, entry);
    const info = await stat(fullPath);
    if (info.isDirectory()) files.push(...await walk(fullPath));
    else if (/\.(ts|tsx)$/.test(entry)) files.push(fullPath);
  }
  return files;
}

const files = await walk(ROOT);
const violations = [];
for (const file of files) {
  const normalized = file.replaceAll("\\", "/");
  if (!normalized.includes("/domain/")) continue;
  const source = await readFile(file, "utf8");
  for (const pattern of FORBIDDEN_DOMAIN_IMPORTS) {
    if (pattern.test(source)) violations.push(`${normalized}: domain layer imports a framework dependency`);
  }
}

if (violations.length) {
  console.error("Domain boundary validation failed:\n" + violations.join("\n"));
  process.exit(1);
}
console.log(`Domain boundary validation passed (${files.length} domain files inspected).`);
