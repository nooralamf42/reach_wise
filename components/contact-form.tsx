"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2 } from "lucide-react";
import { contactSchema, type ContactInput, type ContactData } from "@/lib/schemas";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field, Textarea } from "@/components/form-ui";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [serverError, setServerError] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm<ContactInput, unknown, ContactData>({
    resolver: zodResolver(contactSchema),
  });

  async function onSubmit(values: ContactData) {
    setStatus("sending");
    setServerError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setServerError(data.error ?? "Something went wrong. Please try again.");
        setStatus("idle");
        return;
      }
      setStatus("done");
    } catch {
      setServerError("Network error. Please check your connection and try again.");
      setStatus("idle");
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-2xl border border-border bg-surface p-8 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-green-600" />
        <h2 className="mt-3 text-xl font-semibold">Message sent</h2>
        <p className="mt-1 text-sm text-muted">Thanks for reaching out. We&apos;ll reply as soon as we can.</p>
      </div>
    );
  }

  const e = (k: keyof ContactInput) => errors[k]?.message as string | undefined;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4 rounded-2xl border border-border bg-surface p-5 sm:p-7">
      <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" {...register("website")} />
      <Field label="Your name" required error={e("name")}><Input autoComplete="name" {...register("name")} /></Field>
      <Field label="Email" required error={e("email")}><Input type="email" autoComplete="email" {...register("email")} /></Field>
      <Field label="Phone / WhatsApp (optional)" error={e("phone")}><Input type="tel" autoComplete="tel" {...register("phone")} /></Field>
      <Field label="How can we help?" required error={e("message")}>
        <Textarea rows={5} placeholder="Tell us what you need…" {...register("message")} />
      </Field>
      {serverError && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">{serverError}</p>}
      <Button type="submit" variant="accent" size="lg" className="w-full" disabled={status === "sending"}>
        {status === "sending" && <Loader2 className="h-4 w-4 animate-spin" />}
        {status === "sending" ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
