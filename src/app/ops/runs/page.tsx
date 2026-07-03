import { getDb } from "@/lib/radar/db";
import { clsx } from "@/lib/clsx";

export const dynamic = "force-dynamic";

export default async function RunsPage() {
  const runs = await getDb().list("agent_runs", {
    order: { column: "created_at", dir: "desc" },
    limit: 200,
  });

  const counts = runs.reduce<Record<string, number>>((acc, r) => {
    acc[r.agent_name] = (acc[r.agent_name] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      <div>
        <p className="r-eyebrow">Telemetry</p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight">Agent runs</h1>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {Object.entries(counts).map(([name, n]) => (
          <span key={name} className="r-chip">
            <span className="font-mono text-radar-cyan">{name}</span>
            <span className="text-radar-faint">{n}</span>
          </span>
        ))}
      </div>

      <div className="r-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12.5px]">
            <thead>
              <tr className="border-b border-radar-line text-[11px] uppercase tracking-wide text-radar-faint">
                <th className="px-4 py-2.5 font-semibold">Time</th>
                <th className="px-4 py-2.5 font-semibold">Agent</th>
                <th className="px-4 py-2.5 font-semibold">Status</th>
                <th className="px-4 py-2.5 text-right font-semibold">Duration</th>
                <th className="px-4 py-2.5 font-semibold">Output</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((r) => (
                <tr key={r.id} className="border-b border-radar-line/50 hover:bg-radar-raised">
                  <td className="whitespace-nowrap px-4 py-2 font-mono text-[11px] text-radar-faint">
                    {new Date(r.created_at).toLocaleTimeString()}
                  </td>
                  <td className="px-4 py-2 font-mono text-radar-cyan">{r.agent_name}</td>
                  <td className="px-4 py-2">
                    <span
                      className={clsx(
                        "inline-flex items-center gap-1.5 font-mono text-[11px]",
                        r.status === "ok" ? "text-radar-signal" : "text-radar-rose"
                      )}
                    >
                      <span
                        className={clsx(
                          "h-1.5 w-1.5 rounded-full",
                          r.status === "ok" ? "bg-radar-signal" : "bg-radar-rose"
                        )}
                      />
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right font-mono text-[11px] text-radar-mute">
                    {r.duration_ms ?? 0}ms
                  </td>
                  <td className="max-w-md truncate px-4 py-2 font-mono text-[11px] text-radar-faint">
                    {r.error ? (
                      <span className="text-radar-rose">{r.error}</span>
                    ) : (
                      JSON.stringify(r.output)?.slice(0, 120)
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {runs.length === 0 && (
          <p className="px-4 py-8 text-center text-[13px] text-radar-faint">No agent runs yet.</p>
        )}
      </div>
    </div>
  );
}
