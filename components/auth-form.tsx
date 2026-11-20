"use client";

import { useActionState } from "react";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type State = { error?: string; notice?: string } | null;

export function AuthForm({
  action,
  mode,
}: {
  action: (prev: State, formData: FormData) => Promise<State>;
  mode: "sign-in" | "sign-up";
}) {
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <form action={formAction} className="mt-6 space-y-4">
      {mode === "sign-up" && (
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" autoComplete="name" required />
        </div>
      )}
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
          minLength={mode === "sign-up" ? 8 : undefined}
          required
        />
      </div>
      {state?.error && <p role="alert" className="text-sm font-medium text-red-600">{state.error}</p>}
      {state?.notice && <p role="status" className="text-sm font-medium text-green-700">{state.notice}</p>}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Please wait…" : mode === "sign-in" ? "Sign in" : "Create admin account"}
      </Button>
    </form>
  );
}
