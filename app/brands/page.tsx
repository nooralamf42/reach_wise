import type { Metadata } from "next";
import { BrandForm } from "@/components/brand-form";
import { site } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Hire creators",
  description: `Send ${site.brand} your brief and get a vetted creator shortlist within 48 hours.`,
};

export default function BrandsPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <div className="mx-auto mb-8 max-w-lg text-center">
        <h1 className="text-3xl font-bold sm:text-4xl">Find creators for your brand</h1>
        <p className="mt-2 text-muted">Share a short brief. We come back with a vetted shortlist and pricing within 48 hours.</p>
      </div>
      <BrandForm />
    </div>
  );
}
