"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAdminState } from "@/lib/admin-access";
import { setMessageStatus, setSetting } from "@/lib/db";
import { sendTestEmail } from "@/lib/notify";

/** Every admin action re-checks access itself; hiding a button is not security. */
async function requireAdmin() {
  const access = await getAdminState();
  if (access.status !== "admin") redirect("/auth/sign-in");
}

const emailList = z
  .string()
  .transform((v) => v.split(/[,\s;]+/).map((s) => s.trim().toLowerCase()).filter(Boolean))
  .pipe(z.array(z.string().email()).min(1).max(5));

export async function saveNotifyEmailsAction(formData: FormData) {
  await requireAdmin();
  const parsed = emailList.safeParse(String(formData.get("emails") ?? ""));
  if (!parsed.success) redirect("/admin?tab=settings&error=invalid");
  await setSetting("notify_emails", parsed.data.join(", "));
  revalidatePath("/admin");
  redirect("/admin?tab=settings&saved=1");
}

export async function sendTestEmailAction() {
  await requireAdmin();
  const result = await sendTestEmail();
  const query = result.ok ? "test=ok" : `test=failed&reason=${encodeURIComponent((result.reason ?? "unknown").slice(0, 160))}`;
  redirect(`/admin?tab=settings&${query}`);
}

export async function setMessageStatusAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = formData.get("status") === "done" ? "done" : "new";
  if (!/^[0-9a-f-]{36}$/i.test(id)) return;
  await setMessageStatus(id, status);
  revalidatePath("/admin");
}
