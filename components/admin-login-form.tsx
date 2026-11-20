"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(ev.currentTarget);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: form.get("username"), password: form.get("password") }),
    });
    if (!res.ok) {
      setError((await res.json().catch(() => ({}))).error ?? "Login failed.");
      setBusy(false);
      return;
    }
    const redirect = params.get("redirect");
    router.replace(redirect && redirect.startsWith("/admin") ? redirect : "/admin");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      <div><Label htmlFor="u">Username</Label><Input id="u" name="username" autoComplete="username" required /></div>
      <div><Label htmlFor="p">Password</Label><Input id="p" name="password" type="password" autoComplete="current-password" required /></div>
      {error && <p role="alert" className="text-sm font-medium text-red-600">{error}</p>}
      <Button type="submit" className="w-full" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</Button>
    </form>
  );
}
