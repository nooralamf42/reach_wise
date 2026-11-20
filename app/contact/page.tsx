import type { Metadata } from "next";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { site } from "@/lib/site-config";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  const items = [
    { icon: Mail, label: "Email", value: site.email, href: `mailto:${site.email}` },
    site.phone ? { icon: Phone, label: "Phone", value: site.phone, href: `tel:${site.phone.replace(/\s/g, "")}` } : null,
    site.whatsappNumber ? { icon: MessageCircle, label: "WhatsApp", value: "Chat with us", href: `https://wa.me/${site.whatsappNumber}` } : null,
  ].filter((i): i is NonNullable<typeof i> => Boolean(i));

  return (
    <div className="mx-auto max-w-2xl px-5 py-16">
      <h1 className="text-4xl font-bold">Contact us</h1>
      <p className="mt-3 text-muted">We usually reply within one working day.</p>
      <div className="mt-8 space-y-3">
        {items.map(({ icon: Icon, label, value, href }) => (
          <a key={label} href={href} className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-5 hover:border-foreground/40">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground/5"><Icon className="h-5 w-5" /></span>
            <span>
              <span className="block text-xs text-muted">{label}</span>
              <span className="font-medium">{value}</span>
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
