import type { Metadata } from "next";
import { CreatorForm } from "@/components/creator-form";
import { site } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Join as a creator",
  description: `Join the ${site.brand} creator network. Free to join. Get matched with paid brand collaborations in your niche.`,
};

export default function JoinPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <div className="mx-auto mb-8 max-w-lg text-center lg:max-w-none lg:text-left">
        <h1 className="text-3xl font-bold sm:text-4xl">Get paid to create for brands</h1>
        <p className="mt-2 text-muted">
          Free to join, takes about 3 minutes. We match you with brand briefs that fit your niche, then message you on WhatsApp. We never ask creators for money.
        </p>
      </div>
      <CreatorForm />
    </div>
  );
}
