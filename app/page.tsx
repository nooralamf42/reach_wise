import Image from "next/image";
import Link from "next/link";
import { ArrowRight, AtSign } from "lucide-react";
import { brandSteps, creatorSteps, faqs, founders, services, site } from "@/lib/site-config";
import { compact, getPublicStats } from "@/lib/stats";

export const revalidate = 300;

function Steps({ title, items, cta }: { title: string; items: { title: string; text: string }[]; cta: { href: string; label: string } }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
      <h3 className="text-xl font-semibold">{title}</h3>
      <ol className="mt-6 space-y-5">
        {items.map((s, i) => (
          <li key={s.title} className="flex gap-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-ink text-sm font-bold text-accent-dark">{i + 1}</span>
            <div>
              <p className="font-semibold">{s.title}</p>
              <p className="text-sm text-muted">{s.text}</p>
            </div>
          </li>
        ))}
      </ol>
      <Link href={cta.href} className="mt-7 inline-flex h-11 items-center gap-2 rounded-xl bg-foreground px-6 text-sm font-semibold text-background hover:bg-accent">
        {cta.label} <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

export default async function Home() {
  const stats = await getPublicStats();
  const proof = [
    { value: "132K+", label: "Combined founder following" },
    { value: stats.creators > 0 ? String(stats.creators) : "Now open", label: stats.creators > 0 ? "Creators in our network" : "Creator network enrolment" },
    { value: stats.niches > 0 ? String(stats.niches) : "15+", label: stats.niches > 0 ? "Niches covered" : "Niches we cover" },
    { value: stats.reach > 0 ? compact(stats.reach) : "48h", label: stats.reach > 0 ? "Instagram reach in network" : "Brief to creator shortlist" },
  ];

  return (
    <>
      <section className="mx-auto max-w-6xl px-5 pb-16 pt-16 sm:pt-24">
        <p className="mb-4 inline-flex rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted">
          Run by working creators, not a faceless agency
        </p>
        <h1 className="max-w-3xl text-4xl font-bold leading-[1.05] sm:text-6xl">
          Brands and creators, <span className="text-accent">matched properly.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted">{site.description}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/brands" className="inline-flex h-14 items-center gap-2 rounded-xl bg-accent px-8 text-base font-semibold text-white hover:bg-accent-dark">
            Hire creators <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/join" className="inline-flex h-14 items-center rounded-xl border border-border bg-surface px-8 text-base font-semibold hover:border-foreground/40">
            Join as a creator
          </Link>
        </div>
      </section>

      <section className="border-y border-border bg-surface">
        <dl className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-5 py-8 md:grid-cols-4">
          {proof.map((p) => (
            <div key={p.label}>
              <dt className="sr-only">{p.label}</dt>
              <dd className="font-display text-3xl font-bold">{p.value}</dd>
              <p className="mt-1 text-sm text-muted">{p.label}</p>
            </div>
          ))}
        </dl>
      </section>

      <section id="services" className="mx-auto max-w-6xl scroll-mt-20 px-5 pt-20">
        <h2 className="text-3xl font-bold sm:text-4xl">What we do</h2>
        <p className="mt-3 max-w-xl text-muted">Everything a brand needs to work with creators, in one place.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <div key={s.title} className="rounded-2xl border border-border bg-surface p-6">
              <h3 className="text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="how" className="mx-auto max-w-6xl scroll-mt-20 px-5 pt-20">
        <h2 className="text-3xl font-bold sm:text-4xl">How it works</h2>
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <Steps title="For brands" items={brandSteps} cta={{ href: "/brands", label: "Send a brief" }} />
          <Steps title="For creators" items={creatorSteps} cta={{ href: "/join", label: "Join the network" }} />
        </div>
      </section>

      <section id="founders" className="mx-auto max-w-6xl scroll-mt-20 px-5 pt-20">
        <h2 className="text-3xl font-bold sm:text-4xl">Meet the founders</h2>
        <p className="mt-3 max-w-xl text-muted">We create and sell online ourselves. We know what brands need and what creators deserve.</p>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {founders.map((f) => (
            <article key={f.id} className="flex gap-5 rounded-2xl border border-border bg-surface p-5">
              <Image src={f.photo} alt={f.name} width={112} height={112} className="h-28 w-28 shrink-0 rounded-2xl object-cover" />
              <div>
                <h3 className="text-xl font-semibold">{f.name}</h3>
                <a href={f.url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-accent-dark hover:underline">
                  <AtSign className="h-4 w-4" /> {f.handle} · {f.followers}
                </a>
                <p className="mt-2 text-sm text-muted">{f.bio}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-3xl px-5 pt-20">
        <h2 className="text-3xl font-bold sm:text-4xl">Questions</h2>
        <div className="mt-6 divide-y divide-border rounded-2xl border border-border bg-surface">
          {faqs.map((f) => (
            <details key={f.q} className="group p-5">
              <summary className="cursor-pointer list-none font-semibold marker:hidden">{f.q}</summary>
              <p className="mt-2 text-sm text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-20 max-w-6xl px-5">
        <div className="rounded-3xl bg-foreground px-6 py-12 text-center text-background sm:px-12">
          <h2 className="text-3xl font-bold sm:text-4xl">Ready to start?</h2>
          <p className="mx-auto mt-3 max-w-lg text-background/70">Whether you run a brand or create content, it takes a few minutes.</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/brands" className="inline-flex h-12 items-center rounded-xl bg-accent px-7 text-sm font-semibold text-white hover:bg-accent-dark">Hire creators</Link>
            <Link href="/join" className="inline-flex h-12 items-center rounded-xl bg-background px-7 text-sm font-semibold text-foreground hover:bg-accent-ink">Join as creator</Link>
          </div>
        </div>
      </section>
    </>
  );
}
