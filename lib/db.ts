import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

/* eslint-disable @typescript-eslint/no-explicit-any */
export type Row = Record<string, any>;

let client: NeonQueryFunction<false, false> | null = null;

export function isDbConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

function sql() {
  if (!isDbConfigured()) throw new Error("DATABASE_URL is not set. See .env.example.");
  if (!client) client = neon(process.env.DATABASE_URL!);
  return client;
}

/** Column names always come from our own code, never from user input. */
export async function insertRow(table: "creators" | "brand_enquiries", row: Row): Promise<"ok" | "duplicate"> {
  const cols = Object.keys(row);
  const text = `insert into ${table} (${cols.join(", ")}) values (${cols.map((_, i) => `$${i + 1}`).join(", ")})`;
  try {
    await sql().query(text, cols.map((c) => row[c]));
    return "ok";
  } catch (e: any) {
    if (e?.code === "23505") return "duplicate"; // unique violation
    throw e;
  }
}

export type CreatorFilters = { niche?: string; min?: number; q?: string };

export async function listCreators(f: CreatorFilters = {}, limit = 500): Promise<Row[]> {
  const where: string[] = [];
  const params: any[] = [];
  if (f.niche) {
    params.push(f.niche);
    where.push(`primary_niche = $${params.length}`);
  }
  if (f.min) {
    params.push(f.min);
    where.push(`instagram_followers >= $${params.length}`);
  }
  if (f.q) {
    params.push(`%${f.q}%`);
    const p = `$${params.length}`;
    where.push(`(full_name ilike ${p} or city ilike ${p} or instagram_handle ilike ${p} or email ilike ${p})`);
  }
  params.push(limit);
  const text = `select * from creators ${where.length ? `where ${where.join(" and ")}` : ""} order by created_at desc limit $${params.length}`;
  return (await sql().query(text, params)) as Row[];
}

export async function listBrands(limit = 500): Promise<Row[]> {
  return (await sql().query("select * from brand_enquiries order by created_at desc limit $1", [limit])) as Row[];
}

export async function creatorStatsRows(): Promise<{ primary_niche: string; instagram_followers: number }[]> {
  return (await sql().query("select primary_niche, instagram_followers from creators limit 5000")) as any;
}
