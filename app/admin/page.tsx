import Link from "next/link";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import { whatsappChatUrl } from "@/lib/phone";
import { NICHES } from "@/lib/options";
import { compact } from "@/lib/stats";
import { LogoutButton } from "@/components/admin-logout";

export const metadata = { title: "Admin", robots: { index: false } };
export const dynamic = "force-dynamic";

type SP = { niche?: string; q?: string; min?: string; tab?: string };

export default async function AdminPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const tab = sp.tab === "brands" ? "brands" : "creators";

  if (!isSupabaseConfigured()) {
    return <div className="mx-auto max-w-3xl px-5 py-16">Supabase isn&apos;t configured. Add the keys to .env.local.</div>;
  }
  const db = getSupabaseClient();

  let creators: Record<string, any>[] = []; // eslint-disable-line @typescript-eslint/no-explicit-any
  let brands: Record<string, any>[] = []; // eslint-disable-line @typescript-eslint/no-explicit-any

  if (tab === "creators") {
    let query = db.from("creators").select("*").order("created_at", { ascending: false }).limit(500);
    if (sp.niche) query = query.eq("primary_niche", sp.niche);
    if (sp.min) query = query.gte("instagram_followers", Number(sp.min) || 0);
    if (sp.q) {
      const q = sp.q.replace(/[%,()]/g, "");
      query = query.or(`full_name.ilike.%${q}%,city.ilike.%${q}%,instagram_handle.ilike.%${q}%,email.ilike.%${q}%`);
    }
    creators = (await query).data ?? [];
  } else {
    brands = (await db.from("brand_enquiries").select("*").order("created_at", { ascending: false }).limit(500)).data ?? [];
  }

  const tabLink = (t: string, label: string) => (
    <Link href={`/admin?tab=${t}`} className={`rounded-lg px-4 py-2 text-sm font-medium ${tab === t ? "bg-foreground text-background" : "bg-surface border border-border"}`}>
      {label}
    </Link>
  );

  return (
    <div className="mx-auto max-w-7xl px-5 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">Admin</h1>
        <LogoutButton />
      </div>
      <div className="mt-5 flex gap-2">{tabLink("creators", "Creators")}{tabLink("brands", "Brand enquiries")}</div>

      {tab === "creators" ? (
        <>
          <form className="mt-5 flex flex-wrap items-end gap-3" action="/admin">
            <input type="hidden" name="tab" value="creators" />
            <input name="q" defaultValue={sp.q} placeholder="Search name, city, handle, email" className="h-10 w-72 rounded-lg border border-border bg-surface px-3 text-sm" />
            <select name="niche" defaultValue={sp.niche ?? ""} className="h-10 rounded-lg border border-border bg-surface px-3 text-sm">
              <option value="">All niches</option>
              {NICHES.map((n) => <option key={n}>{n}</option>)}
            </select>
            <input name="min" type="number" defaultValue={sp.min} placeholder="Min followers" className="h-10 w-36 rounded-lg border border-border bg-surface px-3 text-sm" />
            <button className="h-10 rounded-lg bg-foreground px-4 text-sm font-semibold text-background">Filter</button>
            <a href={`/api/admin/export?${new URLSearchParams(Object.entries(sp).filter(([, v]) => v) as [string, string][]).toString()}`} className="h-10 rounded-lg border border-border bg-surface px-4 text-sm font-semibold leading-10">Export CSV</a>
          </form>
          <p className="mt-4 text-sm text-muted">{creators.length} creators</p>
          <div className="mt-2 overflow-x-auto rounded-2xl border border-border bg-surface">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b border-border text-xs uppercase text-muted">
                <tr>{["Date", "Name", "Niche", "Instagram", "Followers", "City", "Preference", "Contact"].map((h) => <th key={h} className="px-4 py-3">{h}</th>)}</tr>
              </thead>
              <tbody>
                {creators.map((c) => (
                  <tr key={c.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 whitespace-nowrap">{new Date(c.created_at).toLocaleDateString("en-IN")}</td>
                    <td className="px-4 py-3 font-medium">{c.full_name}<div className="text-xs font-normal text-muted">{c.email}</div></td>
                    <td className="px-4 py-3">{c.primary_niche}</td>
                    <td className="px-4 py-3"><a className="text-accent-dark hover:underline" target="_blank" rel="noopener noreferrer" href={`https://instagram.com/${c.instagram_handle}`}>@{c.instagram_handle}</a></td>
                    <td className="px-4 py-3">{compact(c.instagram_followers)}</td>
                    <td className="px-4 py-3">{c.city}</td>
                    <td className="px-4 py-3">{c.collab_preference}</td>
                    <td className="px-4 py-3"><a className="font-medium text-green-700 hover:underline" target="_blank" rel="noopener noreferrer" href={whatsappChatUrl(c.phone, `Hi ${c.full_name}, this is from our creator network.`)}>WhatsApp</a></td>
                  </tr>
                ))}
                {creators.length === 0 && <tr><td colSpan={8} className="px-4 py-10 text-center text-muted">No creators yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="mt-5 overflow-x-auto rounded-2xl border border-border bg-surface">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-border text-xs uppercase text-muted">
              <tr>{["Date", "Brand", "Contact", "Goal", "Budget", "Timeline", "Platforms", "Reach out"].map((h) => <th key={h} className="px-4 py-3">{h}</th>)}</tr>
            </thead>
            <tbody>
              {brands.map((b) => (
                <tr key={b.id} className="border-b border-border last:border-0 align-top">
                  <td className="px-4 py-3 whitespace-nowrap">{new Date(b.created_at).toLocaleDateString("en-IN")}</td>
                  <td className="px-4 py-3 font-medium">{b.company_name}<div className="text-xs font-normal text-muted">{b.industry}</div></td>
                  <td className="px-4 py-3">{b.contact_name}<div className="text-xs text-muted">{b.email}</div></td>
                  <td className="px-4 py-3">{b.goal}</td>
                  <td className="px-4 py-3">{b.budget}</td>
                  <td className="px-4 py-3">{b.timeline}</td>
                  <td className="px-4 py-3">{(b.platforms ?? []).join(", ")}</td>
                  <td className="px-4 py-3"><a className="font-medium text-green-700 hover:underline" target="_blank" rel="noopener noreferrer" href={whatsappChatUrl(b.phone, `Hi ${b.contact_name}, thanks for your enquiry.`)}>WhatsApp</a></td>
                </tr>
              ))}
              {brands.length === 0 && <tr><td colSpan={8} className="px-4 py-10 text-center text-muted">No enquiries yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
