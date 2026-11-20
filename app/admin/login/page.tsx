import { Suspense } from "react";
import { LoginForm } from "@/components/admin-login-form";

export const metadata = { title: "Admin login", robots: { index: false } };

export default function AdminLoginPage() {
  return (
    <div className="mx-auto max-w-sm px-5 py-24">
      <h1 className="text-3xl font-bold">Admin</h1>
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
