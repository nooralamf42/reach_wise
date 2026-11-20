import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = { title: "Get started" };

const roles = [
  {
    href: "/join",
    tag: "For creators",
    title: "Get paid to make content for brands",
    points: ["Join free in about 3 minutes", "Get matched to briefs in your niche", "Create, deliver and get paid"],
    cta: "Continue as a creator",
  },
  {
    href: "/brands",
    tag: "For brands",
    title: "Find creators to promote your products",
    points: ["Share a short brief", "Get a vetted shortlist in 48 hours", "We manage the campaign and report results"],
    cta: "Continue as a brand",
  },
];

export default function StartPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-14">
      <h1 className="text-center text-3xl font-bold sm:text-4xl">How will you use us?</h1>
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {roles.map((r) => (
          <Link key={r.href} href={r.href} className="group flex flex-col rounded-2xl border border-border bg-surface p-7 transition hover:-translate-y-0.5 hover:border-foreground/40">
            <span className="text-xs font-semibold text-accent-dark">{r.tag}</span>
            <h2 className="mt-3 text-2xl font-semibold leading-tight">{r.title}</h2>
            <ul className="mt-4 space-y-1.5 text-sm text-muted">
              {r.points.map((p) => <li key={p}>{p}</li>)}
            </ul>
            <span className="mt-8 inline-flex items-center gap-2 text-sm font-semibold">
              {r.cta} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
