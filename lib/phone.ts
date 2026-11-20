/**
 * Shared phone helpers — safe to import from both server code (Twilio sends)
 * and client components (admin WhatsApp click-to-chat links), unlike
 * lib/whatsapp.ts which pulls in the Node-only Twilio SDK.
 */

// WhatsApp/Twilio need E.164 (+91XXXXXXXXXX). The registration form doesn't
// enforce a country code, so bare 10-digit numbers are assumed India (site
// locale is en_IN) — anything already starting with "+" is left as-is.
export function toE164(phone: string): string {
  const digits = phone.replace(/[\s-]/g, "");
  if (digits.startsWith("+")) return digits;
  if (digits.length === 10) return `+91${digits}`;
  // STD-style leading 0 (e.g. "08707223120") — common typo/habit, not a country code.
  if (digits.length === 11 && digits.startsWith("0")) return `+91${digits.slice(1)}`;
  return `+${digits}`;
}

/**
 * Groups repeat checkout attempts by the same person regardless of how they
 * typed their number that particular time (with/without country code,
 * spaces, dashes) — last 10 digits, country-code-agnostic. Returns "" when
 * there aren't enough digits to trust as a real number.
 */
export function phoneDedupeKey(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 7 ? digits.slice(-10) : "";
}

/** wa.me deep link that opens a chat with an optional prefilled message. */
export function whatsappChatUrl(phone: string, text?: string): string {
  const digits = toE164(phone).replace(/\D/g, "");
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}
