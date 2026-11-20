import type { Metadata } from "next";
import { MessageCircle, Phone } from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import { site } from "@/lib/site-config";

export const metadata: Metadata = { title: "Contact us" };

export default function ContactPage() {
  const direct = [
    site.phone ? { icon: Phone, label: "Phone", value: site.phone, href: `tel:${site.phone.replace(/\s/g, "")}` } : null,
    site.whatsappNumber ? { icon: MessageCircle, label: "WhatsApp", value: "Chat with us", href: `https://wa.me/${site.whatsappNumber}` } : null,
  ].filter((i): i is NonNullable<typeof i> => Boolean(i));

  return (
    <div className="mx-auto max-w-xl px-5 py-14">
      <h1 className="text-3xl font-bold sm:text-4xl">Contact us</h1>
      <p className="mt-2 text-muted">Send us a message and we&apos;ll get back to you, usually within one working day.</p>

      <div className="mt-8">
        <ContactForm />
      </div>

      {direct.length > 0 && (
        <div className="mt-6 space-y-3">
          {direct.map(({ icon: Icon, label, value, href }) => (
            <a key={label} href={href} className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-4 hover:border-foreground/40">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground/5"><Icon className="h-5 w-5" /></span>
              <span>
                <span className="block text-xs text-muted">{label}</span>
                <span className="font-medium">{value}</span>
              </span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
