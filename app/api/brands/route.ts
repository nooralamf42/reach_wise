import { NextResponse, after } from "next/server";
import { brandSchema } from "@/lib/schemas";
import { insertRow, isDbConfigured } from "@/lib/db";
import { toE164 } from "@/lib/phone";
import { clientIp, rateLimited } from "@/lib/rate-limit";
import { notifyNewBrand } from "@/lib/notify";

export async function POST(request: Request) {
  if (rateLimited(`brand:${clientIp(request)}`)) {
    return NextResponse.json({ error: "Too many attempts. Please try again in a few minutes." }, { status: 429 });
  }

  const json = await request.json().catch(() => null);
  const parsed = brandSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check the highlighted fields." }, { status: 400 });
  }
  const d = parsed.data;
  if (d.website) return NextResponse.json({ success: true });

  if (!isDbConfigured()) {
    return NextResponse.json({ error: "Enquiries are temporarily unavailable. Please email us instead." }, { status: 503 });
  }

  try {
    await insertRow("brand_enquiries", {
      company_name: d.companyName,
      contact_name: d.contactName,
      role: d.role,
      email: d.email,
      phone: toE164(d.phone),
      website_url: d.websiteUrl,
      industry: d.industry,
      goal: d.goal,
      platforms: d.platforms,
      budget: d.budget,
      timeline: d.timeline,
      notes: d.notes,
    });
  } catch (e) {
    console.error("[brands] insert failed", e);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }

  after(() =>
    notifyNewBrand({
      companyName: d.companyName,
      contactName: d.contactName,
      phone: toE164(d.phone),
      email: d.email,
      budget: d.budget,
      goal: d.goal,
    })
  );

  return NextResponse.json({ success: true });
}
