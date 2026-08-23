import { createFileRoute, Link, notFound } from "@tanstack/react-router";

import { AppShell } from "@/components/insuraguard/AppShell";
import { Icon } from "@/components/insuraguard/Icon";
import {
  CommunicationBox,
  DocumentPicker,
  ModeToggle,
  StatusTimeline,
  ValidationPanel,
} from "@/components/insuraguard/WorkflowParts";
import { formatSar, getDocumentsForVisit, getPatient, getVisit } from "@/lib/his-data";
import {
  addApprovalMessage,
  approvalStatusLabel,
  setApprovalMode,
  setApprovalStatus,
  statusChip,
  toggleApprovalDocument,
  useApproval,
  validateApproval,
  type ApprovalStatus,
} from "@/lib/rcm-store";

export const Route = createFileRoute("/approvals/$approvalId")({
  loader: ({ params }) => {
    // The store is client-side/in-memory, so we only validate the id shape here;
    // the real lookup (and 404 if it's truly missing) happens in the component
    // via useApproval, which stays reactive to store mutations.
    if (!params.approvalId) throw notFound();
    return {};
  },
  head: ({ params }) => {
    const title = `Approval ${params.approvalId} | InsuraGuard AI`;
    return {
      meta: [
        { title },
        {
          name: "description",
          content: `Review and act on approval ${params.approvalId}: documents, AI validation, status and payer communication.`,
        },
        { property: "og:title", content: title },
      ],
    };
  },
  notFoundComponent: ApprovalNotFound,
  component: ApprovalDetail,
});

function ApprovalNotFound() {
  return (
    <AppShell title="Approval not found" contentClassName="p-lg">
      <div className="mx-auto max-w-md rounded-xl border border-border-slate bg-white p-lg text-center shadow-sm">
        <Icon name="search_off" className="text-[32px] text-secondary" />
        <h1 className="mt-sm font-headline-sm text-headline-sm">Approval not found</h1>
        <Link
          to="/approvals"
          className="mt-md inline-flex items-center gap-sm rounded bg-primary px-4 py-2 font-label-caps text-label-caps text-on-primary"
        >
          Back to approvals
        </Link>
      </div>
    </AppShell>
  );
}

const nextStatuses: { value: ApprovalStatus; label: string; icon: string }[] = [
  { value: "under_review", label: "Move to review", icon: "visibility" },
  { value: "submitted", label: "Submit to payer", icon: "send" },
  { value: "approved", label: "Mark approved", icon: "check_circle" },
  { value: "additional_info", label: "Request more info", icon: "help" },
  { value: "rejected", label: "Mark rejected", icon: "cancel" },
];

function ApprovalDetail() {
  const { approvalId } = Route.useParams();
  const approval = useApproval(approvalId);

  if (!approval) {
    return <ApprovalNotFound />;
  }

  const visit = getVisit(approval.visitId);
  const patient = getPatient(approval.patientId);
  const docs = visit ? getDocumentsForVisit(visit.visitId) : [];
  const validation = validateApproval(approval);

  return (
    <AppShell title={`Approval ${approval.approvalId}`} backTo={{ to: "/approvals" }} contentClassName="p-md lg:p-lg">
      <div className="mx-auto flex max-w-5xl flex-col gap-lg">
        <div className="flex flex-wrap items-start justify-between gap-md">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface">{approval.approvalId}</h1>
            <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
              {patient?.name} · {visit?.department} · {formatSar(approval.requestedAmount)}
            </p>
          </div>
          <span className={`inline-block rounded border px-3 py-1 font-label-caps text-[11px] ${statusChip[approval.status]}`}>
            {approvalStatusLabel[approval.status]}
          </span>
        </div>

        <ModeToggle mode={approval.mode} onChange={(mode) => setApprovalMode(approval.approvalId, mode)} />

        <DocumentPicker
          documents={docs}
          selectedIds={approval.selectedDocumentIds}
          mode={approval.mode}
          onToggle={(documentId) => toggleApprovalDocument(approval.approvalId, documentId)}
        />

        <ValidationPanel result={validation} />

        <section className="rounded-xl border border-border-slate bg-white p-md">
          <h2 className="mb-sm font-label-caps text-label-caps text-on-surface">Actions</h2>
          <div className="flex flex-wrap gap-sm">
            {nextStatuses.map((s) => (
              <button
                key={s.value}
                type="button"
                disabled={approval.status === s.value}
                onClick={() =>
                  setApprovalStatus(
                    approval.approvalId,
                    s.value,
                    `Status changed to ${approvalStatusLabel[s.value]} by RCM Auditor.`,
                  )
                }
                className="flex items-center gap-1 rounded border border-border-slate px-3 py-1.5 font-label-caps text-[11px] text-on-surface transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Icon name={s.icon} className="text-[14px]" />
                {s.label}
              </button>
            ))}
          </div>
        </section>

        <StatusTimeline history={approval.history} labelFor={(s) => approvalStatusLabel[s as ApprovalStatus] ?? s} />

        <CommunicationBox
          messages={approval.messages}
          onSend={(channel, body) => addApprovalMessage(approval.approvalId, channel, body)}
        />
      </div>
    </AppShell>
  );
}
