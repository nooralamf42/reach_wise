import { Resend } from "resend";
import twilio from "twilio";
import { site } from "@/lib/site-config";
import { toE164 } from "@/lib/phone";

const ESCAPES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ESCAPES[c]);
const list = (v?: string) => (v ?? "").split(",").map((s) => s.trim()).filter(Boolean);

async function emailOwners(subject: string, rows: [string, string][]) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  const owners = list(process.env.OWNER_EMAILS ?? site.email);
  if (!key || !from || owners.length === 0) return console.warn("[notify] email not configured");
  const items = rows
    .filter(([, v]) => v)
    .map(([k, v]) => `<li><strong>${esc(k)}:</strong> ${esc(v)}</li>`)
    .join("");
  try {
    await new Resend(key).emails.send({ from, to: owners, subject, html: `<ul>${items}</ul>` });
  } catch (e) {
    console.error("[notify] email failed", e);
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
  fullName: string; phone: string; email: string; primaryNiche: string; instagramHandle: string; followers: string;
}) {
  await Promise.all([
    emailOwners(`New creator: ${c.fullName}`, [
      ["Name", c.fullName], ["Phone", c.phone], ["Email", c.email], ["Niche", c.primaryNiche],
      ["Instagram", `@${c.instagramHandle}`], ["Followers", c.followers],
    ]),
    whatsappOwners(`New creator signup\n${c.fullName} (${c.primaryNiche})\n@${c.instagramHandle} · ${c.followers}\n${c.phone}`),
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
