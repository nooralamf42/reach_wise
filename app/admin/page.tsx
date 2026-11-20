import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminState } from "@/lib/admin-access";
import { countNewMessages, isDbConfigured, listBrands, listCreators, listMessages, type Row } from "@/lib/db";
import { whatsappChatUrl } from "@/lib/phone";
import { NICHES } from "@/lib/options";
import { compact } from "@/lib/stats";
import { getNotifyEmails, isEmailConfigured } from "@/lib/notify";
import { LogoutButton } from "@/components/admin-logout";
import { saveNotifyEmailsAction, sendTestEmailAction, setMessageStatusAction } from "@/app/admin/actions";

export const metadata = { title: "Admin", robots: { index: false } };
export const dynamic = "force-dynamic";

type SP = {
  niche?: string; q?: string; min?: string; tab?: string;
  saved?: string; error?: string; test?: string; reason?: string;
};
type Tab = "creators" | "brands" | "messages" | "settings";

const TABS: { id: Tab; label: string }[] = [
  { id: "creators", label: "Creators" },
  { id: "brands", label: "Brand enquiries" },
  { id: "messages", label: "Messages" },
  { id: "settings", label: "Settings" },
];

function PlatformLinks({ c }: { c: Row }) {
  const items: [string, string][] = [];
  const insta = c.instagram_url || (c.instagram_handle ? `https://instagram.com/${c.instagram_handle}` : "");
  if (insta) items.push(["Instagram", insta]);
  if (c.facebook_url) items.push(["Facebook", c.facebook_url]);
  if (c.youtube_url) items.push(["YouTube", c.youtube_url]);
  if (items.length === 0) return <span className="text-muted">None</span>;
  return (
    <div className="flex flex-col gap-0.5">
      {items.map(([label, href]) => (
        <a key={label} className="text-accent-dark hover:underline" target="_blank" rel="noopener noreferrer" href={href}>{label}</a>
      ))}
    </div>
  );
}

export default async function AdminPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const tab: Tab = TABS.some((t) => t.id === sp.tab) ? (sp.tab as Tab) : "creators";

  const access = await getAdminState();
  if (access.status === "signed-out") redirect("/auth/sign-in");
  if (access.status === "forbidden") {
    return (
      <div className="mx-auto max-w-md px-5 py-24">
        <h1 className="text-2xl font-bold">No access</h1>
        <p className="mt-2 text-sm text-muted">
          {access.reason === "unverified"
            ? `Verify the email for ${access.email} first, then reload this page.`
            : `${access.email} isn't on the admin list.`}
        </p>
        <div className="mt-5"><LogoutButton /></div>
      </div>
    );
  }

  if (!isDbConfigured()) {
    return <div className="mx-auto max-w-3xl px-5 py-16">Database isn&apos;t configured. Set DATABASE_URL in .env.local.</div>;
  }

  const [newMessages, creators, brands, messages, notify] = await Promise.all([
    countNewMessages().catch(() => 0),
    tab === "creators"
      ? listCreators({ niche: sp.niche || undefined, min: Number(sp.min) || undefined, q: sp.q || undefined })
      : Promise.resolve([] as Row[]),
    tab === "brands" ? listBrands() : Promise.resolve([] as Row[]),
    tab === "messages" ? listMessages() : Promise.resolve([] as Row[]),
    tab === "settings" ? getNotifyEmails() : Promise.resolve(null),
  ]);

  const emailReady = isEmailConfigured();

  return (
    <div className="mx-auto max-w-7xl px-5 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">Admin</h1>
        <LogoutButton email={access.email} />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Link
            key={t.id}
            href={`/admin?tab=${t.id}`}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${tab === t.id ? "bg-foreground text-background" : "border border-border bg-surface"}`}
          >
            {t.label}
            {t.id === "messages" && newMessages > 0 && (
              <span className="ml-2 rounded-full bg-accent px-2 py-0.5 text-xs text-white">{newMessages}</span>
            )}
          </Link>
        ))}
      </div>

      {tab === "creators" && (
        <>
          <form className="mt-5 flex flex-wrap items-end gap-3" action="/admin">
            <input type="hidden" name="tab" value="creators" />
            <input name="q" defaultValue={sp.q} placeholder="Search name, city, email" className="h-10 w-72 rounded-lg border border-border bg-surface px-3 text-sm" />
            <select name="niche" defaultValue={sp.niche ?? ""} className="h-10 rounded-lg border border-border bg-surface px-3 text-sm">
              <option value="">All niches</option>
              {NICHES.map((n) => <option key={n}>{n}</option>)}
            </select>
            <input name="min" type="number" defaultValue={sp.min} placeholder="Min followers" className="h-10 w-36 rounded-lg border border-border bg-surface px-3 text-sm" />
            <button className="h-10 rounded-lg bg-foreground px-4 text-sm font-semibold text-background">Filter</button>
            <a href={`/api/admin/export?${new URLSearchParams(Object.entries({ niche: sp.niche, q: sp.q, min: sp.min }).filter(([, v]) => v) as [string, string][]).toString()}`} className="h-10 rounded-lg border border-border bg-surface px-4 text-sm font-semibold leading-10">Export CSV</a>
          </form>
          <p className="mt-4 text-sm text-muted">{creators.length} creators</p>
          <div className="mt-2 overflow-x-auto rounded-2xl border border-border bg-surface">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b border-border text-xs uppercase text-muted">
                <tr>{["Date", "Name", "Niche", "Links", "Followers", "City", "Preference", "Contact"].map((h) => <th key={h} className="px-4 py-3">{h}</th>)}</tr>
              </thead>
              <tbody>
                {creators.map((c) => (
                  <tr key={c.id} className="border-b border-border align-top last:border-0">
                    <td className="whitespace-nowrap px-4 py-3">{new Date(c.created_at).toLocaleDateString("en-IN")}</td>
                    <td className="px-4 py-3 font-medium">{c.full_name}<div className="text-xs font-normal text-muted">{c.email}</div></td>
                    <td className="px-4 py-3">{c.primary_niche}</td>
                    <td className="px-4 py-3"><PlatformLinks c={c} /></td>
                    <td className="px-4 py-3">{c.instagram_followers ? compact(c.instagram_followers) : "—"}</td>
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
      )}

      {tab === "brands" && (
        <div className="mt-5 overflow-x-auto rounded-2xl border border-border bg-surface">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-border text-xs uppercase text-muted">
              <tr>{["Date", "Brand", "Contact", "Goal", "Budget", "Timeline", "Platforms", "Reach out"].map((h) => <th key={h} className="px-4 py-3">{h}</th>)}</tr>
            </thead>
            <tbody>
              {brands.map((b) => (
                <tr key={b.id} className="border-b border-border align-top last:border-0">
                  <td className="whitespace-nowrap px-4 py-3">{new Date(b.created_at).toLocaleDateString("en-IN")}</td>
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

      {tab === "messages" && (
        <div className="mt-5 space-y-3">
          {!emailReady && (
            <p className="rounded-xl border border-border bg-surface p-4 text-sm text-muted">
              Email alerts aren&apos;t set up yet, so new messages only appear here. See the Settings tab.
            </p>
          )}
          {messages.map((m) => {
            const done = m.status === "done";
            const emailed = m.email_status === "sent";
            return (
              <article key={m.id} className={`rounded-2xl border border-border bg-surface p-5 ${done ? "opacity-60" : ""}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{m.name}</p>
                    <p className="text-sm text-muted">
                      <a className="hover:underline" href={`mailto:${m.email}`}>{m.email}</a>
                      {m.phone && <> · <a className="text-green-700 hover:underline" target="_blank" rel="noopener noreferrer" href={whatsappChatUrl(m.phone)}>{m.phone}</a></>}
                    </p>
                  </div>
                  <div className="text-right text-xs text-muted">
                    <p>{new Date(m.created_at).toLocaleString("en-IN")}</p>
                    <p className={emailed ? "text-green-700" : "text-amber-700"} title={m.email_status}>
                      {emailed ? "Emailed to you ✓" : m.email_status === "pending" ? "Email pending…" : "Email not sent"}
                    </p>
                  </div>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm">{m.message}</p>
                {!emailed && m.email_status !== "pending" && <p className="mt-2 text-xs text-amber-700">{m.email_status}</p>}
                <form action={setMessageStatusAction} className="mt-4">
                  <input type="hidden" name="id" value={m.id} />
                  <input type="hidden" name="status" value={done ? "new" : "done"} />
                  <button className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:border-foreground/40">
                    {done ? "Mark as new" : "Mark as done"}
                  </button>
                </form>
              </article>
            );
          })}
          {messages.length === 0 && <p className="rounded-2xl border border-border bg-surface p-10 text-center text-sm text-muted">No messages yet.</p>}
        </div>
      )}

      {tab === "settings" && notify && (
        <div className="mt-5 max-w-xl space-y-6">
          <section className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="text-lg font-semibold">Where support emails are sent</h2>
            <p className="mt-1 text-sm text-muted">
              New contact messages, creator sign-ups and brand enquiries are emailed here. Separate several addresses with commas.
            </p>
            <p className="mt-3 text-sm">
              Currently: <span className="font-medium">{notify.emails.join(", ") || "none"}</span>
              <span className="text-muted"> (from {notify.source})</span>
            </p>
            <form action={saveNotifyEmailsAction} className="mt-4 flex flex-wrap gap-2">
              <input
                name="emails"
                type="text"
                defaultValue={notify.emails.join(", ")}
                placeholder="you@example.com, partner@example.com"
                className="h-10 min-w-0 flex-1 rounded-lg border border-border bg-background px-3 text-sm"
                aria-label="Notification email addresses"
              />
              <button className="h-10 rounded-lg bg-foreground px-4 text-sm font-semibold text-background">Save</button>
            </form>
            {sp.saved && <p role="status" className="mt-3 text-sm font-medium text-green-700">Saved.</p>}
            {sp.error === "invalid" && <p role="alert" className="mt-3 text-sm font-medium text-red-600">Enter 1 to 5 valid email addresses.</p>}
          </section>

          <section className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="text-lg font-semibold">Email check</h2>
            <p className={`mt-2 text-sm font-medium ${emailReady ? "text-green-700" : "text-amber-700"}`}>
              {emailReady ? "Email sending is set up." : "Email sending is not set up yet."}
            </p>
            {!emailReady && (
              <p className="mt-1 text-sm text-muted">
                Add RESEND_API_KEY and RESEND_FROM_EMAIL to the site&apos;s environment variables. Until then, messages are saved here but not emailed.
              </p>
            )}
            <form action={sendTestEmailAction} className="mt-4">
              <button className="rounded-lg border border-border px-4 py-2 text-sm font-semibold hover:border-foreground/40">Send a test email</button>
            </form>
            {sp.test === "ok" && <p role="status" className="mt-3 text-sm font-medium text-green-700">Test email sent. Check the inbox (and spam).</p>}
            {sp.test === "failed" && <p role="alert" className="mt-3 text-sm font-medium text-red-600">Couldn&apos;t send: {sp.reason}</p>}
          </section>
        </div>
      )}
    </div>
  );
}
