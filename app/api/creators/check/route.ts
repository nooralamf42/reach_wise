import { NextResponse } from "next/server";
import { z } from "zod";
import { creatorExists, isDbConfigured } from "@/lib/db";
import { phoneDedupeKey } from "@/lib/phone";
import { clientIp, rateLimited } from "@/lib/rate-limit";

const bodySchema = z.object({ email: z.string().trim().toLowerCase().email(), phone: z.string().trim().min(7).max(20) });

/**
 * Lets the form warn someone at step 2 that they already joined, instead of
 * after they've filled in every screen. Rate-limited so it can't be used to
 * hunt through the list for addresses.
 */
export async function POST(request: Request) {
  if (rateLimited(`creator-check:${clientIp(request)}`, 15)) {
    return NextResponse.json({ error: "Too many attempts. Please try again in a few minutes." }, { status: 429 });
  }
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ exists: false });
  if (!isDbConfigured()) return NextResponse.json({ exists: false });

  try {
    return NextResponse.json({ exists: await creatorExists(parsed.data.email, phoneDedupeKey(parsed.data.phone)) });
  } catch (e) {
    console.error("[creators/check] failed", e);
    return NextResponse.json({ exists: false }); // never block signup because of a lookup failure
  }
}
