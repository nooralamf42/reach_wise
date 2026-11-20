import Link from "next/link";
import { site } from "@/lib/site-config";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href="/" className="font-display text-xl font-bold">
          {site.brand}
          <span className="text-accent">.</span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-medium text-muted md:flex">
          <Link href="/#services" className="hover:text-foreground">Services</Link>
          <Link href="/#how" className="hover:text-foreground">How it works</Link>
          <Link href="/#founders" className="hover:text-foreground">Founders</Link>
          <Link href="/contact" className="hover:text-foreground">Contact</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/join" className="hidden h-9 items-center rounded-xl border border-border bg-surface px-4 text-xs font-semibold hover:border-foreground/40 sm:inline-flex">
            Join as creator
          </Link>
          <Link href="/brands" className="inline-flex h-9 items-center rounded-xl bg-foreground px-4 text-xs font-semibold text-background hover:bg-accent">
            Hire creators
          </Link>
        </div>
      </div>
    </header>
  );
}
