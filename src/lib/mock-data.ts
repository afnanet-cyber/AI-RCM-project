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
  { label: "Missing Diagnosis Code", pct: 34, bar: "bg-critical-amethyst" },
  { label: "Duplicate Claim", pct: 28, bar: "bg-warning-amber" },
  { label: "Invalid Member ID", pct: 15, bar: "bg-primary" },
  { label: "Service Not Covered", pct: 12, bar: "bg-secondary" },
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

export const workspaceClaim: WorkspaceClaim = {
  id: "CLM-2023-891A",
  patient: {
    name: "Ahmed Al-Sayed",
    iqama: "1029384756",
    dob: "12-May-1980 (43y)",
    policy: "POL-992-811",
  },
  diagnoses: [
    { code: "J01.90", label: "Acute sinusitis, unspecified", primary: true },
    { code: "R50.9", label: "Fever, unspecified" },
    { code: "E11.9", label: "Type 2 diabetes mellitus w/o comp.", flagged: true },
  ],
  services: [
    {
      code: "99214",
      description: "Office/outpatient visit est",
      qty: 1,
      unit: "250.00",
      net: "250.00",
    },
    {
      code: "85025",
      description: "Complete CBC w/auto diff WBC",
      qty: 1,
      unit: "120.00",
      net: "120.00",
      flagged: true,
    },
    {
      code: "81002",
      description: "Urinalysis nonauto w/o scope",
      qty: 1,
      unit: "80.00",
      net: "80.00",
    },
  ],
  documents: [
    { name: "Lab_Results_05.pdf", meta: "245 KB • 12 May", kind: "pdf" },
    { name: "Referral_Form.jpg", meta: "1.2 MB • 11 May", kind: "image" },
  ],
  total: "SAR 450.00",
};

export const validationIssues = [
  {
    severity: "blocking" as const,
    category: "Missing Medical Necessity",
    title: "Missing clinical justification for Complete CBC.",
    evidence:
      "CPT 85025 is linked to diagnosis J01.90, but supporting medical necessity documentation is missing.",
    why: "This may increase rejection risk during Nphies validation.",
    fix: "Attach supporting documentation or update the diagnosis relationship.",
  },
  {
    severity: "review" as const,
    category: "Coding Conflict",
    title: "Unspecified diagnosis code used.",
    evidence:
      "E11.9 (Type 2 diabetes) is unspecified. Nphies historically rejects generic codes when specifics are available in history.",
  },
];

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
