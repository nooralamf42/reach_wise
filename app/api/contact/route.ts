import { NextResponse, after } from "next/server";
import { contactSchema } from "@/lib/schemas";
import { insertContactMessage, isDbConfigured, setMessageEmailStatus } from "@/lib/db";
import { toE164 } from "@/lib/phone";
import { clientIp, rateLimited } from "@/lib/rate-limit";
import { notifyContactMessage } from "@/lib/notify";

export async function POST(request: Request) {
  if (rateLimited(`contact:${clientIp(request)}`, 4)) {
    return NextResponse.json({ error: "Too many messages. Please try again in a few minutes." }, { status: 429 });
  }

  const parsed = contactSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check the highlighted fields." }, { status: 400 });
  }
  const d = parsed.data;
  if (d.website) return NextResponse.json({ success: true }); // honeypot

  if (!isDbConfigured()) {
    return NextResponse.json({ error: "Messages are temporarily unavailable. Please try again later." }, { status: 503 });
  }

  const phone = d.phone ? toE164(d.phone) : "";
  let id: string;
  try {
    id = await insertContactMessage({ name: d.name, email: d.email, phone, message: d.message });
  } catch (e) {
    console.error("[contact] insert failed", e);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }

  // The message is already saved (and visible in admin). Now email it, and record whether that worked.
  after(async () => {
    const result = await notifyContactMessage({ name: d.name, email: d.email, phone, message: d.message });
    try {
      await setMessageEmailStatus(id, result.ok ? "sent" : `not sent: ${result.reason ?? "unknown error"}`);
    } catch (e) {
      console.error("[contact] couldn't record email status", e);
    }
  });

  return NextResponse.json({ success: true });
}
