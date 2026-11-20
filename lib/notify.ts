import { Resend } from "resend";
import twilio from "twilio";
import { site } from "@/lib/site-config";
import { toE164 } from "@/lib/phone";
import { getSetting } from "@/lib/db";

const ESCAPES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ESCAPES[c]);
const list = (v?: string | null) => (v ?? "").split(",").map((s) => s.trim()).filter(Boolean);

export type SendResult = { ok: boolean; reason?: string };

export function isEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL);
}

/** Where alerts go: the address saved in the admin panel, else OWNER_EMAILS, else the site email. */
export async function getNotifyEmails(): Promise<{ emails: string[]; source: "admin panel" | "environment" | "default" }> {
  try {
    const saved = list(await getSetting("notify_emails"));
    if (saved.length) return { emails: saved, source: "admin panel" };
  } catch (e) {
    console.error("[notify] couldn't read saved notification email", e);
  }
  const env = list(process.env.OWNER_EMAILS);
  if (env.length) return { emails: env, source: "environment" };
  return { emails: list(site.email), source: "default" };
}

async function emailOwners(subject: string, rows: [string, string][], replyTo?: string): Promise<SendResult> {
  if (!isEmailConfigured()) {
    console.warn("[notify] email not configured");
    return { ok: false, reason: "Email isn't set up (RESEND_API_KEY / RESEND_FROM_EMAIL missing)" };
  }
  const { emails } = await getNotifyEmails();
  if (emails.length === 0) return { ok: false, reason: "No notification email address" };

  const items = rows
    .filter(([, v]) => v)
    .map(([k, v]) => `<li><strong>${esc(k)}:</strong> ${esc(v).replace(/\n/g, "<br>")}</li>`)
    .join("");
  try {
    const { error } = await new Resend(process.env.RESEND_API_KEY).emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: emails,
      subject,
      html: `<ul>${items}</ul>`,
      ...(replyTo ? { replyTo } : {}),
    });
    if (error) return { ok: false, reason: error.message };
    return { ok: true };
  } catch (e) {
    console.error("[notify] email failed", e);
    return { ok: false, reason: e instanceof Error ? e.message : "Email failed" };
  }
}

async function whatsappOwners(body: string) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM;
  const owners = list(process.env.OWNER_WHATSAPP_NUMBERS);
  if (!sid || !token || !from || owners.length === 0) return console.warn("[notify] whatsapp not configured");
  const client = twilio(sid, token);
  await Promise.all(
    owners.map((n) =>
      client.messages
        .create({ from, to: `whatsapp:${toE164(n)}`, body })
        .catch((e) => console.error("[notify] whatsapp failed", e))
    )
  );
}

export async function notifyNewCreator(c: {
  fullName: string; phone: string; email: string; primaryNiche: string; platforms: string; followers: string;
}) {
  await Promise.all([
    emailOwners(`New creator: ${c.fullName}`, [
      ["Name", c.fullName], ["Phone", c.phone], ["Email", c.email], ["Niche", c.primaryNiche],
      ["Posts on", c.platforms], ["Followers", c.followers],
    ]),
    whatsappOwners(`New creator signup\n${c.fullName} (${c.primaryNiche})\n${c.platforms}${c.followers ? ` · ${c.followers}` : ""}\n${c.phone}`),
  ]);
}

export async function notifyNewBrand(b: {
  companyName: string; contactName: string; phone: string; email: string; budget: string; goal: string;
}) {
  await Promise.all([
    emailOwners(`New brand enquiry: ${b.companyName}`, [
      ["Company", b.companyName], ["Contact", b.contactName], ["Phone", b.phone], ["Email", b.email],
      ["Budget", b.budget], ["Goal", b.goal],
    ]),
    whatsappOwners(`New brand enquiry\n${b.companyName} — ${b.contactName}\nBudget: ${b.budget}\nGoal: ${b.goal}\n${b.phone}`),
  ]);
}

/** Emails the admin a new support message. Reply goes straight to the sender. */
export function notifyContactMessage(m: { name: string; email: string; phone: string; message: string }): Promise<SendResult> {
  return emailOwners(`Support message from ${m.name}`, [["Name", m.name], ["Email", m.email], ["Phone", m.phone], ["Message", m.message]], m.email);
}

/** Lets the admin confirm that email really reaches their inbox. */
export function sendTestEmail(): Promise<SendResult> {
  return emailOwners(`Test email from ${site.brand}`, [["Result", "If you can read this, support emails will reach this address."]]);
}
