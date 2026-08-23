// ---------------------------------------------------------------------------
// In-memory RCM state store (approvals + claims).
//
// Everything is seeded automatically from the HIS layer — employees never key
// in patient or clinical data. The store only tracks workflow state: which
// documents are attached, validation results, status history and messages.
// ---------------------------------------------------------------------------

import { useSyncExternalStore } from "react";

import {
  getDocumentsForPeriod,
  getDocumentsForVisit,
  getPatient,
  getVisit,
  serviceTotal,
  visits,
  type HisDocument,
  type Visit,
} from "./his-data";
import { runValidation, type ValidationResult } from "./rules-matrix";

export type WorkMode = "ai" | "manual";

export type ApprovalStatus =
  | "draft"
  | "under_review"
  | "submitted"
  | "pending_payer"
  | "additional_info"
  | "approved"
  | "rejected";

export type ClaimStatus =
  | "draft"
  | "under_review"
  | "submitted"
  | "pending_payer"
  | "additional_info"
  | "paid"
  | "rejected";

export const approvalStatusLabel: Record<ApprovalStatus, string> = {
  draft: "Draft",
  under_review: "Under Review",
  submitted: "Submitted",
  pending_payer: "Pending Payer",
  additional_info: "Additional Info Requested",
  approved: "Approved",
  rejected: "Rejected",
};

export const claimStatusLabel: Record<ClaimStatus, string> = {
  draft: "Draft",
  under_review: "Under Review",
  submitted: "Submitted",
  pending_payer: "Pending Payer",
  additional_info: "Additional Info Requested",
  paid: "Paid",
  rejected: "Rejected",
};

export const statusChip: Record<string, string> = {
  draft: "bg-surface-variant text-secondary border-border-slate",
  under_review: "bg-sky-50 text-sky-700 border-sky-200",
  submitted: "bg-blue-50 text-blue-700 border-blue-200",
  pending_payer: "bg-amber-50 text-amber-700 border-amber-200",
  additional_info: "bg-purple-50 text-purple-700 border-purple-200",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
};

export interface StatusEvent {
  at: string;
  status: string;
  actor: string;
  note: string;
}

export interface Message {
  messageId: string;
  channel: "internal" | "payer";
  author: string;
  at: string;
  body: string;
}

export interface Approval {
  approvalId: string;
  visitId: string;
  patientId: string;
  type: "outpatient" | "inpatient";
  status: ApprovalStatus;
  mode: WorkMode;
  createdAt: string;
  requestedAmount: number;
  approvalRef?: string;
  payerDecisionNote?: string;
  selectedDocumentIds: string[];
  history: StatusEvent[];
  messages: Message[];
}

export interface Claim {
  claimId: string;
  visitId: string;
  patientId: string;
  type: "outpatient" | "inpatient";
  status: ClaimStatus;
  mode: WorkMode;
  createdAt: string;
  periodStart: string;
  periodEnd: string;
  amount: number;
  linkedApprovalId?: string;
  selectedDocumentIds: string[];
  history: StatusEvent[];
  messages: Message[];
}

interface State {
  approvals: Approval[];
  claims: Claim[];
}

function nowIso() {
  return new Date().toISOString();
}

/** AI mode auto-selects every clinically relevant document from the HIS. */
export function aiSelectDocuments(docs: HisDocument[]) {
  return docs.map((d) => d.documentId);
}

function seedApproval(
  approvalId: string,
  visit: Visit,
  status: ApprovalStatus,
  mode: WorkMode,
  extra: Partial<Approval> = {},
): Approval {
  const docs = getDocumentsForVisit(visit.visitId);
  return {
    approvalId,
    visitId: visit.visitId,
    patientId: visit.patientId,
    type: visit.visitType === "inpatient" ? "inpatient" : "outpatient",
    status,
    mode,
    createdAt: visit.visitDate,
    requestedAmount: serviceTotal(visit.services),
    selectedDocumentIds: mode === "ai" ? aiSelectDocuments(docs) : [],
    history: [
      { at: visit.visitDate, status: "draft", actor: "System (HIS sync)", note: "Encounter imported automatically from the hospital system." },
    ],
    messages: [],
    ...extra,
  };
}

function seedClaim(
  claimId: string,
  visit: Visit,
  status: ClaimStatus,
  mode: WorkMode,
  extra: Partial<Claim> = {},
): Claim {
  const periodStart = visit.admissionDate ?? visit.visitDate;
  const periodEnd = visit.dischargeDate ?? visit.visitDate;
  const docs = getDocumentsForPeriod(visit.patientId, periodStart, periodEnd);
  return {
    claimId,
    visitId: visit.visitId,
    patientId: visit.patientId,
    type: visit.visitType === "inpatient" ? "inpatient" : "outpatient",
    status,
    mode,
    createdAt: periodEnd,
    periodStart,
    periodEnd,
    amount: serviceTotal(visit.services),
    selectedDocumentIds: mode === "ai" ? aiSelectDocuments(docs) : [],
    history: [
      { at: periodEnd, status: "draft", actor: "System (HIS sync)", note: "Claim period documents collected automatically from the hospital system." },
    ],
    messages: [],
    ...extra,
  };
}

function buildInitialState(): State {
  const v = (id: string) => getVisit(id)!;
  const approvals: Approval[] = [
    seedApproval("APR-4401", v("VIS-55001"), "approved", "ai", {
      approvalRef: "NPH-APR-77120",
      payerDecisionNote: "Approved for CT maxillofacial and consultation.",
    }),
    seedApproval("APR-4402", v("VIS-55102"), "pending_payer", "ai"),
    seedApproval("APR-4403", v("VIS-55210"), "additional_info", "manual", {
      payerDecisionNote: "Payer requests the ER observation chart.",
    }),
    seedApproval("APR-4404", v("VIS-55301"), "draft", "manual"),
    seedApproval("APR-4405", v("VIS-55014"), "submitted", "ai"),
  ];

  const claims: Claim[] = [
    seedClaim("CLM-7701", v("VIS-55001"), "paid", "ai", { linkedApprovalId: "APR-4401" }),
    seedClaim("CLM-7702", v("VIS-55102"), "under_review", "ai", { linkedApprovalId: "APR-4402" }),
    seedClaim("CLM-7703", v("VIS-55210"), "rejected", "manual"),
    seedClaim("CLM-7704", v("VIS-55301"), "draft", "manual"),
  ];

  return { approvals, claims };
}

let state: State = buildInitialState();
const listeners = new Set<() => void>();

function emit() {
  state = { approvals: [...state.approvals], claims: [...state.claims] };
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return state;
}

export function useRcmState() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function useApprovals() {
  return useRcmState().approvals;
}

export function useClaims() {
  return useRcmState().claims;
}

export function useApproval(approvalId: string) {
  return useRcmState().approvals.find((a) => a.approvalId === approvalId);
}

export function useClaim(claimId: string) {
  return useRcmState().claims.find((c) => c.claimId === claimId);
}

// --- mutations -------------------------------------------------------------

export function setApprovalMode(approvalId: string, mode: WorkMode) {
  state.approvals = state.approvals.map((a) => {
    if (a.approvalId !== approvalId) return a;
    const docs = getDocumentsForVisit(a.visitId);
    return {
      ...a,
      mode,
      selectedDocumentIds: mode === "ai" ? aiSelectDocuments(docs) : [],
    };
  });
  emit();
}

export function toggleApprovalDocument(approvalId: string, documentId: string) {
  state.approvals = state.approvals.map((a) =>
    a.approvalId === approvalId
      ? {
          ...a,
          selectedDocumentIds: a.selectedDocumentIds.includes(documentId)
            ? a.selectedDocumentIds.filter((d) => d !== documentId)
            : [...a.selectedDocumentIds, documentId],
        }
      : a,
  );
  emit();
}

export function setApprovalStatus(approvalId: string, status: ApprovalStatus, note: string) {
  state.approvals = state.approvals.map((a) =>
    a.approvalId === approvalId
      ? {
          ...a,
          status,
          history: [
            ...a.history,
            { at: nowIso(), status, actor: "RCM Auditor", note },
          ],
        }
      : a,
  );
  emit();
}

export function addApprovalMessage(approvalId: string, channel: Message["channel"], body: string) {
  state.approvals = state.approvals.map((a) =>
    a.approvalId === approvalId
      ? {
          ...a,
          messages: [
            ...a.messages,
            { messageId: `MSG-${Date.now()}`, channel, author: "RCM Auditor", at: nowIso(), body },
          ],
        }
      : a,
  );
  emit();
}

export function setClaimMode(claimId: string, mode: WorkMode) {
  state.claims = state.claims.map((c) => {
    if (c.claimId !== claimId) return c;
    const docs = getDocumentsForPeriod(c.patientId, c.periodStart, c.periodEnd);
    return { ...c, mode, selectedDocumentIds: mode === "ai" ? aiSelectDocuments(docs) : [] };
  });
  emit();
}

export function toggleClaimDocument(claimId: string, documentId: string) {
  state.claims = state.claims.map((c) =>
    c.claimId === claimId
      ? {
          ...c,
          selectedDocumentIds: c.selectedDocumentIds.includes(documentId)
            ? c.selectedDocumentIds.filter((d) => d !== documentId)
            : [...c.selectedDocumentIds, documentId],
        }
      : c,
  );
  emit();
}

export function setClaimStatus(claimId: string, status: ClaimStatus, note: string) {
  state.claims = state.claims.map((c) =>
    c.claimId === claimId
      ? { ...c, status, history: [...c.history, { at: nowIso(), status, actor: "RCM Auditor", note }] }
      : c,
  );
  emit();
}

export function addClaimMessage(claimId: string, channel: Message["channel"], body: string) {
  state.claims = state.claims.map((c) =>
    c.claimId === claimId
      ? {
          ...c,
          messages: [
            ...c.messages,
            { messageId: `MSG-${Date.now()}`, channel, author: "RCM Auditor", at: nowIso(), body },
          ],
        }
      : c,
  );
  emit();
}

// --- derived helpers -------------------------------------------------------

export function validateApproval(approval: Approval): ValidationResult | undefined {
  const visit = getVisit(approval.visitId);
  if (!visit) return undefined;
  return runValidation({
    visit,
    selectedDocumentIds: approval.selectedDocumentIds,
    authorizationRef: approval.approvalRef,
    submissionDate: visit.visitDate,
  });
}

export function validateClaim(claim: Claim): ValidationResult | undefined {
  const visit = getVisit(claim.visitId);
  if (!visit) return undefined;
  const approval = state.approvals.find((a) => a.approvalId === claim.linkedApprovalId);
  return runValidation({
    visit,
    selectedDocumentIds: claim.selectedDocumentIds,
    authorizationRef: approval?.approvalRef,
    submissionDate: claim.periodEnd,
  });
}

export function patientName(patientId: string) {
  return getPatient(patientId)?.name ?? patientId;
}

export function allVisits() {
  return visits;
}
