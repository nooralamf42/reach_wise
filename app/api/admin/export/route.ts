import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE, isSessionTokenValid } from "@/lib/admin-auth";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";

// Spreadsheet apps run cell text starting with = + - @ as formulas; neutralise.
function cell(v: unknown) {
  let s = Array.isArray(v) ? v.join("; ") : String(v ?? "");
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET(request: NextRequest) {
  // /api is outside the proxy matcher, so check the session here.
  if (!isSessionTokenValid(request.cookies.get(ADMIN_SESSION_COOKIE)?.value)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  const sp = request.nextUrl.searchParams;
  let query = getSupabaseClient().from("creators").select("*").order("created_at", { ascending: false }).limit(5000);
  if (sp.get("niche")) query = query.eq("primary_niche", sp.get("niche")!);
  if (sp.get("min")) query = query.gte("instagram_followers", Number(sp.get("min")) || 0);
  if (sp.get("q")) {
    const q = sp.get("q")!.replace(/[%,()]/g, "");
    query = query.or(`full_name.ilike.%${q}%,city.ilike.%${q}%,instagram_handle.ilike.%${q}%,email.ilike.%${q}%`);
  }
  const { data } = await query;
  const rows = data ?? [];
  const cols = rows[0] ? Object.keys(rows[0]).filter((k) => k !== "phone_key") : [];
  const csv = [cols.join(","), ...rows.map((r) => cols.map((c) => cell(r[c])).join(","))].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="creators.csv"',
    },
  });
}
