"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { isAdminEmail } from "@/lib/admin-access";
import { clientIpFromHeaders, rateLimited } from "@/lib/rate-limit";

type State = { error?: string; notice?: string } | null;

const str = (v: FormDataEntryValue | null) => (typeof v === "string" ? v.trim() : "");
const verifyUrl = (email: string) => `/auth/verify?email=${encodeURIComponent(email)}`;

export async function signInAction(_prev: State, formData: FormData): Promise<State> {
  if (rateLimited(`signin:${await clientIpFromHeaders()}`, 10)) {
    return { error: "Too many attempts. Try again later." };
  }
  const email = str(formData.get("email")).toLowerCase();
  const password = str(formData.get("password"));
  if (!email || !password) return { error: "Enter your email and password." };

  const { error } = await auth.signIn.email({ email, password });
  if (error) {
    // Unverified accounts go to the code screen instead of a dead end.
    if (/verif/i.test(error.message ?? "")) redirect(verifyUrl(email));
    return { error: "Incorrect email or password." };
  }
  redirect("/admin");
}

export async function signUpAction(_prev: State, formData: FormData): Promise<State> {
  if (rateLimited(`signup:${await clientIpFromHeaders()}`, 5)) {
    return { error: "Too many attempts. Try again later." };
  }
  const name = str(formData.get("name"));
  const email = str(formData.get("email")).toLowerCase();
  const password = str(formData.get("password"));
  if (!name || !email || password.length < 8) {
    return { error: "Enter your name, email and a password of at least 8 characters." };
  }
  if (!isAdminEmail(email)) {
    return { error: "This email isn't on the admin list." };
  }

  const { error } = await auth.signUp.email({ email, name, password });
  if (error) return { error: error.message || "Couldn't create the account." };
  redirect(verifyUrl(email));
}

export async function signOutAction() {
  await auth.signOut();
  redirect("/auth/sign-in");
}
