import type { Metadata } from "next";
import { BrandForm } from "@/components/brand-form";
import { brandSteps, site } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Hire creators",
  description: `Send ${site.brand} your brief and get a vetted creator shortlist within 48 hours.`,
};

export default function BrandsPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-14">
      <h1 className="text-4xl font-bold sm:text-5xl">Tell us what you want to launch</h1>
      <p className="mt-4 text-lg text-muted">Share your brief and we&apos;ll come back with a vetted creator shortlist and pricing within 48 hours.</p>

      <ol className="mt-8 grid gap-3 sm:grid-cols-2">
        {brandSteps.map((s, i) => (
          <li key={s.title} className="rounded-xl border border-border bg-surface p-4 text-sm">
            <span className="font-semibold">{i + 1}. {s.title}</span>
            <p className="mt-1 text-muted">{s.text}</p>
          </li>
        ))}
      </ol>

      <div className="mt-10">
        <BrandForm />
      </div>
    </div>
  );
}
