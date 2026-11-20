import { NextResponse, after } from "next/server";
import { ageRangeFromBirthYear, creatorSchema, parseCount } from "@/lib/schemas";
import { insertRow, isDbConfigured } from "@/lib/db";
import { phoneDedupeKey, toE164 } from "@/lib/phone";
import { clientIp, rateLimited } from "@/lib/rate-limit";
import { notifyNewCreator } from "@/lib/notify";

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

  let result: "ok" | "duplicate";
  try {
    result = await insertRow("creators", {
      full_name: d.fullName,
      email: d.email,
      phone: toE164(d.phone),
      phone_key: phoneDedupeKey(d.phone),
      country: d.country,
      city: d.city,
      state: d.state,
      birth_year: Number(d.birthYear),
      age_range: ageRangeFromBirthYear(d.birthYear),
      sample_links: d.sampleLinks,
      gender: d.gender,
      languages: d.languages,
      primary_niche: d.primaryNiche,
      other_categories: d.otherCategories,
      content_types: d.contentTypes,
      instagram_handle: d.instagramHandle,
      instagram_followers: parseCount(d.instagramFollowers),
      avg_reel_views: parseCount(d.avgReelViews),
      engagement_rate: d.engagementRate,
      youtube_url: d.youtubeUrl,
      youtube_subscribers: parseCount(d.youtubeSubscribers),
      facebook_url: d.facebookUrl,
      x_handle: d.xHandle,
      linkedin_url: d.linkedinUrl,
      snapchat_handle: d.snapchatHandle,
      other_platform: d.otherPlatform,
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

  if (result === "duplicate") {
    return NextResponse.json(
      { error: "A profile with this email, phone number or Instagram handle already exists. We'll be in touch." },
      { status: 409 }
    );
  }

  after(() =>
    notifyNewCreator({
      fullName: d.fullName,
      phone: toE164(d.phone),
      email: d.email,
      primaryNiche: d.primaryNiche,
      instagramHandle: d.instagramHandle,
      followers: d.instagramFollowers,
    })
  );

  return NextResponse.json({ success: true });
}
