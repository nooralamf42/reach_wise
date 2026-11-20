import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE, isSessionTokenValid } from "@/lib/admin-auth";
import { isDbConfigured, listCreators } from "@/lib/db";

// Spreadsheet apps run cell text starting with = + - @ as formulas; neutralise.
function cell(v: unknown) {
  let s = v instanceof Date ? v.toISOString() : Array.isArray(v) ? v.join("; ") : String(v ?? "");
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET(request: NextRequest) {
  // /api is outside the proxy matcher, so check the session here.
  if (!isSessionTokenValid(request.cookies.get(ADMIN_SESSION_COOKIE)?.value)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isDbConfigured()) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  const sp = request.nextUrl.searchParams;
  const rows = await listCreators(
    { niche: sp.get("niche") || undefined, min: Number(sp.get("min")) || undefined, q: sp.get("q") || undefined },
    5000
  );
  const cols = rows[0] ? Object.keys(rows[0]).filter((k) => k !== "phone_key") : [];
  const csv = [cols.join(","), ...rows.map((r) => cols.map((c) => cell(r[c])).join(","))].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="creators.csv"',
    },
  });
}
