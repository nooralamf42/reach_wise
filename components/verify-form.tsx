"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/client";

export function VerifyForm({ email }: { email: string }) {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  async function verify(ev: React.FormEvent) {
    ev.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    const { error: err } = await authClient.emailOtp.verifyEmail({ email, otp: otp.replace(/\s/g, "") });
    setBusy(false);
    if (err) return setError("That code is incorrect or has expired.");
    router.replace("/auth/sign-in?verified=1");
  }

  async function resend() {
    setError("");
    setNotice("");
    const { error: err } = await authClient.emailOtp.sendVerificationOtp({ email, type: "email-verification" });
    if (err) setError("Couldn't send a new code. Try again in a minute.");
    else setNotice("A new code is on its way.");
  }

  return (
    <div className="mt-6">
      <form onSubmit={verify} className="space-y-4">
        <div>
          <Label htmlFor="otp">Verification code</Label>
          <Input
            id="otp"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            inputMode="numeric"
            autoComplete="one-time-code"
            autoFocus
            required
            placeholder="123456"
          />
        </div>
        {error && <p role="alert" className="text-sm font-medium text-red-600">{error}</p>}
        {notice && <p role="status" className="text-sm font-medium text-green-700">{notice}</p>}
        <Button type="submit" className="w-full" disabled={busy}>{busy ? "Checking…" : "Verify email"}</Button>
      </form>
      <button type="button" onClick={resend} className="mt-4 block w-full text-center text-sm text-muted underline hover:text-foreground">
        Send a new code
      </button>
    </div>
  );
}
