import { createFileRoute, Link } from "@tanstack/react-router";

import { AppShell } from "@/components/insuraguard/AppShell";
import { Icon } from "@/components/insuraguard/Icon";
import { findSubmission, type SubmissionStatus } from "@/lib/mock-data";

export const Route = createFileRoute("/submissions/$submissionId")({
  head: ({ params }) => ({
    meta: [
      { title: `Submission ${params.submissionId} | InsuraGuard AI` },
      {
        name: "description",
        content: `Nphies submission detail, payer response and service lines for claim ${params.submissionId}.`,
      },
      { property: "og:title", content: `Submission ${params.submissionId} | InsuraGuard AI` },
      {
        property: "og:description",
        content: "Nphies submission detail, payer response and service lines.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SubmissionDetail,
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

function SubmissionDetail() {
  const { submissionId } = Route.useParams();
  const submission = findSubmission(submissionId);

  if (!submission) {
    return (
      <AppShell title="Submission" contentClassName="p-md lg:p-lg">
        <div className="flex flex-col items-start gap-sm rounded-lg border border-border-slate bg-white p-lg shadow-sm">
          <Icon name="search_off" className="text-critical-amethyst" />
          <h1 className="font-headline-sm text-headline-sm text-on-surface">
            Submission {submissionId} not found
          </h1>
          <Link
            to="/submissions"
            className="rounded border border-primary px-3 py-1.5 font-label-caps text-label-caps text-primary"
          >
            Back to Submissions
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Submission Detail" contentClassName="p-md lg:p-lg">
      <div className="flex flex-col gap-lg">
        <div className="flex flex-wrap items-center justify-between gap-sm">
          <div>
            <Link
              to="/submissions"
              className="mb-1 inline-flex items-center gap-1 font-label-caps text-label-caps text-primary"
            >
              <Icon name="arrow_back" className="text-[14px]" />
              Submissions
            </Link>
            <h1 className="font-headline-lg text-headline-lg text-on-surface">
              {submission.id}
            </h1>
            <p className="font-data-mono text-body-sm text-on-surface-variant">
              Nphies Ref {submission.ref} · {submission.submittedAt}
            </p>
          </div>
          <span
            className={`inline-flex items-center gap-1 rounded px-2 py-1 font-label-caps text-[11px] uppercase ${statusChip[submission.status]}`}
          >
            <Icon name={statusIcon[submission.status]} className="text-[14px]" />
            {submission.status}
          </span>
        </div>

        {submission.payerReason && (
          <div className="rounded-lg border border-border-slate bg-error-container p-md">
            <div className="mb-1 flex items-center gap-1 font-label-caps text-label-caps text-on-error-container">
              <Icon name="report" className="text-[16px]" />
              Payer Response
            </div>
            <p className="font-body-sm text-body-sm text-on-error-container">
              {submission.payerReason}
            </p>
          </div>
        )}

        <div className="grid gap-md md:grid-cols-2">
          <div className="rounded-lg border border-border-slate bg-white p-md shadow-sm">
            <h2 className="mb-sm font-headline-sm text-headline-sm text-on-surface">Patient</h2>
            <dl className="grid grid-cols-2 gap-y-2 font-body-sm text-body-sm">
              <dt className="text-on-surface-variant">Name</dt>
              <dd className="text-on-surface">{submission.patient}</dd>
              <dt className="text-on-surface-variant">MRN</dt>
              <dd className="font-data-mono text-on-surface">{submission.mrn}</dd>
              <dt className="text-on-surface-variant">Encounter</dt>
              <dd className="text-on-surface">{submission.encounterType}</dd>
              <dt className="text-on-surface-variant">Diagnosis</dt>
              <dd className="text-on-surface">{submission.diagnosis}</dd>
            </dl>
          </div>
          <div className="rounded-lg border border-border-slate bg-white p-md shadow-sm">
            <h2 className="mb-sm font-headline-sm text-headline-sm text-on-surface">Provider</h2>
            <dl className="grid grid-cols-2 gap-y-2 font-body-sm text-body-sm">
              <dt className="text-on-surface-variant">Physician</dt>
              <dd className="text-on-surface">{submission.provider}</dd>
              <dt className="text-on-surface-variant">Specialty</dt>
              <dd className="text-on-surface">{submission.specialty}</dd>
              <dt className="text-on-surface-variant">Claim Amount</dt>
              <dd className="font-data-mono text-on-surface">{submission.amount}</dd>
            </dl>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-border-slate bg-white shadow-sm">
          <div className="border-b border-border-slate bg-bg-slate-light p-md">
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Service Lines</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left font-body-sm text-body-sm">
              <thead className="border-b border-border-slate bg-bg-slate-light">
                <tr className="font-label-caps text-label-caps text-on-surface-variant">
                  <th className="px-md py-sm">Code</th>
                  <th className="px-md py-sm">Description</th>
                  <th className="px-md py-sm">Qty</th>
                  <th className="px-md py-sm">Amount</th>
                  <th className="px-md py-sm">Status</th>
                </tr>
              </thead>
              <tbody>
                {submission.lines.map((l) => (
                  <tr key={l.code} className="border-b border-border-slate last:border-0">
                    <td className="px-md py-sm font-data-mono text-primary">{l.code}</td>
                    <td className="px-md py-sm text-on-surface">{l.description}</td>
                    <td className="px-md py-sm font-data-mono text-on-surface">{l.qty}</td>
                    <td className="px-md py-sm font-data-mono text-on-surface">{l.amount}</td>
                    <td className="px-md py-sm whitespace-nowrap">
                      {l.denied ? (
                        <span className="font-medium text-critical-amethyst">Denied</span>
                      ) : (
                        <span className="font-medium text-success-emerald">Paid</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-wrap gap-sm">
          <Link
            to="/workspace/$claimId"
            params={{ claimId: submission.id }}
            className="rounded bg-primary px-4 py-2 font-label-caps text-label-caps text-white"
          >
            Correct &amp; Resubmit
          </Link>
          <Link
            to="/submissions"
            className="rounded border border-primary px-4 py-2 font-label-caps text-label-caps text-primary"
          >
            Back to History
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
