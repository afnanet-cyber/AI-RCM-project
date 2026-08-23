// Mock data extracted from the original InsuraGuard AI (Stitch) designs.
// UI-only fixtures — no backend calls.

export type RiskLevel = "high" | "medium" | "low";
export type ClaimStatus = "flagged" | "review" | "validated";

export interface ClaimRow {
  id: string;
  patientMasked: string;
  patientName: string;
  serviceType: string;
  risk: RiskLevel;
  status: ClaimStatus;
  time: string;
  totalSar: string;
}

export const claims: ClaimRow[] = [
  {
    id: "CLM-2023-A01",
    patientMasked: "***-8921",
    patientName: "Ahmed Al-Sayed",
    serviceType: "Inpatient",
    risk: "high",
    status: "flagged",
    time: "10:42 AM",
    totalSar: "450.00",
  },
  {
    id: "CLM-2023-A02",
    patientMasked: "***-4450",
    patientName: "Mona Al-Harbi",
    serviceType: "Outpatient",
    risk: "medium",
    status: "review",
    time: "09:15 AM",
    totalSar: "1,120.00",
  },
  {
    id: "CLM-2023-A03",
    patientMasked: "***-1102",
    patientName: "Khalid Nasser",
    serviceType: "Emergency",
    risk: "low",
    status: "validated",
    time: "08:30 AM",
    totalSar: "2,300.00",
  },
  {
    id: "CLM-2023-A04",
    patientMasked: "***-7734",
    patientName: "Sara Al-Otaibi",
    serviceType: "Pharmacy",
    risk: "medium",
    status: "review",
    time: "Yesterday",
    totalSar: "310.00",
  },
  {
    id: "CLM-2023-A05",
    patientMasked: "***-9001",
    patientName: "Faisal Al-Dosari",
    serviceType: "Dental",
    risk: "low",
    status: "validated",
    time: "Yesterday",
    totalSar: "780.00",
  },
  {
    id: "CLM-2023-891A",
    patientMasked: "***-4756",
    patientName: "Ahmed Al-Sayed",
    serviceType: "Outpatient",
    risk: "high",
    status: "flagged",
    time: "Just now",
    totalSar: "450.00",
  },
];

export const riskLabel: Record<RiskLevel, string> = {
  high: "High Risk",
  medium: "Medium Risk",
  low: "Low Risk",
};

export const metrics = [
  {
    label: "Claims Requiring Attention",
    value: "24",
    icon: "warning",
    accent: "bg-warning-amber",
    iconColor: "text-warning-amber",
  },
  {
    label: "High-Risk Claims",
    value: "8",
    icon: "gpp_bad",
    accent: "bg-critical-amethyst",
    iconColor: "text-critical-amethyst",
  },
  {
    label: "Immediate Prevention Value",
    value: "SAR 142,500",
    icon: "savings",
    accent: "bg-success-emerald",
    iconColor: "text-success-emerald",
    mono: true,
  },
  {
    label: "Pending Responses",
    value: "15",
    icon: "pending_actions",
    accent: "bg-secondary",
    iconColor: "text-secondary",
  },
];

export const rejectionReasons = [
  { label: "Missing supporting documents, such as medical reports or test results", pct: 18, bar: "bg-critical-amethyst" },
  { label: "Incorrect, invalid, or outdated medical coding", pct: 15, bar: "bg-critical-amethyst" },
  { label: "Mismatch between claim and medical record information", pct: 12, bar: "bg-warning-amber" },
  { label: "Insufficient Medical Necessity", pct: 11, bar: "bg-warning-amber" },
  { label: "Duplicate claim or duplicate service submission", pct: 10, bar: "bg-primary" },
  { label: "Missing mandatory information or required fields", pct: 9, bar: "bg-primary" },
  { label: "Incorrect patient or insurance policy information", pct: 8, bar: "bg-secondary" },
  { label: "Missing required Prior Authorization", pct: 6, bar: "bg-secondary" },
  { label: "Expired Prior Authorization", pct: 4, bar: "bg-tertiary" },
  { label: "Service is not covered under the insurance policy", pct: 3, bar: "bg-tertiary" },
  { label: "Exceeding the allowed coverage limit", pct: 2, bar: "bg-surface-variant" },
  { label: "Exceeding the allowed frequency of visits or services", pct: 1, bar: "bg-surface-variant" },
  { label: "ICD-10 diagnosis code does not support the requested CPT procedure", pct: 0.5, bar: "bg-surface-variant" },
  { label: "Patient is not eligible at the time of service", pct: 0.3, bar: "bg-surface-variant" },
  { label: "Provider is not in the approved insurance network", pct: 0.2, bar: "bg-surface-variant" },
];

// ---------------------------------------------------------------- Workspace

export interface WorkspaceClaim {
  id: string;
  patient: { name: string; iqama: string; dob: string; policy: string };
  diagnoses: {
    code: string;
    label: string;
    primary?: boolean;
    flagged?: boolean;
  }[];
  services: {
    code: string;
    description: string;
    qty: number;
    unit: string;
    net: string;
    flagged?: boolean;
  }[];
  documents: { name: string; meta: string; kind: "pdf" | "image" }[];
  total: string;
}

export interface ValidationIssue {
  id: string;
  severity: "blocking" | "review";
  category: string;
  title: string;
  evidence: string;
  why?: string;
  fix?: string;
}

/** Per-claim workspace detail. Every claim in `claims` MUST have an entry here — the
 *  claim workspace page looks this up by id instead of showing a single fixed record. */
const workspaceClaims: Record<string, WorkspaceClaim> = {
  "CLM-2023-A01": {
    id: "CLM-2023-A01",
    patient: { name: "Ahmed Al-Sayed", iqama: "1029384756", dob: "12-May-1980 (46y)", policy: "POL-992-811" },
    diagnoses: [
      { code: "I21.9", label: "Acute myocardial infarction, unspecified", primary: true },
      { code: "I10", label: "Essential hypertension", flagged: true },
    ],
    services: [
      { code: "99222", description: "Initial hospital care, per day", qty: 1, unit: "450.00", net: "450.00" },
    ],
    documents: [{ name: "Admission_Note.pdf", meta: "120 KB • Today", kind: "pdf" }],
    total: "SAR 450.00",
  },
  "CLM-2023-A02": {
    id: "CLM-2023-A02",
    patient: { name: "Mona Al-Harbi", iqama: "2044118902", dob: "03-Feb-1992 (34y)", policy: "POL-441-220" },
    diagnoses: [{ code: "J01.90", label: "Acute sinusitis, unspecified", primary: true }],
    services: [
      { code: "99214", description: "Office/outpatient visit est", qty: 1, unit: "250.00", net: "250.00" },
      { code: "85025", description: "Complete CBC w/auto diff WBC", qty: 1, unit: "120.00", net: "120.00", flagged: true },
    ],
    documents: [{ name: "Lab_Results.pdf", meta: "180 KB • Today", kind: "pdf" }],
    total: "SAR 1,120.00",
  },
  "CLM-2023-A03": {
    id: "CLM-2023-A03",
    patient: { name: "Khalid Nasser", iqama: "1077120345", dob: "22-Sep-1975 (50y)", policy: "POL-118-903" },
    diagnoses: [{ code: "S06.0X0A", label: "Concussion without loss of consciousness", primary: true }],
    services: [
      { code: "99284", description: "Emergency department visit, high complexity", qty: 1, unit: "900.00", net: "900.00" },
      { code: "70450", description: "CT head/brain without contrast", qty: 1, unit: "1400.00", net: "1400.00" },
    ],
    documents: [
      { name: "CT_Head_Report.pdf", meta: "1.1 MB • Yesterday", kind: "pdf" },
      { name: "ER_Physician_Note.pdf", meta: "72 KB • Yesterday", kind: "pdf" },
    ],
    total: "SAR 2,300.00",
  },
  "CLM-2023-A04": {
    id: "CLM-2023-A04",
    patient: { name: "Sara Al-Otaibi", iqama: "1098221340", dob: "17-Nov-1988 (37y)", policy: "POL-773-401" },
    diagnoses: [{ code: "E11.9", label: "Type 2 diabetes mellitus w/o comp.", primary: true, flagged: true }],
    services: [
      { code: "83036", description: "Hemoglobin A1C", qty: 1, unit: "90.00", net: "90.00" },
    ],
    documents: [{ name: "Pharmacy_Dispense.pdf", meta: "32 KB • Yesterday", kind: "pdf" }],
    total: "SAR 310.00",
  },
  "CLM-2023-A05": {
    id: "CLM-2023-A05",
    patient: { name: "Faisal Al-Dosari", iqama: "1055440021", dob: "05-Jan-1990 (36y)", policy: "POL-660-118" },
    diagnoses: [{ code: "K02.9", label: "Dental caries, unspecified", primary: true }],
    services: [
      { code: "D2140", description: "Amalgam restoration, one surface", qty: 2, unit: "390.00", net: "780.00" },
    ],
    documents: [{ name: "Dental_Xray.jpg", meta: "800 KB • Yesterday", kind: "image" }],
    total: "SAR 780.00",
  },
  "CLM-2023-891A": {
    id: "CLM-2023-891A",
    patient: { name: "Ahmed Al-Sayed", iqama: "1029384756", dob: "12-May-1980 (46y)", policy: "POL-992-811" },
    diagnoses: [
      { code: "J01.90", label: "Acute sinusitis, unspecified", primary: true },
      { code: "R50.9", label: "Fever, unspecified" },
      { code: "E11.9", label: "Type 2 diabetes mellitus w/o comp.", flagged: true },
    ],
    services: [
      { code: "99214", description: "Office/outpatient visit est", qty: 1, unit: "250.00", net: "250.00" },
      { code: "85025", description: "Complete CBC w/auto diff WBC", qty: 1, unit: "120.00", net: "120.00", flagged: true },
      { code: "81002", description: "Urinalysis nonauto w/o scope", qty: 1, unit: "80.00", net: "80.00" },
    ],
    documents: [
      { name: "Lab_Results_05.pdf", meta: "245 KB • 12 May", kind: "pdf" },
      { name: "Referral_Form.jpg", meta: "1.2 MB • 11 May", kind: "image" },
    ],
    total: "SAR 450.00",
  },
};

const validationIssuesByClaim: Record<string, ValidationIssue[]> = {
  "CLM-2023-A01": [
    {
      id: "A01-1",
      severity: "blocking",
      category: "Missing Prior Authorization",
      title: "High-cost inpatient admission missing an approval reference.",
      evidence: "No prior authorization is linked to this encounter.",
      why: "Payers reject inpatient admissions submitted without a linked approval.",
      fix: "Create an approval request for this encounter before submitting.",
    },
  ],
  "CLM-2023-A02": [
    {
      id: "A02-1",
      severity: "review",
      category: "Documentation",
      title: "Lab result attached but not cross-referenced in the clinical note.",
      evidence: "CBC (85025) is billed; the note does not explicitly justify the test.",
    },
  ],
  "CLM-2023-A03": [],
  "CLM-2023-A04": [
    {
      id: "A04-1",
      severity: "review",
      category: "Coding Conflict",
      title: "Unspecified diagnosis code used.",
      evidence:
        "E11.9 (Type 2 diabetes) is unspecified. Nphies historically prefers specific codes when available.",
    },
  ],
  "CLM-2023-A05": [],
  "CLM-2023-891A": [
    {
      id: "891A-1",
      severity: "blocking",
      category: "Missing Medical Necessity",
      title: "Missing clinical justification for Complete CBC.",
      evidence:
        "CPT 85025 is linked to diagnosis J01.90, but supporting medical necessity documentation is missing.",
      why: "This may increase rejection risk during Nphies validation.",
      fix: "Attach supporting documentation or update the diagnosis relationship.",
    },
    {
      id: "891A-2",
      severity: "review",
      category: "Coding Conflict",
      title: "Unspecified diagnosis code used.",
      evidence:
        "E11.9 (Type 2 diabetes) is unspecified. Nphies historically rejects generic codes when specifics are available in history.",
    },
  ],
};

export function getWorkspaceClaim(claimId: string): WorkspaceClaim | undefined {
  return workspaceClaims[claimId];
}

export function getValidationIssues(claimId: string): ValidationIssue[] {
  return validationIssuesByClaim[claimId] ?? [];
}

// -------------------------------------------------------------- Submissions

export type SubmissionStatus = "rejected" | "accepted" | "pending";

export interface Submission {
  id: string;
  ref: string;
  patient: string;
  mrn: string;
  provider: string;
  specialty: string;
  amount: string;
  status: SubmissionStatus;
  submittedAt: string;
  payerReason?: string;
  diagnosis: string;
  encounterType: string;
  lines: {
    code: string;
    description: string;
    qty: number;
    amount: string;
    denied: boolean;
  }[];
}

export const submissions: Submission[] = [
  {
    id: "CLM-2024-89302-A",
    ref: "NPH-992011",
    patient: "Ahmed Al-Farsi",
    mrn: "8829100",
    provider: "Dr. Sarah Jenkins",
    specialty: "Cardiology",
    amount: "SAR 4,250.00",
    status: "rejected",
    submittedAt: "20-May-2024 14:32 AST",
    payerReason:
      "Duplicate Claim Found. A claim with the same services was already processed for this patient on 20-May-2024.",
    diagnosis: "I21.9 - Acute myocardial infarction, unspecified",
    encounterType: "Inpatient",
    lines: [
      {
        code: "99222",
        description:
          "Initial hospital care, per day, for the evaluation and management of a patient",
        qty: 1,
        amount: "SAR 450.00",
        denied: true,
      },
      {
        code: "93000",
        description: "Electrocardiogram, routine ECG with at least 12 leads",
        qty: 1,
        amount: "SAR 150.00",
        denied: true,
      },
      {
        code: "33208",
        description:
          "Insertion of new or replacement of permanent pacemaker with transvenous electrode(s)",
        qty: 1,
        amount: "SAR 3,650.00",
        denied: true,
      },
    ],
  },
  {
    id: "CLM-2024-89115-C",
    ref: "NPH-991884",
    patient: "Mona Al-Harbi",
    mrn: "8817442",
    provider: "Dr. Omar Bakr",
    specialty: "Internal Medicine",
    amount: "SAR 1,120.00",
    status: "accepted",
    submittedAt: "19-May-2024 11:05 AST",
    diagnosis: "J01.90 - Acute sinusitis, unspecified",
    encounterType: "Outpatient",
    lines: [
      {
        code: "99214",
        description: "Office/outpatient visit est",
        qty: 1,
        amount: "SAR 250.00",
        denied: false,
      },
      {
        code: "85025",
        description: "Complete CBC w/auto diff WBC",
        qty: 1,
        amount: "SAR 120.00",
        denied: false,
      },
    ],
  },
  {
    id: "CLM-2024-88990-B",
    ref: "NPH-991702",
    patient: "Khalid Nasser",
    mrn: "8790155",
    provider: "Dr. Lina Haddad",
    specialty: "Emergency",
    amount: "SAR 2,300.00",
    status: "pending",
    submittedAt: "19-May-2024 08:41 AST",
    diagnosis: "S06.0X0A - Concussion without loss of consciousness",
    encounterType: "Emergency",
    lines: [
      {
        code: "99284",
        description: "Emergency department visit, high complexity",
        qty: 1,
        amount: "SAR 900.00",
        denied: false,
      },
      {
        code: "70450",
        description: "CT head/brain without contrast",
        qty: 1,
        amount: "SAR 1,400.00",
        denied: false,
      },
    ],
  },
];

export function findSubmission(id: string) {
  return submissions.find((s) => s.id === id);
}

export function findClaim(id: string) {
  return claims.find((c) => c.id === id);
}

// ---------------------------------------------------------------------------
// Bridge: submissions and the claim workspace used to use two disconnected ID
// schemes (CLM-2024-... vs CLM-2023-...), so "Correct & Resubmit" always hit a
// 404. Every submission now gets a matching claim + workspace record derived
// straight from its own data, so re-opening a submission in the workspace
// always resolves to the real claim it belongs to.
// ---------------------------------------------------------------------------
for (const s of submissions) {
  if (!findClaim(s.id)) {
    claims.push({
      id: s.id,
      patientMasked: `***-${s.mrn.slice(-4)}`,
      patientName: s.patient,
      serviceType: s.encounterType,
      risk: s.status === "rejected" ? "high" : s.status === "pending" ? "medium" : "low",
      status: s.status === "rejected" ? "flagged" : s.status === "pending" ? "review" : "validated",
      time: s.submittedAt,
      totalSar: s.amount.replace("SAR ", ""),
    });
  }

  if (!getWorkspaceClaim(s.id)) {
    const [diagCode, ...diagLabelParts] = s.diagnosis.split(" - ");
    workspaceClaims[s.id] = {
      id: s.id,
      patient: { name: s.patient, iqama: s.mrn, dob: "—", policy: s.ref },
      diagnoses: [{ code: diagCode, label: diagLabelParts.join(" - ") || s.diagnosis, primary: true }],
      services: s.lines.map((l) => ({
        code: l.code,
        description: l.description,
        qty: l.qty,
        unit: l.amount.replace("SAR ", ""),
        net: l.amount.replace("SAR ", ""),
        flagged: l.denied,
      })),
      documents: [{ name: `${s.ref}_submission_package.pdf`, meta: `Imported from ${s.id}`, kind: "pdf" }],
      total: s.amount,
    };
  }

  if (s.status === "rejected" && !validationIssuesByClaim[s.id]) {
    validationIssuesByClaim[s.id] = s.lines
      .filter((l) => l.denied)
      .map((l, i) => ({
        id: `${s.id}-${i}`,
        severity: "blocking" as const,
        category: "Payer Denial",
        title: `Payer denied ${l.code} — ${l.description}.`,
        evidence: s.payerReason ?? "The payer rejected this line item.",
        fix: "Correct the flagged line item and resubmit with supporting documentation.",
      }));
  }
}
