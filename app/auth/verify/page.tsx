import { redirect } from "next/navigation";
import { VerifyForm } from "@/components/verify-form";

export const metadata = { title: "Verify your email", robots: { index: false } };

export default async function VerifyPage({ searchParams }: { searchParams: Promise<{ email?: string }> }) {
  const { email } = await searchParams;
  if (!email) redirect("/auth/sign-up");

  return (
    <div className="mx-auto max-w-sm px-5 py-24">
      <h1 className="text-3xl font-bold">Check your email</h1>
      <p className="mt-2 text-sm text-muted">
        We sent a verification code to <span className="font-medium text-foreground">{email}</span>. Enter it below.
      </p>
      <VerifyForm email={email} />
    </div>
  );
}
