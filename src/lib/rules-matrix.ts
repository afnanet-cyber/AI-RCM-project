// ---------------------------------------------------------------------------
// Rules & Validation Matrix
//
// Every rule maps a clinical/administrative condition to one of the common
// payer rejection reasons. The engine below runs the matrix against data that
// came automatically from the HIS — nothing is typed by an employee.
// ---------------------------------------------------------------------------

import {
  getDocumentsForVisit,
  getPatient,
  serviceTotal,
  type DocumentType,
  type Visit,
} from "./his-data";

export type Severity = "critical" | "warning" | "info";

export interface Rule {
  ruleId: string;
  category: string;
  /** ICD-10 codes the rule applies to. `*` = any. */
  icd10: string[];
  /** CPT codes the rule applies to. `*` = any. */
  cpt: string[];
  /** Human readable acceptance condition. */
  condition: string;
  /** Message shown when the rule fails. */
  message: string;
  severity: Severity;
  /** Documents that must be attached for the rule to pass. */
  requiredDocuments?: DocumentType[];
}

export const rulesMatrix: Rule[] = [
  {
    ruleId: "R-01",
    category: "Coding",
    icd10: ["*"],
    cpt: ["*"],
    condition: "The procedure (CPT) must be clinically consistent with the diagnosis (ICD-10).",
    message: "Procedure does not match the recorded diagnosis (ICD-10 / CPT mismatch).",
    severity: "critical",
  },
  {
    ruleId: "R-02",
    category: "Eligibility",
    icd10: ["*"],
    cpt: ["*"],
    condition: "Patient policy must be active on the service date.",
    message: "Patient is not eligible — policy inactive or expired on the service date.",
    severity: "critical",
  },
  {
    ruleId: "R-03",
    category: "Authorization",
    icd10: ["*"],
    cpt: ["33208", "70486", "70450"],
    condition: "High-cost procedures require a prior approval reference before service delivery.",
    message: "Missing prior authorization for a procedure that requires pre-approval.",
    severity: "critical",
  },
  {
    ruleId: "R-04",
    category: "Documentation",
    icd10: ["*"],
    cpt: ["*"],
    condition: "A medical report supporting the encounter must be attached.",
    message: "Missing medical report / clinical notes supporting the billed service.",
    severity: "critical",
    requiredDocuments: ["medical_report"],
  },
  {
    ruleId: "R-05",
    category: "Documentation",
    icd10: ["*"],
    cpt: ["70486", "70450", "33208"],
    condition: "Imaging and surgical procedures require a written medical justification.",
    message: "Missing medical justification for the requested procedure.",
    severity: "critical",
    requiredDocuments: ["medical_justification"],
  },
  {
    ruleId: "R-06",
    category: "Documentation",
    icd10: ["*"],
    cpt: ["85025", "83036"],
    condition: "Billed laboratory services require the corresponding lab result.",
    message: "Laboratory service billed without the supporting result document.",
    severity: "warning",
    requiredDocuments: ["lab"],
  },
  {
    ruleId: "R-07",
    category: "Documentation",
    icd10: ["*"],
    cpt: ["70486", "70450"],
    condition: "Billed imaging requires the radiology report.",
    message: "Radiology service billed without the radiology report.",
    severity: "warning",
    requiredDocuments: ["radiology"],
  },
  {
    ruleId: "R-08",
    category: "Documentation",
    icd10: ["I21.9"],
    cpt: ["93000", "33208"],
    condition: "Cardiac claims require the ECG tracing.",
    message: "Cardiac diagnosis billed without an ECG document.",
    severity: "warning",
    requiredDocuments: ["ecg"],
  },
  {
    ruleId: "R-09",
    category: "Billing",
    icd10: ["*"],
    cpt: ["*"],
    condition: "An itemised invoice must be attached to every claim.",
    message: "Missing itemised invoice — the payer cannot price the claim.",
    severity: "critical",
    requiredDocuments: ["invoice"],
  },
  {
    ruleId: "R-10",
    category: "Inpatient",
    icd10: ["*"],
    cpt: ["*"],
    condition: "Inpatient stays require an admission note and a discharge summary.",
    message: "Inpatient claim missing admission note or discharge summary.",
    severity: "critical",
    requiredDocuments: ["admission_note", "discharge_summary"],
  },
  {
    ruleId: "R-11",
    category: "Coverage",
    icd10: ["*"],
    cpt: ["*"],
    condition: "Claim total must stay within the policy coverage limit.",
    message: "Service exceeds the coverage limit / annual policy ceiling.",
    severity: "warning",
  },
  {
    ruleId: "R-12",
    category: "Billing",
    icd10: ["*"],
    cpt: ["*"],
    condition: "The same CPT code must not be billed twice for the same encounter.",
    message: "Duplicate service line detected for the same encounter.",
    severity: "critical",
  },
  {
    ruleId: "R-13",
    category: "Timeliness",
    icd10: ["*"],
    cpt: ["*"],
    condition: "The claim must be submitted within 30 days of the service date.",
    message: "Late submission — the payer filing window has been exceeded.",
    severity: "warning",
  },
  {
    ruleId: "R-14",
    category: "Coverage",
    icd10: ["*"],
    cpt: ["*"],
    condition: "Service must not fall under a policy exclusion (cosmetic, dental, optical).",
    message: "Service appears to fall under a policy exclusion.",
    severity: "info",
  },
  {
    ruleId: "R-15",
    category: "Medications",
    icd10: ["*"],
    cpt: ["*"],
    condition: "Dispensed medication must be recorded and linked to the diagnosis.",
    message: "Medication charges without a pharmacy dispense record.",
    severity: "warning",
    requiredDocuments: ["medication"],
  },
];

export interface ValidationIssue {
  ruleId: string;
  category: string;
  severity: Severity;
  message: string;
  detail: string;
  /** Suggested corrective action shown to the auditor. */
  suggestion: string;
}

export interface ValidationResult {
  issues: ValidationIssue[];
  score: number;
  passedRules: number;
  totalRules: number;
}

function ruleApplies(rule: Rule, icd: string, cptCodes: string[]) {
  const icdOk = rule.icd10.includes("*") || rule.icd10.includes(icd);
  const cptOk = rule.cpt.includes("*") || rule.cpt.some((c) => cptCodes.includes(c));
  return icdOk && cptOk;
}

export interface ValidationInput {
  visit: Visit;
  /** Document ids selected for submission. */
  selectedDocumentIds: string[];
  /** Prior authorization reference, if any. */
  authorizationRef?: string;
  /** Policy ceiling used by the coverage rule. */
  coverageLimit?: number;
  /** Date the package is being submitted (ISO). */
  submissionDate?: string;
}

export function runValidation({
  visit,
  selectedDocumentIds,
  authorizationRef,
  coverageLimit = 5000,
  submissionDate = new Date().toISOString().slice(0, 10),
}: ValidationInput): ValidationResult {
  const patient = getPatient(visit.patientId);
  const visitDocs = getDocumentsForVisit(visit.visitId);
  const selected = visitDocs.filter((d) => selectedDocumentIds.includes(d.documentId));
  const selectedTypes = new Set(selected.map((d) => d.documentType));
  const cptCodes = visit.services.map((s) => s.code);
  const total = serviceTotal(visit.services);

  const issues: ValidationIssue[] = [];
  let applicable = 0;

  for (const rule of rulesMatrix) {
    if (!ruleApplies(rule, visit.diagnosisCode, cptCodes)) continue;
    if (rule.ruleId === "R-10" && visit.visitType !== "inpatient") continue;
    applicable += 1;

    let failed = false;
    let detail = "";

    if (rule.requiredDocuments?.length) {
      const missing = rule.requiredDocuments.filter((t) => !selectedTypes.has(t));
      if (missing.length) {
        failed = true;
        detail = `Missing: ${missing.join(", ")}`;
      }
    }

    switch (rule.ruleId) {
      case "R-02":
        if (patient?.eligibility !== "active") {
          failed = true;
          detail = `Policy ${patient?.insurancePolicyNumber ?? "—"} is ${patient?.eligibility ?? "unknown"}.`;
        }
        break;
      case "R-03":
        if (!authorizationRef) {
          failed = true;
          detail = "No approval reference is linked to this encounter.";
        }
        break;
      case "R-11":
        if (total > coverageLimit) {
          failed = true;
          detail = `Claim total ${total.toLocaleString()} SAR exceeds the ${coverageLimit.toLocaleString()} SAR ceiling.`;
        }
        break;
      case "R-12": {
        const seen = new Set<string>();
        const dupes = cptCodes.filter((c) => (seen.has(c) ? true : (seen.add(c), false)));
        if (dupes.length) {
          failed = true;
          detail = `Duplicate CPT: ${[...new Set(dupes)].join(", ")}`;
        }
        break;
      }
      case "R-13": {
        const days =
          (new Date(submissionDate).getTime() - new Date(visit.visitDate).getTime()) / 86_400_000;
        if (days > 30) {
          failed = true;
          detail = `${Math.round(days)} days since the service date.`;
        }
        break;
      }
      default:
        break;
    }

    if (failed) {
      issues.push({
        ruleId: rule.ruleId,
        category: rule.category,
        severity: rule.severity,
        message: rule.message,
        detail: detail || rule.condition,
        suggestion: suggestionFor(rule),
      });
    }
  }

  const passedRules = applicable - issues.length;
  const score = applicable === 0 ? 100 : Math.round((passedRules / applicable) * 100);

  return { issues, score, passedRules, totalRules: applicable };
}

function suggestionFor(rule: Rule): string {
  if (rule.requiredDocuments?.length) {
    return "Attach the missing document from the HIS document list before submission.";
  }
  switch (rule.ruleId) {
    case "R-02":
      return "Re-run the eligibility check with the payer, or update the policy on the patient record in the HIS.";
    case "R-03":
      return "Create an approval request for this encounter and link the approval reference to the claim.";
    case "R-11":
      return "Split the claim or request an exception letter from the payer.";
    case "R-12":
      return "Remove the duplicated service line before submission.";
    case "R-13":
      return "Submit immediately and attach a delay justification letter.";
    default:
      return "Review the encounter against the payer policy before submission.";
  }
}

export const severityStyles: Record<Severity, { chip: string; icon: string; label: string }> = {
  critical: {
    chip: "bg-red-50 text-red-700 border-red-200",
    icon: "error",
    label: "Critical",
  },
  warning: {
    chip: "bg-amber-50 text-amber-700 border-amber-200",
    icon: "warning",
    label: "Warning",
  },
  info: {
    chip: "bg-sky-50 text-sky-700 border-sky-200",
    icon: "info",
    label: "Info",
  },
};
