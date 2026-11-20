"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2 } from "lucide-react";
import { brandSchema, type BrandInput, type BrandData } from "@/lib/schemas";
import { BUDGETS, GOALS, NICHES, PLATFORMS, TIMELINES } from "@/lib/options";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChipGroup, Field, Section, Select, Textarea } from "@/components/form-ui";

export function BrandForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [serverError, setServerError] = useState("");

  const { register, handleSubmit, control, formState: { errors } } = useForm<BrandInput, unknown, BrandData>({
    resolver: zodResolver(brandSchema),
    defaultValues: { platforms: [] },
  });

  async function onSubmit(values: BrandData) {
    setStatus("sending");
    setServerError("");
    try {
      const res = await fetch("/api/brands", {
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
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setServerError("Network error. Please check your connection and try again.");
      setStatus("idle");
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-2xl border border-border bg-surface p-8 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-green-600" />
        <h2 className="mt-4 text-2xl font-semibold">Brief received</h2>
        <p className="mx-auto mt-2 max-w-md text-muted">Thanks! We&apos;ll review it and get back to you within 48 hours with a creator shortlist.</p>
      </div>
    );
  }

  const e = (k: keyof BrandInput) => errors[k]?.message as string | undefined;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" {...register("website")} />

      <Section title="About your brand">
        <Field label="Brand / company name" required error={e("companyName")}><Input {...register("companyName")} /></Field>
        <Field label="Website or Instagram" error={e("websiteUrl")}><Input placeholder="yourbrand.com" {...register("websiteUrl")} /></Field>
        <Field label="Industry" required error={e("industry")}><Select options={NICHES} {...register("industry")} /></Field>
        <Field label="Your name" required error={e("contactName")}><Input {...register("contactName")} /></Field>
        <Field label="Your role" error={e("role")}><Input placeholder="e.g. Founder, Marketing Manager" {...register("role")} /></Field>
        <Field label="Work email" required error={e("email")}><Input type="email" {...register("email")} /></Field>
        <Field label="Phone / WhatsApp" required error={e("phone")}><Input type="tel" {...register("phone")} /></Field>
      </Section>

      <Section title="Your campaign">
        <Field label="Main goal" required error={e("goal")}><Select options={GOALS} {...register("goal")} /></Field>
        <Field label="Budget range" required error={e("budget")}><Select options={BUDGETS} {...register("budget")} /></Field>
        <Field label="When do you want to start?" required error={e("timeline")}><Select options={TIMELINES} {...register("timeline")} /></Field>
        <Field label="Platforms" required full error={e("platforms")}><ChipGroup control={control} name="platforms" options={PLATFORMS} /></Field>
        <Field label="Tell us more" full error={e("notes")}><Textarea placeholder="Product, target audience, creator type you have in mind…" {...register("notes")} /></Field>
      </Section>

      {serverError && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">{serverError}</p>}

      <Button type="submit" variant="accent" size="lg" className="w-full sm:w-auto" disabled={status === "sending"}>
        {status === "sending" && <Loader2 className="h-4 w-4 animate-spin" />}
        {status === "sending" ? "Sending…" : "Send my brief"}
      </Button>
    </form>
  );
}
