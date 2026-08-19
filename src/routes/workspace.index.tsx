import { createFileRoute, Link } from "@tanstack/react-router";

import { AppShell } from "@/components/insuraguard/AppShell";
import { Icon } from "@/components/insuraguard/Icon";
import { claims, riskLabel } from "@/lib/mock-data";

export const Route = createFileRoute("/workspace/")({
  head: () => ({
    meta: [
      { title: "Claim Workspace Queue | InsuraGuard AI" },
      {
        name: "description",
        content:
          "Work queue of claims awaiting AI pre-validation before Nphies submission.",
      },
      { property: "og:title", content: "Claim Workspace Queue | InsuraGuard AI" },
      {
        property: "og:description",
        content: "Claims awaiting AI pre-validation before Nphies submission.",
      },
    ],
  }),
  component: WorkspaceQueue,
});

const riskChip: Record<string, string> = {
  high: "bg-critical-amethyst text-white",
  medium: "bg-warning-amber text-white",
  low: "bg-surface-variant text-secondary",
};

function WorkspaceQueue() {
  return (
    <AppShell title="Claim Workspace" contentClassName="p-md lg:p-lg">
      <div className="flex flex-col gap-lg">
        <div className="flex flex-wrap items-end justify-between gap-md">
          <div>
            <h1 className="font-headline-md text-headline-md text-on-surface">
              Claim Workspace
            </h1>
            <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
              Select a claim to review AI pre-validation findings before submitting to Nphies.
            </p>
          </div>
          <Link
            to="/submissions"
            className="flex items-center gap-sm rounded border border-border-slate bg-white px-4 py-2 font-label-caps text-label-caps text-on-surface transition-colors hover:bg-surface-container-low"
          >
            <Icon name="history" className="text-[18px]" />
            Submission History
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-md md:grid-cols-2 xl:grid-cols-3">
          {claims.map((c) => (
            <Link
              key={c.id}
              to="/workspace/$claimId"
              params={{ claimId: c.id }}
              className="group relative flex flex-col gap-sm overflow-hidden rounded-xl border border-border-slate bg-white p-md shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
            >
              <div
                className={`absolute top-0 left-0 h-full w-1 ${
                  c.risk === "high"
                    ? "bg-critical-amethyst"
                    : c.risk === "medium"
                      ? "bg-warning-amber"
                      : "bg-success-emerald"
                }`}
              />
              <div className="flex items-start justify-between gap-sm">
                <div>
                  <div className="font-data-mono text-data-mono font-bold text-primary">
                    {c.id}
                  </div>
                  <div className="font-body-sm text-body-sm text-secondary">
                    {c.patientName} · {c.patientMasked}
                  </div>
                </div>
                <span
                  className={`inline-flex shrink-0 items-center gap-1 rounded px-2 py-0.5 font-label-caps text-[10px] ${riskChip[c.risk]}`}
                >
                  {riskLabel[c.risk]}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-border-slate/60 pt-sm font-label-sm text-label-sm text-on-surface-variant">
                <span>{c.serviceType}</span>
                <span className="font-data-mono">SAR {c.totalSar}</span>
              </div>
              <div className="flex items-center justify-between font-label-caps text-label-caps">
                <span
                  className={
                    c.status === "validated"
                      ? "text-success-emerald"
                      : c.status === "flagged"
                        ? "text-critical-amethyst"
                        : "text-warning-amber"
                  }
                >
                  {c.status === "validated"
                    ? "Validated"
                    : c.status === "flagged"
                      ? "Flagged"
                      : "Review Needed"}
                </span>
                <span className="flex items-center gap-1 text-primary">
                  Open <Icon name="arrow_forward" className="text-[14px]" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
