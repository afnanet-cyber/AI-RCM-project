import { createFileRoute, Link } from "@tanstack/react-router";

import { AppShell } from "@/components/insuraguard/AppShell";
import { Icon } from "@/components/insuraguard/Icon";
import { claims, metrics, rejectionReasons, riskLabel } from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Operational Dashboard | InsuraGuard AI" },
      {
        name: "description",
        content:
          "Real-time RCM claim status, AI risk flags and Nphies validation metrics for Al Noor Hospital.",
      },
      { property: "og:title", content: "Operational Dashboard | InsuraGuard AI" },
      {
        property: "og:description",
        content:
          "Real-time RCM claim status, AI risk flags and Nphies validation metrics.",
      },
    ],
  }),
  component: DashboardPage,
});

const riskChip: Record<string, string> = {
  high: "bg-critical-amethyst text-white",
  medium: "bg-warning-amber text-white",
  low: "bg-surface-variant text-secondary",
};
const riskIcon: Record<string, string> = {
  high: "priority_high",
  medium: "warning",
  low: "check",
};

function DashboardPage() {
  return (
    <AppShell title="Operational Dashboard" contentClassName="p-md lg:p-lg">
      <div className="flex flex-col gap-lg">
        {/* Header & filters */}
        <div className="flex flex-col gap-md">
          <div className="flex flex-wrap items-end justify-between gap-md">
            <div>
              <h1 className="font-headline-md text-headline-md text-on-surface">
                Operational Dashboard
              </h1>
              <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
                Real-time claim status and validation metrics.
              </p>
            </div>
            <Link
              to="/workspace/$claimId"
              params={{ claimId: "CLM-2023-891A" }}
              className="flex items-center gap-sm rounded bg-primary px-4 py-2 font-label-caps text-label-caps text-on-primary shadow-md transition-opacity hover:opacity-90"
            >
              <Icon name="add" className="text-[18px]" />
              New Claim
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-md border-b border-border-slate pb-sm">
            <div className="flex items-center gap-2 rounded border border-border-slate bg-white px-3 py-1.5 font-body-sm text-body-sm">
              <Icon name="calendar_today" className="text-[16px] text-on-surface-variant" />
              <span className="font-medium text-on-surface">Last 7 Days</span>
              <Icon name="arrow_drop_down" className="text-[16px] text-on-surface-variant" />
            </div>
            <div className="flex items-center gap-2 rounded border border-border-slate bg-white px-3 py-1.5 font-body-sm text-body-sm">
              <Icon name="account_balance" className="text-[16px] text-on-surface-variant" />
              <span className="font-medium text-on-surface">All Payers</span>
              <Icon name="arrow_drop_down" className="text-[16px] text-on-surface-variant" />
            </div>
            <button
              type="button"
              className="ml-auto font-label-caps text-label-caps text-primary hover:underline"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Key metrics */}
        <div className="grid grid-cols-1 gap-md sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((m) => (
            <div
              key={m.label}
              className="relative overflow-hidden rounded-lg border border-border-slate bg-white p-3 shadow-sm"
            >
              <div className={`absolute top-0 left-0 h-full w-1 ${m.accent}`} />
              <h2 className="mb-1 font-label-caps text-label-caps text-on-surface-variant">
                {m.label}
              </h2>
              <div className="flex items-end justify-between">
                <span
                  className={
                    m.mono
                      ? "font-data-mono text-[24px] leading-tight text-on-surface"
                      : "font-display-lg text-display-lg text-on-surface"
                  }
                >
                  {m.value}
                </span>
                <Icon name={m.icon} className={m.iconColor} />
              </div>
            </div>
          ))}
        </div>

        {/* Split: activity table + rejection reasons */}
        <div className="grid grid-cols-1 gap-md xl:grid-cols-12">
          <div className="flex flex-col overflow-hidden rounded-lg border border-border-slate bg-white shadow-sm xl:col-span-8">
            <div className="flex items-center justify-between border-b border-border-slate bg-bg-slate-light px-md py-2">
              <h2 className="font-headline-sm text-headline-sm text-on-surface">
                Recent Activity
              </h2>
              <Link
                to="/workspace"
                className="flex items-center gap-1 font-label-caps text-label-caps text-primary hover:underline"
              >
                View All <Icon name="arrow_forward" className="text-[16px]" />
              </Link>
            </div>
            <div className="flex-1 overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-border-slate bg-bg-slate-light font-label-caps text-label-caps text-on-surface-variant">
                    <th className="px-md py-sm font-medium">Patient ID</th>
                    <th className="px-md py-sm font-medium">Claim ID</th>
                    <th className="px-md py-sm font-medium">Service Type</th>
                    <th className="px-md py-sm font-medium">Risk Score</th>
                    <th className="px-md py-sm font-medium">Status</th>
                    <th className="px-md py-sm font-medium">Time</th>
                    <th className="px-md py-sm text-right font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="font-body-sm text-body-sm">
                  {claims.slice(0, 5).map((c) => (
                    <tr
                      key={c.id}
                      className="group border-b border-border-slate transition-colors last:border-0 hover:bg-bg-slate-light"
                    >
                      <td className="px-md py-sm font-data-mono text-on-surface">
                        {c.patientMasked}
                      </td>
                      <td className="px-md py-sm font-data-mono text-primary">{c.id}</td>
                      <td className="px-md py-sm whitespace-nowrap text-on-surface">
                        {c.serviceType}
                      </td>
                      <td className="px-md py-sm">
                        <span
                          className={`inline-flex items-center gap-1 rounded px-2 py-0.5 font-label-caps text-[10px] ${riskChip[c.risk]}`}
                        >
                          <Icon name={riskIcon[c.risk] ?? "info"} className="text-[12px]" />
                          {riskLabel[c.risk]}
                        </span>
                      </td>
                      <td className="px-md py-sm whitespace-nowrap">
                        {c.status === "validated" ? (
                          <span className="inline-flex items-center gap-1 rounded bg-success-emerald px-2 py-0.5 font-label-caps text-[10px] text-white">
                            <Icon name="check_circle" className="text-[12px]" />
                            Validated
                          </span>
                        ) : c.status === "flagged" ? (
                          <span className="font-medium text-critical-amethyst">Flagged</span>
                        ) : (
                          <span className="font-medium text-warning-amber">Review Needed</span>
                        )}
                      </td>
                      <td className="px-md py-sm whitespace-nowrap text-on-surface-variant">
                        {c.time}
                      </td>
                      <td className="px-md py-sm text-right">
                        <Link
                          to="/workspace/$claimId"
                          params={{ claimId: c.id }}
                          className="rounded border border-primary px-2 py-1 font-label-caps text-[11px] text-primary transition-opacity md:opacity-0 md:group-hover:opacity-100"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-col overflow-hidden rounded-lg border border-border-slate bg-white shadow-sm xl:col-span-4">
            <div className="border-b border-border-slate bg-bg-slate-light p-md">
              <h2 className="font-headline-sm text-headline-sm text-on-surface">
                Top Rejection Reasons
              </h2>
            </div>
            <div className="flex flex-1 flex-col justify-center gap-md p-md">
              {rejectionReasons.map((r) => (
                <div key={r.label} className="flex flex-col gap-1">
                  <div className="flex justify-between font-label-sm text-label-sm">
                    <span className="text-on-surface">{r.label}</span>
                    <span className="font-data-mono text-secondary">{r.pct}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-surface-variant">
                    <div className={`h-full rounded-full ${r.bar}`} style={{ width: `${r.pct}%` }} />
                  </div>
                </div>
              ))}
              <Link
                to="/reports"
                className="mt-sm font-label-caps text-label-caps text-primary hover:underline"
              >
                Open full rejection report
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
