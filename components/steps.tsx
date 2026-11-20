"use client";

import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Segmented bar with a back arrow, like a modern onboarding card. */
export function StepProgress({ total, current, onBack }: { total: number; current: number; onBack: () => void }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      {current > 0 ? (
        <button type="button" onClick={onBack} aria-label="Go back" className="rounded-full p-1.5 text-muted hover:bg-foreground/5 hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
        </button>
      ) : (
        <span className="w-8" />
      )}
      <div
        className="flex flex-1 gap-1.5"
        role="progressbar"
        aria-label={`Step ${current + 1} of ${total}`}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={current + 1}
      >
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= current ? "bg-accent" : "bg-border"}`} />
        ))}
      </div>
    </div>
  );
}

/** One short question per screen: title, one-line subtitle, a few fields, one button. */
export function StepCard({
  title, hint, children, sending, last, submitLabel, hideButton,
}: {
  title: string; hint?: string; children: React.ReactNode; sending?: boolean; last?: boolean; submitLabel?: string;
  /** For tap-to-advance screens that have no Continue button. */
  hideButton?: boolean;
}) {
  return (
    <div>
      <h2 className="font-display text-2xl font-semibold">{title}</h2>
      {hint && <p className="mt-1 text-sm text-muted">{hint}</p>}
      <div className="mt-6 space-y-4">{children}</div>
      {!hideButton && (
        <Button type="submit" variant={last ? "accent" : "primary"} size="lg" className="mt-7 w-full" disabled={sending}>
          {sending && <Loader2 className="h-4 w-4 animate-spin" />}
          {last ? (sending ? "Submitting…" : (submitLabel ?? "Submit")) : "Continue"}
        </Button>
      )}
    </div>
  );
}

export function StepSkip({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="mt-3 block w-full text-center text-sm text-muted hover:text-foreground">
      Skip for now
    </button>
  );
}
