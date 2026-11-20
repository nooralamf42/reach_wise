"use client";

import { useEffect, useState } from "react";
import { useForm, useWatch, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
import {
  creatorSchema, isValidPlatformLink, LINK_FIELD, type CreatorInput, type CreatorData, type PostPlatform,
} from "@/lib/schemas";
import { COLLAB_PREFS, COUNTRIES, GENDERS, LANGUAGES, NICHES, POST_PLATFORMS } from "@/lib/options";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChipGroup, Field, Select, Textarea } from "@/components/form-ui";
import { StepCard, StepProgress } from "@/components/steps";
import { ProfilePreview } from "@/components/profile-preview";
import { site } from "@/lib/site-config";
import { cn } from "@/lib/utils";

type Key = keyof CreatorInput;

// One short question per screen. Fields listed here are validated on "Continue".
const STEPS: Key[][] = [
  ["fullName"],
  ["email", "phone"],
  ["country", "city"],
  ["birthYear"],
  ["gender"],
  ["primaryNiche", "languages"],
  ["platforms"],
  ["instagramUrl", "facebookUrl", "youtubeUrl", "followers"],
  ["collabPreference", "consent"],
];

const ALREADY_JOINED = "You've already joined with this email or phone number. We'll be in touch if a brand fits you.";

const LINK_COPY: Record<PostPlatform, { label: string; placeholder: string }> = {
  Instagram: { label: "Instagram link or @handle", placeholder: "instagram.com/yourname or @yourname" },
  Facebook: { label: "Facebook page or profile link", placeholder: "facebook.com/yourpage" },
  YouTube: { label: "YouTube channel link", placeholder: "youtube.com/@yourchannel" },
};

/** Short burst of confetti from both bottom corners. Skipped for people who prefer less motion. */
function useConfetti(active: boolean) {
  useEffect(() => {
    if (!active || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let cancelled = false;
    void import("canvas-confetti").then(({ default: confetti }) => {
      if (cancelled) return;
      const end = Date.now() + 1800;
      const colors = ["#ff4d2e", "#171717", "#ffb199", "#2e8b57", "#f5c542"];
      (function frame() {
        if (cancelled) return;
        confetti({ particleCount: 5, angle: 60, spread: 60, origin: { x: 0, y: 0.8 }, colors });
        confetti({ particleCount: 5, angle: 120, spread: 60, origin: { x: 1, y: 0.8 }, colors });
        if (Date.now() < end) requestAnimationFrame(frame);
      })();
    });
    return () => {
      cancelled = true;
    };
  }, [active]);
}

export function CreatorForm() {
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [serverError, setServerError] = useState("");
  const [checking, setChecking] = useState(false);

  const {
    register, handleSubmit, control, trigger, setValue, setError, getValues, formState: { errors },
  } = useForm<CreatorInput, unknown, CreatorData>({
    resolver: zodResolver(creatorSchema),
    defaultValues: { country: "India", languages: [], otherCategories: [], platforms: [] },
  });

  const [name, city, country, birthYear, gender, niche, languages, platforms, followers] = useWatch({
    control,
    name: ["fullName", "city", "country", "birthYear", "gender", "primaryNiche", "languages", "platforms", "followers"],
  });

  const last = step === STEPS.length - 1;
  useConfetti(status === "done");

  function goTo(n: number) {
    setStep(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /** Step 2: stop people who already joined before they fill in the rest. */
  async function alreadyJoined(): Promise<boolean> {
    const { email, phone } = getValues();
    setChecking(true);
    try {
      const res = await fetch("/api/creators/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, phone }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.exists) {
        setError("email", { message: ALREADY_JOINED });
        return true;
      }
    } catch {
      // If the check fails we let them continue; the server checks again on submit.
    } finally {
      setChecking(false);
    }
    return false;
  }

  /** Step 8: at least one of the chosen platforms needs a valid link. */
  function hasOneValidLink(): boolean {
    const values = getValues();
    const chosen = (values.platforms ?? []) as PostPlatform[];
    let valid = 0;
    let flagged = false; // a specific "that link looks wrong" message already shown
    for (const p of chosen) {
      const field = LINK_FIELD[p];
      const raw = (values[field] ?? "").trim();
      if (!raw) continue;
      if (isValidPlatformLink(p, raw)) {
        valid++;
      } else {
        flagged = true;
        setError(field, { message: `Enter a valid ${p} link or handle` });
      }
    }
    if (valid === 0 && !flagged && chosen.length > 0) {
      setError(LINK_FIELD[chosen[0]], { message: chosen.length > 1 ? "Add at least one link" : `Add your ${chosen[0]} link` });
    }
    return valid > 0;
  }

  async function onContinue() {
    if (!(await trigger(STEPS[step]))) return;
    if (step === 1 && (await alreadyJoined())) return;
    if (step === 7 && !hasOneValidLink()) return;
    goTo(step + 1);
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
        if (data.duplicate) {
          setError("email", { message: ALREADY_JOINED });
          goTo(1);
        } else {
          setServerError(data.error ?? "Something went wrong. Please try again.");
        }
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
        <h2 className="mt-4 text-2xl font-semibold">You&apos;re in! 🎉</h2>
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
  const chosen = POST_PLATFORMS.filter((p) => (platforms ?? []).includes(p));

  return (
    <div className="grid gap-6 lg:grid-cols-[18rem_1fr] lg:items-start">
      <div className="hidden lg:block">
        <ProfilePreview data={{ name, city, country, birthYear, niche, languages, platforms, followers }} />
      </div>

      <form
        noValidate
        className="rounded-2xl border border-border bg-surface p-5 sm:p-7"
        onSubmit={(ev) => {
          ev.preventDefault();
          if (last) void handleSubmit(onSubmit, onInvalid)(ev);
          else void onContinue();
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
          <StepCard title="How can we reach you?" hint="We only use this to send you brand collaborations." sending={checking}>
            <Field label="Email" required error={e("email")}><Input type="email" placeholder="you@email.com" autoFocus {...register("email")} /></Field>
            <Field label="Phone / WhatsApp" required error={e("phone")}><Input type="tel" placeholder="98XXXXXXXX" {...register("phone")} /></Field>
          </StepCard>
        )}

        {step === 2 && (
          <StepCard title="Where are you based?" hint="Brands often look for local creators.">
            <Field label="Country" required error={e("country")}><Select options={COUNTRIES} {...register("country")} defaultValue="India" /></Field>
            <Field label="City" required error={e("city")}><Input placeholder="Start typing your city" autoFocus {...register("city")} /></Field>
          </StepCard>
        )}

        {step === 3 && (
          <StepCard title="What year were you born?" hint="Some campaigns look for a certain age.">
            <Field label="Birth year" required error={e("birthYear")}><Input inputMode="numeric" maxLength={4} placeholder="1999" autoFocus {...register("birthYear")} /></Field>
          </StepCard>
        )}

        {step === 4 && (
          <StepCard title="How do you identify?" hint="Some campaigns look for a certain audience." hideButton>
            <div role="radiogroup" aria-label="Gender" className="overflow-hidden rounded-xl border border-border">
              {GENDERS.map((g) => (
                <button
                  type="button"
                  key={g}
                  role="radio"
                  aria-checked={gender === g}
                  onClick={() => {
                    setValue("gender", g, { shouldValidate: true });
                    goTo(5);
                  }}
                  className={cn(
                    "block w-full border-b border-border px-4 py-3.5 text-left text-sm font-medium last:border-b-0 hover:bg-foreground/5",
                    gender === g && "bg-accent-ink text-accent-dark"
                  )}
                >
                  {g}
                </button>
              ))}
            </div>
            {e("gender") && <p className="text-xs font-medium text-red-600">{e("gender")}</p>}
            <p className="text-center text-xs text-muted">Tap one to move on</p>
          </StepCard>
        )}

        {step === 5 && (
          <StepCard title="What do you create?" hint="Brands search by niche, so be specific.">
            <Field label="Main niche" required error={e("primaryNiche")}><Select options={NICHES} {...register("primaryNiche")} /></Field>
            <Field label="Languages" required error={e("languages")}><ChipGroup control={control} name="languages" options={LANGUAGES} /></Field>
          </StepCard>
        )}

        {step === 6 && (
          <StepCard title="Where do you post?" hint="Pick every platform you use. You can pick more than one.">
            <Field label="Platforms" required error={e("platforms")}><ChipGroup control={control} name="platforms" options={POST_PLATFORMS} /></Field>
          </StepCard>
        )}

        {step === 7 && (
          <StepCard
            title={chosen.length > 1 ? "Add your links" : "Add your link"}
            hint={chosen.length > 1 ? "Add at least one. More links help brands find you." : "So brands can see your work."}
          >
            {chosen.map((p, i) => (
              <Field key={p} label={LINK_COPY[p].label} required={chosen.length === 1} error={e(LINK_FIELD[p])}>
                <Input placeholder={LINK_COPY[p].placeholder} autoFocus={i === 0} {...register(LINK_FIELD[p])} />
              </Field>
            ))}
            <Field label="Total followers (optional)" error={e("followers")} hint="e.g. 12500 or 12.5K">
              <Input placeholder="12.5K" {...register("followers")} />
            </Field>
          </StepCard>
        )}

        {step === 8 && (
          <StepCard title="Last bit" hint="Almost there." last sending={status === "sending"} submitLabel="Submit my profile">
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
