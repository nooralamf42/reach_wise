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
    where.push(`(full_name ilike ${p} or city ilike ${p} or email ilike ${p} or instagram_handle ilike ${p})`);
  }
  params.push(limit);
  const text = `select * from creators ${where.length ? `where ${where.join(" and ")}` : ""} order by created_at desc limit $${params.length}`;
  return (await sql().query(text, params)) as Row[];
}

export async function listBrands(limit = 500): Promise<Row[]> {
  return (await sql().query("select * from brand_enquiries order by created_at desc limit $1", [limit])) as Row[];
}

/** True if someone already joined with this email or phone (matched on the last 10 digits). */
export async function creatorExists(email: string, phoneKey: string): Promise<boolean> {
  const rows = await sql().query(
    "select 1 from creators where email = $1 or ($2 <> '' and phone_key = $2) limit 1",
    [email, phoneKey]
  );
  return rows.length > 0;
}

export async function insertContactMessage(row: { name: string; email: string; phone: string; message: string }): Promise<string> {
  const rows = await sql().query(
    "insert into contact_messages (name, email, phone, message) values ($1, $2, $3, $4) returning id",
    [row.name, row.email, row.phone, row.message]
  );
  return rows[0].id as string;
}

export async function setMessageEmailStatus(id: string, status: string) {
  await sql().query("update contact_messages set email_status = $2 where id = $1", [id, status.slice(0, 200)]);
}

export async function setMessageStatus(id: string, status: "new" | "done") {
  await sql().query("update contact_messages set status = $2 where id = $1", [id, status]);
}

export async function listMessages(limit = 500): Promise<Row[]> {
  return (await sql().query("select * from contact_messages order by created_at desc limit $1", [limit])) as Row[];
}

export async function countNewMessages(): Promise<number> {
  const rows = await sql().query("select count(*)::int as n from contact_messages where status = 'new'");
  return rows[0]?.n ?? 0;
}

export async function getSetting(key: string): Promise<string | null> {
  if (!isDbConfigured()) return null;
  const rows = await sql().query("select value from settings where key = $1", [key]);
  return rows[0]?.value ?? null;
}

export async function setSetting(key: string, value: string) {
  await sql().query(
    "insert into settings (key, value) values ($1, $2) on conflict (key) do update set value = excluded.value, updated_at = now()",
    [key, value]
  );
}

export async function creatorStatsRows(): Promise<{ primary_niche: string; instagram_followers: number }[]> {
  return (await sql().query("select primary_niche, instagram_followers from creators limit 5000")) as any;
}
