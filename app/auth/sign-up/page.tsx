import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { signUpAction } from "@/app/auth/actions";

export const metadata = { title: "Create admin account", robots: { index: false } };

export default function SignUpPage() {
  return (
    <div className="mx-auto max-w-sm px-5 py-24">
      <h1 className="text-3xl font-bold">Create admin account</h1>
      <p className="mt-2 text-sm text-muted">Only emails on the admin list can register.</p>
      <AuthForm action={signUpAction} mode="sign-up" />
      <p className="mt-5 text-sm text-muted">
        Already have one? <Link href="/auth/sign-in" className="underline">Sign in</Link>
      </p>
    </div>
  );
}
