import { signOutAction } from "@/app/auth/actions";

export function LogoutButton({ email }: { email?: string }) {
  return (
    <form action={signOutAction} className="flex items-center gap-3">
      {email && <span className="text-sm text-muted">{email}</span>}
      <button className="text-sm font-medium text-muted hover:text-foreground">Log out</button>
    </form>
  );
}
