import { z } from "zod";
import {
  NICHES, LANGUAGES, COUNTRIES, GENDERS, COLLAB_PREFS, BUDGETS, GOALS, TIMELINES, PLATFORMS, POST_PLATFORMS,
} from "@/lib/options";

/** Birth year -> the age bucket stored for filtering. */
export function ageRangeFromBirthYear(year: string): string {
  const age = new Date().getFullYear() - Number(year);
  if (age < 18) return "Under 18";
  if (age <= 24) return "18-24";
  if (age <= 34) return "25-34";
  if (age <= 44) return "35-44";
  return "45+";
}

const phone = z
  .string()
  .trim()
  .refine((v) => {
    const n = v.replace(/\D/g, "").length;
    return n >= 10 && n <= 15;
  }, "Enter a valid phone number");

const optionalUrl = z
  .string()
  .trim()
  .max(300)
  .refine((v) => v === "" || /^(https?:\/\/)?[^\s.]+\.[^\s]{2,}$/i.test(v), "Enter a valid link")
  .optional()
  .default("");

const optionalText = (max: number) => z.string().trim().max(max).optional().default("");

const optionalCount = z
  .string()
  .trim()
  .max(15)
  .refine((v) => v === "" || /^\d[\d,]*(\.\d+)?\s*[kKmM]?$/.test(v), "Use a number like 12000 or 12K")
  .optional()
  .default("");

/* ---------- Platform links ---------- */

export type PostPlatform = (typeof POST_PLATFORMS)[number];
export const LINK_FIELD: Record<PostPlatform, "instagramUrl" | "facebookUrl" | "youtubeUrl"> = {
  Instagram: "instagramUrl",
  Facebook: "facebookUrl",
  YouTube: "youtubeUrl",
};

/** Accepts a handle, a bare "site.com/name", or a full link. */
export function isValidPlatformLink(platform: PostPlatform, raw: string): boolean {
  const v = raw.trim();
  if (v.length < 3 || /\s/.test(v)) return false;
  if (/^https?:\/\//i.test(v) || v.includes("/") || v.includes(".")) {
    const host = platform === "Instagram" ? /instagram\.com|instagr\.am/i : platform === "Facebook" ? /facebook\.com|fb\.com|fb\.me/i : /youtube\.com|youtu\.be/i;
    return host.test(v);
  }
  return /^@?[A-Za-z0-9._-]{3,60}$/.test(v); // a plain handle
}

/** Turns what the person typed into a clean https link. */
export function normalizePlatformLink(platform: PostPlatform, raw: string): string {
  const v = raw.trim();
  if (!v) return "";
  if (/^https?:\/\//i.test(v)) return v;
  if (v.includes("/") || v.includes(".")) return `https://${v.replace(/^\/+/, "")}`;
  const handle = v.replace(/^@/, "");
  if (platform === "Instagram") return `https://instagram.com/${handle}`;
  if (platform === "Facebook") return `https://facebook.com/${handle}`;
  return `https://youtube.com/@${handle}`;
}

/** Instagram username from a link, for admin display and search. */
export function instagramHandleFromLink(link: string): string {
  const m = link.match(/instagram\.com\/([A-Za-z0-9._]+)/i);
  return m ? m[1] : "";
}

/* ---------- Creator ---------- */

const platformLink = z.string().trim().max(300).optional().default("");

export const creatorSchema = z
  .object({
    fullName: z.string().trim().min(2, "Enter your full name").max(100),
    email: z.string().trim().toLowerCase().email("Enter a valid email"),
    phone,
    country: z.enum(COUNTRIES, { message: "Select your country" }),
    city: z.string().trim().min(2, "Enter your city").max(80),
    state: optionalText(80),
    birthYear: z
      .string()
      .trim()
      .regex(/^\d{4}$/, "Enter a 4-digit year, e.g. 1999")
      .refine((v) => Number(v) >= 1940 && Number(v) <= new Date().getFullYear() - 13, "Enter a valid birth year (13+)"),
    gender: z.enum(GENDERS, { message: "Select one" }),
    languages: z.array(z.enum(LANGUAGES)).min(1, "Select at least one language"),
    primaryNiche: z.enum(NICHES, { message: "Select your main niche" }),
    otherCategories: z.array(z.enum(NICHES)).max(5, "Pick up to 5").default([]),
    platforms: z.array(z.enum(POST_PLATFORMS)).min(1, "Pick at least one platform"),
    instagramUrl: platformLink,
    facebookUrl: platformLink,
    youtubeUrl: platformLink,
    followers: optionalCount,
    collabPreference: z.enum(COLLAB_PREFS, { message: "Select a preference" }),
    minRate: optionalText(40),
    pastBrands: optionalText(600),
    portfolioUrl: optionalUrl,
    about: optionalText(800),
    consent: z.literal(true, { message: "Please accept to continue" }),
    website: z.string().max(0).optional().default(""), // honeypot
  })
  .superRefine((d, ctx) => {
    let filled = 0;
    for (const p of d.platforms) {
      const field = LINK_FIELD[p];
      const raw = d[field];
      if (!raw) continue;
      if (!isValidPlatformLink(p, raw)) {
        ctx.addIssue({ code: "custom", path: [field], message: `Enter a valid ${p} link or handle` });
      } else {
        filled++;
      }
    }
    // One link is enough, even if they picked several platforms.
    if (filled === 0 && d.platforms.length > 0) {
      ctx.addIssue({
        code: "custom",
        path: [LINK_FIELD[d.platforms[0]]],
        message: d.platforms.length > 1 ? "Add at least one link" : `Add your ${d.platforms[0]} link`,
      });
    }
  });
export type CreatorInput = z.input<typeof creatorSchema>;
export type CreatorData = z.output<typeof creatorSchema>;

/* ---------- Brand ---------- */

export const brandSchema = z.object({
  companyName: z.string().trim().min(2, "Enter your brand/company name").max(120),
  contactName: z.string().trim().min(2, "Enter your name").max(100),
  role: optionalText(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  phone,
  websiteUrl: optionalUrl,
  industry: z.enum(NICHES, { message: "Select an industry" }),
  goal: z.enum(GOALS, { message: "Select a goal" }),
  platforms: z.array(z.enum(PLATFORMS)).min(1, "Select at least one platform"),
  budget: z.enum(BUDGETS, { message: "Select a budget range" }),
  timeline: z.enum(TIMELINES, { message: "Select a timeline" }),
  notes: optionalText(1500),
  website: z.string().max(0).optional().default(""), // honeypot
});
export type BrandInput = z.input<typeof brandSchema>;
export type BrandData = z.output<typeof brandSchema>;

/* ---------- Contact ---------- */

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(100),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  phone: z
    .string()
    .trim()
    .max(20)
    .refine((v) => v === "" || v.replace(/\D/g, "").length >= 10, "Enter a valid phone number")
    .optional()
    .default(""),
  message: z.string().trim().min(10, "Tell us a little more (at least 10 characters)").max(2000),
  website: z.string().max(0).optional().default(""), // honeypot
});
export type ContactInput = z.input<typeof contactSchema>;
export type ContactData = z.output<typeof contactSchema>;

/** "12K" / "1.2M" / "12,000" -> number (0 if empty). */
export function parseCount(v: string): number {
  const s = v.replace(/,/g, "").trim().toLowerCase();
  if (!s) return 0;
  const n = parseFloat(s);
  if (Number.isNaN(n)) return 0;
  if (s.endsWith("k")) return Math.round(n * 1_000);
  if (s.endsWith("m")) return Math.round(n * 1_000_000);
  return Math.round(n);
}
