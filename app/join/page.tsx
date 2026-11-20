import type { Metadata } from "next";
import { CreatorForm } from "@/components/creator-form";
import { creatorSteps, site } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Join as a creator",
  description: `Join the ${site.brand} creator network. Free to join. Get matched with paid brand collaborations in your niche.`,
};

export default function JoinPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-14">
      <h1 className="text-4xl font-bold sm:text-5xl">Join our creator network</h1>
      <p className="mt-4 text-lg text-muted">
        Free to join. Fill the form once and we&apos;ll match you with brand collaborations that fit your niche and audience.
      </p>

      <ol className="mt-8 grid gap-3 sm:grid-cols-2">
        {creatorSteps.map((s, i) => (
          <li key={s.title} className="rounded-xl border border-border bg-surface p-4 text-sm">
            <span className="font-semibold">{i + 1}. {s.title}</span>
            <p className="mt-1 text-muted">{s.text}</p>
          </li>
        ))}
      </ol>
      <p className="mt-4 text-sm text-muted">
        We can&apos;t promise a collaboration for every profile, and we will never ask you for money to join.
      </p>

      <div className="mt-10">
        <CreatorForm />
      </div>
    </div>
  );
}
