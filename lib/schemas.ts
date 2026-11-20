import { z } from "zod";
import {
  NICHES, CONTENT_TYPES, LANGUAGES, COUNTRIES, GENDERS, COLLAB_PREFS, BUDGETS, GOALS, TIMELINES, PLATFORMS,
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

const count = z
  .string()
  .trim()
  .max(15)
  .refine((v) => v === "" || /^\d[\d,]*(\.\d+)?\s*[kKmM]?$/.test(v), "Use a number like 12000 or 12K")
  .optional()
  .default("");

export const creatorSchema = z.object({
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
  sampleLinks: z
    .array(
      z
        .string()
        .trim()
        .max(300)
        .regex(/^https?:\/\/[^\s.]+\.[^\s]{2,}$/i, "Links must start with https://")
    )
    .min(2, "Add at least 2 links to videos you made")
    .max(5, "Up to 5 links"),
  languages: z.array(z.enum(LANGUAGES)).min(1, "Select at least one language"),
  primaryNiche: z.enum(NICHES, { message: "Select your main niche" }),
  otherCategories: z.array(z.enum(NICHES)).max(5, "Pick up to 5").default([]),
  contentTypes: z.array(z.enum(CONTENT_TYPES)).min(1, "Select at least one content type"),
  instagramHandle: z
    .string()
    .trim()
    .min(2, "Enter your Instagram handle")
    .max(120)
    .transform((v) =>
      v.replace(/^https?:\/\/(www\.)?instagram\.com\//i, "").replace(/[/?].*$/, "").replace(/^@/, "")
    ),
  instagramFollowers: z
    .string()
    .trim()
    .min(1, "Enter your follower count")
    .max(15)
    .regex(/^\d[\d,]*(\.\d+)?\s*[kKmM]?$/, "Use a number like 12000 or 12K"),
  avgReelViews: count,
  engagementRate: optionalText(10),
  youtubeUrl: optionalUrl,
  youtubeSubscribers: count,
  facebookUrl: optionalUrl,
  xHandle: optionalText(100),
  linkedinUrl: optionalUrl,
  snapchatHandle: optionalText(100),
  otherPlatform: optionalText(200),
  collabPreference: z.enum(COLLAB_PREFS, { message: "Select a preference" }),
  minRate: optionalText(40),
  pastBrands: optionalText(600),
  portfolioUrl: optionalUrl,
  about: optionalText(800),
  consent: z.literal(true, { message: "Please accept to continue" }),
  website: z.string().max(0).optional().default(""), // honeypot
});
export type CreatorInput = z.input<typeof creatorSchema>;
export type CreatorData = z.output<typeof creatorSchema>;

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
