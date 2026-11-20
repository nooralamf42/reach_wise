import { auth } from "@/lib/auth/server";

// Sends signed-out visitors to the sign-in page. Who is *allowed* in
// (admin allowlist + verified email) is checked again inside each admin page/route.
export default auth.middleware({ loginUrl: "/auth/sign-in" });

export const config = {
  matcher: ["/admin/:path*"],
};
