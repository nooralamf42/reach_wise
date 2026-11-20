import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";

export type PublicStats = { creators: number; niches: number; reach: number };

/** Real counts only. Returns zeros when the database isn't configured. */
export async function getPublicStats(): Promise<PublicStats> {
  if (!isSupabaseConfigured()) return { creators: 0, niches: 0, reach: 0 };
  try {
    const { data, error } = await getSupabaseClient()
      .from("creators")
      .select("primary_niche, instagram_followers")
      .limit(5000);
    if (error || !data) return { creators: 0, niches: 0, reach: 0 };
    return {
      creators: data.length,
      niches: new Set(data.map((r) => r.primary_niche)).size,
      reach: data.reduce((sum, r) => sum + (r.instagram_followers ?? 0), 0),
    };
  } catch {
    return { creators: 0, niches: 0, reach: 0 };
  }
}

export function compact(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(n);
}
