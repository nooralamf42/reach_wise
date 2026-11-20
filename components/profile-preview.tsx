import { compact } from "@/lib/stats";
import { parseCount } from "@/lib/schemas";

export type PreviewData = {
  name?: string; city?: string; country?: string; birthYear?: string; niche?: string;
  followers?: string; languages?: string[]; platforms?: string[];
};

function Skel({ w }: { w: string }) {
  return <span className={`inline-block h-3 rounded-full bg-border ${w}`} />;
}

/** "Your profile, as brands will see it": fills in as the creator answers. */
export function ProfilePreview({ data }: { data: PreviewData }) {
  const name = data.name?.trim();
  const followers = data.followers ? parseCount(data.followers) : 0;
  const year = Number(data.birthYear);
  const age = /^\d{4}$/.test(data.birthYear ?? "") && year > 1900 ? new Date().getFullYear() - year : 0;
  const initials = (name || "?").split(/\s+/).map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  const platforms = data.platforms ?? [];

  return (
    <div>
      <p className="mb-2 flex items-center gap-2 text-xs font-medium text-muted">
        <span className="h-2 w-2 rounded-full bg-green-500" /> Your profile, as brands will see it
      </p>
      <div className="rounded-2xl border border-border bg-surface p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent font-semibold text-white">{initials}</span>
          <div className="min-w-0">
            <p className="truncate font-semibold">{name || <Skel w="w-24" />}</p>
            <p className="truncate text-xs text-muted">
              {data.city?.trim() ? `${data.city.trim()}${data.country ? `, ${data.country}` : ""}${age ? ` · ${age}` : ""}` : <Skel w="w-16" />}
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          {data.niche ? <span className="rounded-full bg-accent-ink px-3 py-1 font-medium text-accent-dark">{data.niche}</span> : <Skel w="w-20" />}
          {data.languages?.slice(0, 3).map((l) => (
            <span key={l} className="rounded-full border border-border px-3 py-1">{l}</span>
          ))}
        </div>
        <div className="mt-4 border-t border-border pt-3 text-sm">
          {platforms.length > 0 ? (
            <p>
              <span className="font-medium">{platforms.join(" · ")}</span>
              {followers > 0 && <span className="text-muted"> · {compact(followers)} followers</span>}
            </p>
          ) : (
            <Skel w="w-32" />
          )}
        </div>
      </div>
    </div>
  );
}
