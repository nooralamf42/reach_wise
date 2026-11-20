import { NextResponse } from "next/server";
import { z } from "zod";
import {
  ADMIN_SESSION_COOKIE,
  checkAdminCredentials,
  createSessionToken,
  isAdminConfigured,
} from "@/lib/admin-auth";
import { clientIp, rateLimited } from "@/lib/rate-limit";

const bodySchema = z.object({ username: z.string().min(1), password: z.string().min(1) });

export async function POST(request: Request) {
  if (!isAdminConfigured()) {
    return NextResponse.json({ error: "Admin isn't configured. Set ADMIN_USERNAME and ADMIN_PASSWORD." }, { status: 503 });
  }
  if (rateLimited(`admin:${clientIp(request)}`, 8)) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  }
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a username and password." }, { status: 400 });
  }
  if (!checkAdminCredentials(parsed.data.username, parsed.data.password)) {
    return NextResponse.json({ error: "Incorrect username or password." }, { status: 401 });
  }
  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
