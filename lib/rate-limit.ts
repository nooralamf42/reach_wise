// Tiny in-memory limiter: fine for a single instance, best-effort on serverless.
const hits = new Map<string, number[]>();

export function rateLimited(key: string, max = 5, windowMs = 10 * 60 * 1000) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  recent.push(now);
  hits.set(key, recent);
  return recent.length > max;
}

/** For server actions, which don't receive the Request object. */
export async function clientIpFromHeaders() {
  const { headers } = await import("next/headers");
  return (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

export function clientIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}
