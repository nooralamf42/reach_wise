import { NextResponse, after } from "next/server";
import {
  ageRangeFromBirthYear, creatorSchema, instagramHandleFromLink, LINK_FIELD, normalizePlatformLink, parseCount,
} from "@/lib/schemas";
import { creatorExists, insertRow, isDbConfigured } from "@/lib/db";
import { phoneDedupeKey, toE164 } from "@/lib/phone";
import { clientIp, rateLimited } from "@/lib/rate-limit";
import { notifyNewCreator } from "@/lib/notify";

const DUPLICATE_MESSAGE = "You've already joined with this email or phone number. We'll be in touch if a brand fits you.";

export async function POST(request: Request) {
  if (rateLimited(`creator:${clientIp(request)}`)) {
    return NextResponse.json({ error: "Too many attempts. Please try again in a few minutes." }, { status: 429 });
  }

  const json = await request.json().catch(() => null);
  const parsed = creatorSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check the highlighted fields." }, { status: 400 });
  }
  const d = parsed.data;

  // Bots fill the hidden field. Pretend success so they don't retry.
  if (d.website) return NextResponse.json({ success: true });

  if (!isDbConfigured()) {
    return NextResponse.json({ error: "Sign-ups are temporarily unavailable. Please try again later." }, { status: 503 });
  }

  const phone = toE164(d.phone);
  const phoneKey = phoneDedupeKey(d.phone);

  // Only keep links for platforms they actually picked.
  const link = (p: (typeof d.platforms)[number]) =>
    d.platforms.includes(p) && d[LINK_FIELD[p]] ? normalizePlatformLink(p, d[LINK_FIELD[p]]) : "";
  const instagram = link("Instagram");
  const facebook = link("Facebook");
  const youtube = link("YouTube");

  let result: "ok" | "duplicate";
  try {
    if (await creatorExists(d.email, phoneKey)) {
      return NextResponse.json({ error: DUPLICATE_MESSAGE, duplicate: true }, { status: 409 });
    }
    result = await insertRow("creators", {
      full_name: d.fullName,
      email: d.email,
      phone,
      phone_key: phoneKey,
      country: d.country,
      city: d.city,
      state: d.state,
      birth_year: Number(d.birthYear),
      age_range: ageRangeFromBirthYear(d.birthYear),
      gender: d.gender,
      languages: d.languages,
      primary_niche: d.primaryNiche,
      other_categories: d.otherCategories,
      platforms: d.platforms,
      instagram_url: instagram || null,
      instagram_handle: instagramHandleFromLink(instagram) || null,
      instagram_followers: parseCount(d.followers),
      facebook_url: facebook || null,
      youtube_url: youtube || null,
      collab_preference: d.collabPreference,
      min_rate: d.minRate,
      past_brands: d.pastBrands,
      portfolio_url: d.portfolioUrl,
      about: d.about,
    });
  } catch (e) {
    console.error("[creators] insert failed", e);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }

  // Two people submitting at the same moment can still hit the database's unique rule.
  if (result === "duplicate") {
    return NextResponse.json({ error: DUPLICATE_MESSAGE, duplicate: true }, { status: 409 });
  }

  after(() =>
    notifyNewCreator({
      fullName: d.fullName,
      phone,
      email: d.email,
      primaryNiche: d.primaryNiche,
      platforms: d.platforms.join(", "),
      followers: d.followers,
    })
  );

  return NextResponse.json({ success: true });
}
