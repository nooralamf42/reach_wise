import Link from "next/link";
import { site } from "@/lib/site-config";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:grid-cols-3">
        <div>
          <p className="font-display text-lg font-bold">{site.brand}<span className="text-accent">.</span></p>
          <p className="mt-2 max-w-xs text-sm text-muted">{site.tagline}</p>
        </div>
        <div className="text-sm">
          <p className="mb-3 font-semibold">Explore</p>
          <ul className="space-y-2 text-muted">
            <li><Link href="/brands" className="hover:text-foreground">For brands</Link></li>
            <li><Link href="/join" className="hover:text-foreground">For creators</Link></li>
            <li><Link href="/contact" className="hover:text-foreground">Contact</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="mb-3 font-semibold">Legal</p>
          <ul className="space-y-2 text-muted">
            <li><Link href="/privacy" className="hover:text-foreground">Privacy policy</Link></li>
            <li><Link href="/terms" className="hover:text-foreground">Terms</Link></li>
            <li><Link href="/contact" className="hover:text-foreground">Contact us</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-5 text-center text-xs text-muted">
        © {new Date().getFullYear()} {site.brand}. All rights reserved.
      </div>
    </footer>
  );
}
