"use client";

import { useState } from "react";
import { useForm, useWatch, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
import { creatorSchema, type CreatorInput, type CreatorData } from "@/lib/schemas";
import { AGE_RANGES, COLLAB_PREFS, CONTENT_TYPES, LANGUAGES, NICHES } from "@/lib/options";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChipGroup, Field, Select, Textarea } from "@/components/form-ui";
import { StepCard, StepProgress } from "@/components/steps";
import { ProfilePreview } from "@/components/profile-preview";
import { site } from "@/lib/site-config";

type Key = keyof CreatorInput;

// Fields per screen, so "Continue" validates only what's on screen.
const STEPS: Key[][] = [
  ["fullName"],
  ["email", "phone"],
  ["city", "ageRange"],
  ["primaryNiche", "languages", "contentTypes"],
  ["instagramHandle", "instagramFollowers"],
  ["collabPreference", "consent"],
];

export function CreatorForm() {
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [serverError, setServerError] = useState("");

  const {
    register, handleSubmit, control, trigger, formState: { errors },
  } = useForm<CreatorInput, unknown, CreatorData>({
    resolver: zodResolver(creatorSchema),
    defaultValues: { languages: [], otherCategories: [], contentTypes: [] },
  });

  const [name, city, niche, handle, followers, languages] = useWatch({
    control,
    name: ["fullName", "city", "primaryNiche", "instagramHandle", "instagramFollowers", "languages"],
  });

  const last = step === STEPS.length - 1;

  function goTo(n: number) {
    setStep(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function onSubmit(values: CreatorData) {
    setStatus("sending");
    setServerError("");
    try {
      const res = await fetch("/api/creators", {
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

  // A late error on an earlier screen sends the person back to it.
  function onInvalid(errs: FieldErrors<CreatorInput>) {
    const first = STEPS.findIndex((fields) => fields.some((f) => errs[f]));
    if (first >= 0) goTo(first);
  }

  if (status === "done") {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-border bg-surface p-8 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-green-600" />
        <h2 className="mt-4 text-2xl font-semibold">You&apos;re in the pool!</h2>
        <p className="mx-auto mt-2 max-w-md text-muted">
          We review every profile. If a brand brief fits your niche and audience, we&apos;ll message you on WhatsApp or email.
        </p>
        {site.communityUrl && (
          <Button asChild className="mt-6"><a href={site.communityUrl}>Join the creator community</a></Button>
        )}
      </div>
    );
  }

  const e = (k: Key) => errors[k]?.message as string | undefined;

  return (
    <div className="grid gap-6 lg:grid-cols-[18rem_1fr] lg:items-start">
      <div className="hidden lg:block">
        <ProfilePreview data={{ name, city, niche, handle, followers, languages }} />
      </div>

      <form
        noValidate
        className="rounded-2xl border border-border bg-surface p-5 sm:p-7"
        onSubmit={(ev) => {
          ev.preventDefault();
          if (last) void handleSubmit(onSubmit, onInvalid)(ev);
          else void trigger(STEPS[step]).then((ok) => ok && goTo(step + 1));
        }}
      >
        {/* Honeypot: hidden from people, bots fill it */}
        <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" {...register("website")} />

        <StepProgress total={STEPS.length} current={step} onBack={() => goTo(step - 1)} />

        {step === 0 && (
          <StepCard title="What should brands call you?" hint="This shows on your profile.">
            <Field label="Full name" required error={e("fullName")}><Input placeholder="Your name" autoFocus {...register("fullName")} /></Field>
          </StepCard>
        )}

        {step === 1 && (
          <StepCard title="How can we reach you?" hint="We only use this to send you brand collaborations.">
            <Field label="Email" required error={e("email")}><Input type="email" placeholder="you@email.com" autoFocus {...register("email")} /></Field>
            <Field label="Phone / WhatsApp" required error={e("phone")}><Input type="tel" placeholder="98XXXXXXXX" {...register("phone")} /></Field>
          </StepCard>
        )}

        {step === 2 && (
          <StepCard title="Where are you based?" hint="Brands often look for local creators.">
            <Field label="City" required error={e("city")}><Input placeholder="e.g. Lucknow" autoFocus {...register("city")} /></Field>
            <Field label="Age range" required error={e("ageRange")}><Select options={AGE_RANGES} {...register("ageRange")} /></Field>
          </StepCard>
        )}

        {step === 3 && (
          <StepCard title="What do you create?" hint="Brands search by niche, so be specific.">
            <Field label="Main niche" required error={e("primaryNiche")}><Select options={NICHES} {...register("primaryNiche")} /></Field>
            <Field label="Languages" required error={e("languages")}><ChipGroup control={control} name="languages" options={LANGUAGES} /></Field>
            <Field label="Content you make" required error={e("contentTypes")}><ChipGroup control={control} name="contentTypes" options={CONTENT_TYPES} /></Field>
            <details className="rounded-xl border border-border bg-background p-4">
              <summary className="cursor-pointer text-sm font-semibold">Other categories you cover (optional)</summary>
              <div className="mt-3"><ChipGroup control={control} name="otherCategories" options={NICHES} max={5} /></div>
            </details>
          </StepCard>
        )}

        {step === 4 && (
          <StepCard title="Where do you post?" hint="Instagram is required. Other platforms are optional.">
            <Field label="Instagram handle" required error={e("instagramHandle")}><Input placeholder="@yourhandle" autoFocus {...register("instagramHandle")} /></Field>
            <Field label="Instagram followers" required error={e("instagramFollowers")} hint="e.g. 12500 or 12.5K"><Input placeholder="12.5K" {...register("instagramFollowers")} /></Field>
            <details className="rounded-xl border border-border bg-background p-4">
              <summary className="cursor-pointer text-sm font-semibold">Add more stats and platforms (optional)</summary>
              <div className="mt-4 space-y-4">
                <Field label="Average reel views" error={e("avgReelViews")}><Input placeholder="e.g. 8K" {...register("avgReelViews")} /></Field>
                <Field label="Engagement rate (%)" error={e("engagementRate")}><Input placeholder="e.g. 4.2" {...register("engagementRate")} /></Field>
                <Field label="YouTube channel link" error={e("youtubeUrl")}><Input placeholder="youtube.com/@channel" {...register("youtubeUrl")} /></Field>
                <Field label="YouTube subscribers" error={e("youtubeSubscribers")}><Input placeholder="e.g. 3K" {...register("youtubeSubscribers")} /></Field>
                <Field label="Facebook" error={e("facebookUrl")}><Input placeholder="facebook.com/…" {...register("facebookUrl")} /></Field>
                <Field label="X (Twitter) handle" error={e("xHandle")}><Input placeholder="@handle" {...register("xHandle")} /></Field>
                <Field label="LinkedIn" error={e("linkedinUrl")}><Input placeholder="linkedin.com/in/…" {...register("linkedinUrl")} /></Field>
                <Field label="Snapchat handle" error={e("snapchatHandle")}><Input placeholder="@handle" {...register("snapchatHandle")} /></Field>
                <Field label="Other (ShareChat, Moj, blog…)" error={e("otherPlatform")}><Input placeholder="Name and link" {...register("otherPlatform")} /></Field>
              </div>
            </details>
          </StepCard>
        )}

        {step === 5 && (
          <StepCard title="Last bit" hint="Rates and past work help us match you faster." last sending={status === "sending"} submitLabel="Submit my profile">
            <Field label="Work you accept" required error={e("collabPreference")}><Select options={COLLAB_PREFS} {...register("collabPreference")} /></Field>
            <details className="rounded-xl border border-border bg-background p-4">
              <summary className="cursor-pointer text-sm font-semibold">Rates and past work (optional)</summary>
              <div className="mt-4 space-y-4">
                <Field label="Minimum rate per reel (₹)" error={e("minRate")}><Input placeholder="e.g. 3000" {...register("minRate")} /></Field>
                <Field label="Portfolio / media kit link" error={e("portfolioUrl")}><Input placeholder="Drive, Notion or website link" {...register("portfolioUrl")} /></Field>
                <Field label="Brands you've worked with" error={e("pastBrands")}><Textarea placeholder="e.g. Brand A (reel), Brand B (UGC)" {...register("pastBrands")} /></Field>
                <Field label="Anything else?" error={e("about")}><Textarea placeholder="Your style, audience, achievements…" {...register("about")} /></Field>
              </div>
            </details>
            <label className="flex items-start gap-3 text-sm text-muted">
              <input type="checkbox" className="mt-1 h-4 w-4 accent-[var(--accent)]" {...register("consent")} />
              <span>
                I confirm the details are accurate and I agree that {site.brand} may contact me about collaborations and share my profile with brands.
                {errors.consent && <span className="mt-1 block text-xs font-medium text-red-600">{errors.consent.message as string}</span>}
              </span>
            </label>
          </StepCard>
        )}

        {serverError && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">{serverError}</p>}
      </form>
    </div>
  );
}
