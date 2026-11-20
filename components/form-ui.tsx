"use client";

import * as React from "react";
import { Controller, type Control, type FieldValues, type Path } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Label, FieldError } from "@/components/ui/input";

export function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <fieldset className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
      <legend className="sr-only">{title}</legend>
      <h2 className="font-display text-lg font-semibold">{title}</h2>
      {hint && <p className="mt-1 text-sm text-muted">{hint}</p>}
      <div className="mt-5 grid gap-4 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

export function Field({
  label, error, hint, full, children, required,
}: {
  label: string; error?: string; hint?: string; full?: boolean; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div className={cn(full && "sm:col-span-2")}>
      <Label>
        {label}
        {required && <span className="text-accent"> *</span>}
      </Label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-muted">{hint}</p>}
      <FieldError>{error}</FieldError>
    </div>
  );
}

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement> & { options: readonly string[]; placeholder?: string }>(
  ({ options, placeholder = "Select…", className, ...props }, ref) => (
    <select
      ref={ref}
      defaultValue=""
      className={cn(
        "h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20",
        className
      )}
      {...props}
    >
      <option value="" disabled>{placeholder}</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  )
);
Select.displayName = "Select";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      rows={3}
      className={cn(
        "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/20",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

/** Multi-select chips bound to a string[] form field. */
export function ChipGroup<T extends FieldValues>({
  control, name, options, max,
}: { control: Control<T>; name: Path<T>; options: readonly string[]; max?: number }) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => {
        const value: string[] = field.value ?? [];
        return (
          <div className="flex flex-wrap gap-2">
            {options.map((o) => {
              const on = value.includes(o);
              const blocked = !on && max !== undefined && value.length >= max;
              return (
                <button
                  type="button"
                  key={o}
                  aria-pressed={on}
                  disabled={blocked}
                  onClick={() => field.onChange(on ? value.filter((v) => v !== o) : [...value, o])}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-sm transition-colors disabled:opacity-40",
                    on ? "border-foreground bg-foreground text-background" : "border-border bg-background hover:border-foreground/40"
                  )}
                >
                  {o}
                </button>
              );
            })}
          </div>
        );
      }}
    />
  );
}
