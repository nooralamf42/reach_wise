import type { Metadata } from "next";
import { site } from "@/lib/site-config";

export const metadata: Metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-5 px-5 py-16 text-sm leading-relaxed text-muted">
      <h1 className="text-4xl font-bold text-foreground">Terms of use</h1>
      <p>{/* TODO: have this reviewed before launch */}Starter terms for {site.brand}. Replace with reviewed text before launch.</p>
      <h2 className="text-lg font-semibold text-foreground">Creators</h2>
      <p>Joining the network is free and does not guarantee collaborations. Details you submit must be accurate. Campaign scope, deliverables and payment are agreed per project before work begins.</p>
      <h2 className="text-lg font-semibold text-foreground">Brands</h2>
      <p>Submitting a brief is not a binding order. Pricing, deliverables and payment terms are confirmed in writing before a campaign starts.</p>
      <h2 className="text-lg font-semibold text-foreground">Contact</h2>
      <p><a className="underline" href={`mailto:${site.email}`}>{site.email}</a></p>
    </div>
  );
}
