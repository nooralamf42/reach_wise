import type { Metadata } from "next";
import { site } from "@/lib/site-config";

export const metadata: Metadata = { title: "Privacy policy" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-5 px-5 py-16 text-sm leading-relaxed text-muted">
      <h1 className="text-4xl font-bold text-foreground">Privacy policy</h1>
      <p>{/* TODO: have this reviewed before launch */}This is a starter policy for {site.brand}. Replace with reviewed text before launch.</p>
      <h2 className="text-lg font-semibold text-foreground">What we collect</h2>
      <p>Details you submit through our forms: name, contact details, location, social profiles and audience stats (creators), and company and campaign details (brands).</p>
      <h2 className="text-lg font-semibold text-foreground">How we use it</h2>
      <p>To review applications, match creators with brand briefs, and contact you. With creator consent, we share a creator&apos;s profile with brands considering them for a campaign. We do not sell personal data.</p>
      <h2 className="text-lg font-semibold text-foreground">Storage and deletion</h2>
      <p>Data is stored with our database provider and accessible only to the {site.brand} team. To have your data removed, email <a className="underline" href={`mailto:${site.email}`}>{site.email}</a>.</p>
    </div>
  );
}
