import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";

const required = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_STORAGE_BUCKET",
  "VITE_FIREBASE_MESSAGING_SENDER_ID",
  "VITE_FIREBASE_APP_ID",
];

const candidates = [".env.local", ".env.production", ".env"];
const file = candidates.find(existsSync);
if (!file) {
  console.warn("No local environment file found. Copy .env.example to .env.local before deployment.");
  process.exit(0);
}
const text = await readFile(file, "utf8");
const values = Object.fromEntries(text.split(/\r?\n/).filter(Boolean).filter(line => !line.trim().startsWith("#")).map(line => {
  const idx = line.indexOf("=");
  return idx < 0 ? [line.trim(), ""] : [line.slice(0, idx).trim(), line.slice(idx + 1).trim()];
}));
const missing = required.filter(key => !values[key]);
if (missing.length) {
  console.error(`Environment validation failed in ${file}: ${missing.join(", ")}`);
  process.exit(1);
}
console.log(`Environment validation passed using ${file}.`);
