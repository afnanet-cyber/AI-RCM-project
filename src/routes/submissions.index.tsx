import { createFileRoute, Link } from "@tanstack/react-router";

import { AppShell } from "@/components/insuraguard/AppShell";
import { Icon } from "@/components/insuraguard/Icon";
import { submissions, type SubmissionStatus } from "@/lib/mock-data";

export const Route = createFileRoute("/submissions/")({
  head: () => ({
    meta: [
      { title: "Submission History | InsuraGuard AI" },
      {
        name: "description",
        content:
          "Track Nphies claim submissions, payer responses and rejection reasons in one place.",
      },
      { property: "og:title", content: "Submission History | InsuraGuard AI" },
      {
        property: "og:description",
        content: "Track Nphies claim submissions, payer responses and rejection reasons.",
      },
    ],
  }),
  component: SubmissionsList,
});

const statusChip: Record<SubmissionStatus, string> = {
  rejected: "bg-error-container text-on-error-container",
  accepted: "bg-success-emerald text-white",
  pending: "bg-warning-amber text-white",
};
const statusIcon: Record<SubmissionStatus, string> = {
  rejected: "cancel",
  accepted: "check_circle",
  pending: "hourglass_top",
};

function SubmissionsList() {
  return (
    <AppShell title="Submissions" contentClassName="p-md lg:p-lg">
      <div className="flex flex-col gap-lg">
        <div className="flex flex-wrap items-end justify-between gap-md">
          <div>
            <h1 className="font-headline-md text-headline-md text-on-surface">
              Submission History
            </h1>
            <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
              Nphies transactions and payer responses for the last 7 days.
            </p>
          </div>
          <Link
            to="/workspace"
            className="flex items-center gap-sm rounded bg-primary px-4 py-2 font-label-caps text-label-caps text-on-primary shadow-md transition-opacity hover:opacity-90"
          >
            <Icon name="clinical_notes" className="text-[18px]" />
            Go to Workspace
          </Link>
        </div>

        <div className="overflow-hidden rounded-lg border border-border-slate bg-white shadow-sm">
          <div className="border-b border-border-slate bg-bg-slate-light px-md py-2 font-label-caps text-label-caps text-on-surface">
            {submissions.length} Transactions
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-border-slate bg-bg-slate-light font-label-caps text-label-caps text-on-surface-variant">
                  <th className="px-md py-sm font-medium">Claim ID</th>
                  <th className="px-md py-sm font-medium">Patient</th>
                  <th className="px-md py-sm font-medium">Nphies Ref</th>
                  <th className="px-md py-sm font-medium">Amount</th>
                  <th className="px-md py-sm font-medium">Status</th>
                  <th className="px-md py-sm font-medium">Submitted</th>
                  <th className="px-md py-sm text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="font-body-sm text-body-sm">
                {submissions.map((s) => (
                  <tr
                    key={s.id}
                    className="group border-b border-border-slate transition-colors last:border-0 hover:bg-bg-slate-light"
                  >
                    <td className="px-md py-sm font-data-mono whitespace-nowrap text-primary">
                      {s.id}
                    </td>
                    <td className="px-md py-sm whitespace-nowrap text-on-surface">{s.patient}</td>
                    <td className="px-md py-sm font-data-mono whitespace-nowrap text-on-surface-variant">
                      {s.ref}
                    </td>
                    <td className="px-md py-sm font-data-mono whitespace-nowrap text-on-surface">
                      {s.amount}
                    </td>
                    <td className="px-md py-sm">
                      <span
                        className={`inline-flex items-center gap-1 rounded px-2 py-0.5 font-label-caps text-[10px] uppercase ${statusChip[s.status]}`}
                      >
                        <Icon name={statusIcon[s.status]} className="text-[12px]" />
                        {s.status}
                      </span>
                    </td>
                    <td className="px-md py-sm whitespace-nowrap text-on-surface-variant">
                      {s.submittedAt}
                    </td>
                    <td className="px-md py-sm text-right">
                      <Link
                        to="/submissions/$submissionId"
                        params={{ submissionId: s.id }}
                        className="rounded border border-primary px-2 py-1 font-label-caps text-[11px] whitespace-nowrap text-primary transition-opacity md:opacity-0 md:group-hover:opacity-100"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
