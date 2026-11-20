"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2 } from "lucide-react";
import { creatorSchema, type CreatorInput, type CreatorData } from "@/lib/schemas";
import { AGE_RANGES, COLLAB_PREFS, CONTENT_TYPES, LANGUAGES, NICHES } from "@/lib/options";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChipGroup, Field, Section, Select, Textarea } from "@/components/form-ui";
import { site } from "@/lib/site-config";

export function CreatorForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [serverError, setServerError] = useState("");

  const {
    register, handleSubmit, control, formState: { errors },
  } = useForm<CreatorInput, unknown, CreatorData>({
    resolver: zodResolver(creatorSchema),
    defaultValues: { languages: [], otherCategories: [], contentTypes: [] },
  });

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

  if (status === "done") {
    return (
      <div className="rounded-2xl border border-border bg-surface p-8 text-center">
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

  const e = (k: keyof CreatorInput) => errors[k]?.message as string | undefined;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {/* Honeypot: hidden from people, bots fill it */}
      <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" {...register("website")} />

      <Section title="About you">
        <Field label="Full name" required error={e("fullName")}><Input placeholder="Your name" {...register("fullName")} /></Field>
        <Field label="Email" required error={e("email")}><Input type="email" placeholder="you@email.com" {...register("email")} /></Field>
        <Field label="Phone / WhatsApp number" required error={e("phone")} hint="Include country code if outside India."><Input type="tel" placeholder="98XXXXXXXX" {...register("phone")} /></Field>
        <Field label="City" required error={e("city")}><Input placeholder="e.g. Lucknow" {...register("city")} /></Field>
        <Field label="State" error={e("state")}><Input placeholder="e.g. Uttar Pradesh" {...register("state")} /></Field>
        <Field label="Age range" required error={e("ageRange")}><Select options={AGE_RANGES} {...register("ageRange")} /></Field>
        <Field label="Gender (optional)" error={e("gender")}><Select options={["Female", "Male", "Other", "Prefer not to say"]} {...register("gender")} /></Field>
        <Field label="Languages you create in" required full error={e("languages")}><ChipGroup control={control} name="languages" options={LANGUAGES} /></Field>
      </Section>

      <Section title="Niche & content" hint="Brands search by niche, so be specific.">
        <Field label="Main niche" required error={e("primaryNiche")}><Select options={NICHES} {...register("primaryNiche")} /></Field>
        <Field label="Collaboration preference" required error={e("collabPreference")}><Select options={COLLAB_PREFS} {...register("collabPreference")} /></Field>
        <Field label="Other categories you cover (up to 5)" full error={e("otherCategories")}><ChipGroup control={control} name="otherCategories" options={NICHES} max={5} /></Field>
        <Field label="Content you create" required full error={e("contentTypes")}><ChipGroup control={control} name="contentTypes" options={CONTENT_TYPES} /></Field>
      </Section>

      <Section title="Social profiles" hint="Instagram is required. Add the others you use.">
        <Field label="Instagram handle" required error={e("instagramHandle")}><Input placeholder="@yourhandle" {...register("instagramHandle")} /></Field>
        <Field label="Instagram followers" required error={e("instagramFollowers")} hint="e.g. 12500 or 12.5K"><Input inputMode="text" placeholder="12.5K" {...register("instagramFollowers")} /></Field>
        <Field label="Average reel views" error={e("avgReelViews")}><Input placeholder="e.g. 8K" {...register("avgReelViews")} /></Field>
        <Field label="Engagement rate (%)" error={e("engagementRate")} hint="Optional. Leave blank if unsure."><Input placeholder="e.g. 4.2" {...register("engagementRate")} /></Field>
        <Field label="YouTube channel link" error={e("youtubeUrl")}><Input placeholder="youtube.com/@channel" {...register("youtubeUrl")} /></Field>
        <Field label="YouTube subscribers" error={e("youtubeSubscribers")}><Input placeholder="e.g. 3K" {...register("youtubeSubscribers")} /></Field>
        <Field label="Facebook page / profile" error={e("facebookUrl")}><Input placeholder="facebook.com/…" {...register("facebookUrl")} /></Field>
        <Field label="X (Twitter) handle" error={e("xHandle")}><Input placeholder="@handle" {...register("xHandle")} /></Field>
        <Field label="LinkedIn" error={e("linkedinUrl")}><Input placeholder="linkedin.com/in/…" {...register("linkedinUrl")} /></Field>
        <Field label="Snapchat handle" error={e("snapchatHandle")}><Input placeholder="@handle" {...register("snapchatHandle")} /></Field>
        <Field label="Other platform (ShareChat, Moj, blog…)" full error={e("otherPlatform")}><Input placeholder="Name and link" {...register("otherPlatform")} /></Field>
      </Section>

      <Section title="Work & rates">
        <Field label="Minimum rate per reel (₹)" error={e("minRate")} hint="Optional. Helps us match you to the right budgets."><Input placeholder="e.g. 3000" {...register("minRate")} /></Field>
        <Field label="Portfolio / media kit link" error={e("portfolioUrl")}><Input placeholder="Drive, Notion or website link" {...register("portfolioUrl")} /></Field>
        <Field label="Brands you've worked with" full error={e("pastBrands")}><Textarea placeholder="e.g. Brand A (reel), Brand B (UGC)" {...register("pastBrands")} /></Field>
        <Field label="Anything else we should know?" full error={e("about")}><Textarea placeholder="Your style, audience, achievements…" {...register("about")} /></Field>
      </Section>

      <label className="flex items-start gap-3 text-sm text-muted">
        <input type="checkbox" className="mt-1 h-4 w-4 accent-[var(--accent)]" {...register("consent")} />
        <span>
          I confirm the details are accurate and I agree that {site.brand} may contact me about collaborations and share my profile with brands.
          {errors.consent && <span className="mt-1 block text-xs font-medium text-red-600">{errors.consent.message as string}</span>}
        </span>
      </label>

      {serverError && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">{serverError}</p>}

      <Button type="submit" variant="accent" size="lg" className="w-full sm:w-auto" disabled={status === "sending"}>
        {status === "sending" && <Loader2 className="h-4 w-4 animate-spin" />}
        {status === "sending" ? "Submitting…" : "Submit my profile"}
      </Button>
    </form>
  );
}
