"use client";

import { useState } from "react";
import { useForm, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
import { brandSchema, type BrandInput, type BrandData } from "@/lib/schemas";
import { BUDGETS, GOALS, NICHES, PLATFORMS, TIMELINES } from "@/lib/options";
import { Input } from "@/components/ui/input";
import { ChipGroup, Field, Select, Textarea } from "@/components/form-ui";
import { StepCard, StepProgress } from "@/components/steps";

type Key = keyof BrandInput;

const STEPS: Key[][] = [
  ["companyName", "industry"],
  ["contactName", "email", "phone"],
  ["goal", "budget", "timeline", "platforms"],
];

export function BrandForm() {
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [serverError, setServerError] = useState("");

  const { register, handleSubmit, control, trigger, formState: { errors } } = useForm<BrandInput, unknown, BrandData>({
    resolver: zodResolver(brandSchema),
    defaultValues: { platforms: [] },
  });

  const last = step === STEPS.length - 1;

  function goTo(n: number) {
    setStep(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

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

  function onInvalid(errs: FieldErrors<BrandInput>) {
    const first = STEPS.findIndex((fields) => fields.some((f) => errs[f]));
    if (first >= 0) goTo(first);
  }

  if (status === "done") {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-border bg-surface p-8 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-green-600" />
        <h2 className="mt-4 text-2xl font-semibold">Brief received</h2>
        <p className="mx-auto mt-2 max-w-md text-muted">Thanks! We&apos;ll review it and get back to you within 48 hours with a creator shortlist.</p>
      </div>
    );
  }

  const e = (k: Key) => errors[k]?.message as string | undefined;

  return (
    <form
      noValidate
      className="mx-auto max-w-lg rounded-2xl border border-border bg-surface p-5 sm:p-7"
      onSubmit={(ev) => {
        ev.preventDefault();
        if (last) void handleSubmit(onSubmit, onInvalid)(ev);
        else void trigger(STEPS[step]).then((ok) => ok && goTo(step + 1));
      }}
    >
      <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" {...register("website")} />

      <StepProgress total={STEPS.length} current={step} onBack={() => goTo(step - 1)} />

      {step === 0 && (
        <StepCard title="Tell us about your brand" hint="So we can find creators that fit.">
          <Field label="Brand / company name" required error={e("companyName")}><Input autoFocus {...register("companyName")} /></Field>
          <Field label="Industry" required error={e("industry")}><Select options={NICHES} {...register("industry")} /></Field>
          <Field label="Website or Instagram (optional)" error={e("websiteUrl")}><Input placeholder="yourbrand.com" {...register("websiteUrl")} /></Field>
        </StepCard>
      )}

      {step === 1 && (
        <StepCard title="Who should we talk to?" hint="We'll send your creator shortlist here.">
          <Field label="Your name" required error={e("contactName")}><Input autoFocus {...register("contactName")} /></Field>
          <Field label="Work email" required error={e("email")}><Input type="email" {...register("email")} /></Field>
          <Field label="Phone / WhatsApp" required error={e("phone")}><Input type="tel" {...register("phone")} /></Field>
          <Field label="Your role (optional)" error={e("role")}><Input placeholder="e.g. Founder, Marketing Manager" {...register("role")} /></Field>
        </StepCard>
      )}

      {step === 2 && (
        <StepCard title="What do you want to achieve?" hint="A rough idea is fine." last sending={status === "sending"} submitLabel="Send my brief">
          <Field label="Main goal" required error={e("goal")}><Select options={GOALS} {...register("goal")} /></Field>
          <Field label="Budget range" required error={e("budget")}><Select options={BUDGETS} {...register("budget")} /></Field>
          <Field label="When do you want to start?" required error={e("timeline")}><Select options={TIMELINES} {...register("timeline")} /></Field>
          <Field label="Platforms" required error={e("platforms")}><ChipGroup control={control} name="platforms" options={PLATFORMS} /></Field>
          <Field label="Anything else? (optional)" error={e("notes")}><Textarea placeholder="Product, target audience, creator type you have in mind…" {...register("notes")} /></Field>
        </StepCard>
      )}

      {serverError && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">{serverError}</p>}
    </form>
  );
}
