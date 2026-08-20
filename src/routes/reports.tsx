import { createFileRoute, Link } from "@tanstack/react-router";

import { AppShell } from "@/components/insuraguard/AppShell";
import { Icon } from "@/components/insuraguard/Icon";
import { rejectionReasons } from "@/lib/mock-data";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Rejection Reports | InsuraGuard AI" },
      {
        name: "description",
        content:
          "Analyze Nphies rejection trends, denial categories and recovery opportunities across your revenue cycle.",
      },
      { property: "og:title", content: "Rejection Reports | InsuraGuard AI" },
      {
        property: "og:description",
        content: "Analyze Nphies rejection trends and denial categories across your revenue cycle.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReportsPage,
});

function ReportsPage() {
  return (
    <AppShell title="Reports" contentClassName="p-md lg:p-lg">
      <div className="flex flex-col gap-lg">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">
            Rejection Analytics
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Full breakdown of denial drivers for the current reporting period.
          </p>
        </div>

        <div className="overflow-hidden rounded-lg border border-border-slate bg-white shadow-sm">
          <div className="border-b border-border-slate bg-bg-slate-light p-md">
            <h2 className="font-headline-sm text-headline-sm text-on-surface">
              Top Rejection Reasons
            </h2>
          </div>
          <div className="flex flex-col gap-md p-md">
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
          </div>
        </div>

        <div className="flex flex-col items-start gap-sm rounded-lg border border-dashed border-border-slate bg-surface p-lg">
          <Icon name="query_stats" className="text-primary" />
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Deeper cohort and payer-level reporting is coming soon. Meanwhile, review individual
            submissions for payer responses.
          </p>
          <Link
            to="/submissions"
            className="rounded border border-primary px-3 py-1.5 font-label-caps text-label-caps text-primary"
          >
            Go to Submissions
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
