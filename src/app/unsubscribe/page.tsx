import { getLead } from "@/lib/radar/repo";
import { suppressLead } from "@/lib/radar/agents";

export const dynamic = "force-dynamic";

export const metadata = { title: "Unsubscribe", robots: { index: false } };

/**
 * Public one-click unsubscribe target for the outreach footer / List-Unsubscribe
 * header. Suppresses the lead permanently and confirms. Idempotent — visiting
 * again for an already-suppressed lead does nothing further.
 */
export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ lead?: string }>;
}) {
  const { lead: leadId } = await searchParams;
  let done = false;
  let name = "";

  if (leadId) {
    const lead = await getLead(leadId);
    if (lead) {
      name = lead.business_name;
      const alreadyOut = lead.do_not_contact || lead.status === "opted_out" || lead.status === "suppressed";
      if (!alreadyOut) {
        await suppressLead(lead, "unsubscribe", "one-click unsubscribe");
      }
      done = true;
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#07090c] px-6 text-center">
      <div className="max-w-md">
        <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-[#3DF5A0]/15 text-[#3DF5A0]">
          ✓
        </div>
        <h1 className="font-sans text-xl font-bold text-[#EAF1F8]">
          {done ? "You're unsubscribed" : "Link expired"}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[#9DB0C4]">
          {done
            ? `${name ? name + " has" : "You've"} been removed and won't receive any further emails from us. No further action is needed.`
            : "We couldn't find that subscription. If you're still receiving emails, reply with STOP and we'll remove you."}
        </p>
      </div>
    </main>
  );
}
