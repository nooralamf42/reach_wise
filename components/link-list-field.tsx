"use client";

import { useState } from "react";
import { Controller, type Control, type FieldValues, type Path } from "react-hook-form";
import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";

const LINK = /^https?:\/\/[^\s.]+\.[^\s]{2,}$/i;

/** Paste a link, press + or Enter, repeat. Stores a string[] in the form. */
export function LinkListField<T extends FieldValues>({
  control, name, max = 5, placeholder,
}: { control: Control<T>; name: Path<T>; max?: number; placeholder?: string }) {
  const [draft, setDraft] = useState("");
  const [note, setNote] = useState("");

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => {
        const links: string[] = field.value ?? [];

        function add() {
          const v = draft.trim();
          if (!v) return;
          if (!LINK.test(v)) return setNote("Paste a full link starting with https://");
          if (links.includes(v)) return setNote("You already added that link.");
          if (links.length >= max) return setNote(`Up to ${max} links.`);
          field.onChange([...links, v]);
          setDraft("");
          setNote("");
        }

        return (
          <div>
            <div className="flex gap-2">
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault(); // Enter adds the link; it doesn't advance the form
                    add();
                  }
                }}
                placeholder={placeholder}
                inputMode="url"
                aria-label="Video link"
              />
              <button
                type="button"
                onClick={add}
                aria-label="Add link"
                disabled={links.length >= max}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent text-white disabled:opacity-40"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            {note && <p className="mt-1 text-xs font-medium text-red-600">{note}</p>}
            <ul className="mt-3 space-y-2">
              {links.map((l) => (
                <li key={l} className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm">
                  <span className="min-w-0 flex-1 truncate">{l}</span>
                  <button type="button" aria-label="Remove link" onClick={() => field.onChange(links.filter((x) => x !== l))} className="text-muted hover:text-foreground">
                    <X className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-muted">{links.length} of {max} added (at least 2 needed)</p>
          </div>
        );
      }}
    />
  );
}
