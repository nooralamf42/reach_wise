"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { isAdminEmail } from "@/lib/admin-access";
import { clientIpFromHeaders, rateLimited } from "@/lib/rate-limit";

type State = { error?: string; notice?: string } | null;

const str = (v: FormDataEntryValue | null) => (typeof v === "string" ? v.trim() : "");

export async function signInAction(_prev: State, formData: FormData): Promise<State> {
  if (rateLimited(`signin:${await clientIpFromHeaders()}`, 10)) {
    return { error: "Too many attempts. Try again later." };
  }
  const email = str(formData.get("email")).toLowerCase();
  const password = str(formData.get("password"));
  if (!email || !password) return { error: "Enter your email and password." };

  const { error } = await auth.signIn.email({ email, password });
  if (error) return { error: "Incorrect email or password." };
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
  return { notice: "Account created. Check your email for a verification code or link, then sign in." };
}

export async function signOutAction() {
  await auth.signOut();
  redirect("/auth/sign-in");
}
