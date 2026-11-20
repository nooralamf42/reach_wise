import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { signInAction } from "@/app/auth/actions";

export const metadata = { title: "Admin sign in", robots: { index: false } };

export default function SignInPage() {
  return (
    <div className="mx-auto max-w-sm px-5 py-24">
      <h1 className="text-3xl font-bold">Admin sign in</h1>
      <AuthForm action={signInAction} mode="sign-in" />
      <p className="mt-5 text-sm text-muted">
        First time? <Link href="/auth/sign-up" className="underline">Create your admin account</Link>
      </p>
    </div>
  );
}
