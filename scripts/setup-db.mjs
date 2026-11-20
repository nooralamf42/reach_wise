// Creates the tables. Run: npm run db:setup
import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set (check .env.local).");
  process.exit(1);
}

const sql = neon(url);
const statements = readFileSync(new URL("../db/schema.sql", import.meta.url), "utf8")
  .split("\n")
  .filter((l) => !l.trim().startsWith("--"))
  .join("\n")
  .split(";")
  .map((s) => s.trim())
  .filter(Boolean);

for (const s of statements) {
  await sql.query(s);
}
const tables = await sql.query(
  "select table_name from information_schema.tables where table_schema = 'public' order by 1"
);
console.log("Done. Tables:", tables.map((t) => t.table_name).join(", "));
