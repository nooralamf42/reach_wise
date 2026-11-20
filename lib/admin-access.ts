import { auth } from "@/lib/auth/server";

/** Emails allowed into /admin, from ADMIN_EMAILS (comma-separated). */
export function adminEmails() {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string) {
  return adminEmails().includes(email.trim().toLowerCase());
}

export type AdminState =
  | { status: "admin"; email: string }
  | { status: "signed-out" }
  | { status: "forbidden"; email: string; reason: "not-allowed" | "unverified" };

/**
 * Signed in AND on the allowlist AND email verified. Verification matters:
 * without it, anyone could sign up with an admin's address first.
 */
export async function getAdminState(): Promise<AdminState> {
  const { data: session } = await auth.getSession();
  const user = session?.user;
  if (!user?.email) return { status: "signed-out" };
  if (!isAdminEmail(user.email)) return { status: "forbidden", email: user.email, reason: "not-allowed" };
  if (!user.emailVerified) return { status: "forbidden", email: user.email, reason: "unverified" };
  return { status: "admin", email: user.email };
}
