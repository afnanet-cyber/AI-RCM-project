// ---------------------------------------------------------------------------
// Hospital Information System (HIS) integration layer.
//
// This module simulates the automatic feed coming FROM the hospital system
// INTO the platform. Employees never type this data in — every screen reads
// from here. Swapping this file for a real HL7/FHIR adapter is the only change
// needed to go live.
// ---------------------------------------------------------------------------

export type DocumentType =
  | "lab"
  | "radiology"
  | "ecg"
  | "medical_report"
  | "medical_justification"
  | "invoice"
  | "procedure"
  | "medication"
  | "discharge_summary"
  | "admission_note"
  | "other";

export const documentTypeLabel: Record<DocumentType, string> = {
  lab: "Laboratory Results",
  radiology: "Radiology Reports",
  ecg: "ECG",
  medical_report: "Medical Report",
  medical_justification: "Medical Justification",
  invoice: "Invoice",
  procedure: "Procedure / Surgery",
  medication: "Medications",
  discharge_summary: "Discharge Summary",
  admission_note: "Admission Information",
  other: "Other Supporting Documents",
};

export const documentTypeIcon: Record<DocumentType, string> = {
  lab: "science",
  radiology: "radiology",
  ecg: "monitor_heart",
  medical_report: "description",
  medical_justification: "gavel",
  invoice: "receipt_long",
  procedure: "surgical",
  medication: "pill",
  discharge_summary: "logout",
  admission_note: "login",
  other: "attach_file",
};

export interface Patient {
  patientId: string;
  name: string;
  nationalId: string;
  dateOfBirth: string;
  gender: string;
  insuranceCompany: string;
  insurancePolicyNumber: string;
  policyValidUntil: string;
  eligibility: "active" | "inactive";
  mrn: string;
}

export interface HisService {
  code: string;
  description: string;
  qty: number;
  unitPrice: number;
  date: string;
}

export interface HisDocument {
  documentId: string;
  patientId: string;
  visitId: string;
  documentType: DocumentType;
  title: string;
  summary: string;
  serviceDate: string;
  source: string;
  sizeKb: number;
  relevanceTags: string[];
}

export interface Visit {
  visitId: string;
  patientId: string;
  visitType: "outpatient" | "inpatient" | "emergency";
  visitDate: string;
  visitTime: string;
  department: string;
  physician: string;
  diagnosisCode: string;
  diagnosisLabel: string;
  services: HisService[];
  notes: string;
  admissionDate?: string;
  dischargeDate?: string;
  inpatientDays?: number;
}

export const patients: Patient[] = [
  {
    patientId: "PT-100294",
    name: "Ahmed Al-Sayed",
    nationalId: "1029384756",
    dateOfBirth: "12-May-1980",
    gender: "Male",
    insuranceCompany: "Bupa Arabia",
    insurancePolicyNumber: "POL-992-811",
    policyValidUntil: "31-Dec-2026",
    eligibility: "active",
    mrn: "8829100",
  },
  {
    patientId: "PT-100311",
    name: "Mona Al-Harbi",
    nationalId: "2044118902",
    dateOfBirth: "03-Feb-1992",
    gender: "Female",
    insuranceCompany: "Tawuniya",
    insurancePolicyNumber: "POL-441-220",
    policyValidUntil: "30-Jun-2026",
    eligibility: "active",
    mrn: "8817442",
  },
  {
    patientId: "PT-100402",
    name: "Khalid Nasser",
    nationalId: "1077120345",
    dateOfBirth: "22-Sep-1975",
    gender: "Male",
    insuranceCompany: "MedGulf",
    insurancePolicyNumber: "POL-118-903",
    policyValidUntil: "12-Aug-2026",
    eligibility: "active",
    mrn: "8790155",
  },
  {
    patientId: "PT-100507",
    name: "Sara Al-Otaibi",
    nationalId: "1098221340",
    dateOfBirth: "17-Nov-1988",
    gender: "Female",
    insuranceCompany: "Bupa Arabia",
    insurancePolicyNumber: "POL-773-401",
    policyValidUntil: "05-Mar-2026",
    eligibility: "inactive",
    mrn: "8845012",
  },
];

export const visits: Visit[] = [
  {
    visitId: "VIS-55001",
    patientId: "PT-100294",
    visitType: "outpatient",
    visitDate: "2026-08-18",
    visitTime: "09:30",
    department: "ENT Clinic",
    physician: "Dr. Omar Bakr",
    diagnosisCode: "J01.90",
    diagnosisLabel: "Acute sinusitis, unspecified",
    notes: "Persistent facial pain and fever for 10 days, failed first-line therapy.",
    services: [
      { code: "99214", description: "Office/outpatient visit, established patient", qty: 1, unitPrice: 250, date: "2026-08-18" },
      { code: "85025", description: "Complete CBC w/auto diff WBC", qty: 1, unitPrice: 120, date: "2026-08-18" },
      { code: "70486", description: "CT maxillofacial without contrast", qty: 1, unitPrice: 780, date: "2026-08-18" },
    ],
  },
  {
    visitId: "VIS-55014",
    patientId: "PT-100294",
    visitType: "outpatient",
    visitDate: "2026-08-25",
    visitTime: "11:00",
    department: "ENT Clinic",
    physician: "Dr. Omar Bakr",
    diagnosisCode: "J01.90",
    diagnosisLabel: "Acute sinusitis, unspecified — follow-up",
    notes: "Follow-up after antibiotic course. Partial improvement.",
    services: [
      { code: "99213", description: "Office/outpatient follow-up visit", qty: 1, unitPrice: 180, date: "2026-08-25" },
    ],
  },
  {
    visitId: "VIS-55102",
    patientId: "PT-100311",
    visitType: "inpatient",
    visitDate: "2026-08-19",
    visitTime: "07:15",
    department: "Cardiology Ward",
    physician: "Dr. Sarah Jenkins",
    diagnosisCode: "I21.9",
    diagnosisLabel: "Acute myocardial infarction, unspecified",
    notes: "Admitted through ER with chest pain, troponin elevated.",
    admissionDate: "2026-08-19",
    dischargeDate: "2026-08-24",
    inpatientDays: 5,
    services: [
      { code: "99222", description: "Initial hospital care, per day", qty: 1, unitPrice: 450, date: "2026-08-19" },
      { code: "93000", description: "Electrocardiogram, routine 12-lead", qty: 3, unitPrice: 150, date: "2026-08-19" },
      { code: "33208", description: "Insertion of permanent pacemaker, transvenous", qty: 1, unitPrice: 3650, date: "2026-08-20" },
      { code: "99231", description: "Subsequent hospital care, per day", qty: 4, unitPrice: 320, date: "2026-08-21" },
    ],
  },
  {
    visitId: "VIS-55210",
    patientId: "PT-100402",
    visitType: "emergency",
    visitDate: "2026-08-20",
    visitTime: "22:40",
    department: "Emergency Department",
    physician: "Dr. Lina Haddad",
    diagnosisCode: "S06.0X0A",
    diagnosisLabel: "Concussion without loss of consciousness",
    notes: "Head trauma after fall. CT ordered to rule out bleed.",
    services: [
      { code: "99284", description: "Emergency department visit, high complexity", qty: 1, unitPrice: 900, date: "2026-08-20" },
      { code: "70450", description: "CT head/brain without contrast", qty: 1, unitPrice: 1400, date: "2026-08-20" },
    ],
  },
  {
    visitId: "VIS-55301",
    patientId: "PT-100507",
    visitType: "outpatient",
    visitDate: "2026-08-21",
    visitTime: "14:20",
    department: "Endocrinology Clinic",
    physician: "Dr. Hala Zahran",
    diagnosisCode: "E11.9",
    diagnosisLabel: "Type 2 diabetes mellitus without complications",
    notes: "Routine review, poor glycaemic control reported.",
    services: [
      { code: "99214", description: "Office/outpatient visit, established patient", qty: 1, unitPrice: 250, date: "2026-08-21" },
      { code: "83036", description: "Hemoglobin A1C", qty: 1, unitPrice: 90, date: "2026-08-21" },
    ],
  },
];

export const hisDocuments: HisDocument[] = [
  // Ahmed Al-Sayed — outpatient sinusitis pathway
  { documentId: "DOC-9001", patientId: "PT-100294", visitId: "VIS-55001", documentType: "lab", title: "CBC with differential", summary: "WBC 13.4 ×10⁹/L (high), neutrophils 78%.", serviceDate: "2026-08-18", source: "HIS · Lab Module", sizeKb: 245, relevanceTags: ["85025", "J01.90"] },
  { documentId: "DOC-9002", patientId: "PT-100294", visitId: "VIS-55001", documentType: "radiology", title: "CT Maxillofacial without contrast", summary: "Mucosal thickening of the maxillary sinuses, air-fluid level on the right.", serviceDate: "2026-08-18", source: "HIS · PACS", sizeKb: 1840, relevanceTags: ["70486", "J01.90"] },
  { documentId: "DOC-9003", patientId: "PT-100294", visitId: "VIS-55001", documentType: "medical_report", title: "ENT consultation note", summary: "10-day history of purulent discharge, failed amoxicillin course.", serviceDate: "2026-08-18", source: "HIS · EMR", sizeKb: 96, relevanceTags: ["99214", "J01.90"] },
  { documentId: "DOC-9004", patientId: "PT-100294", visitId: "VIS-55001", documentType: "medical_justification", title: "Medical necessity — CT sinuses", summary: "Imaging required after failure of medical therapy to exclude complications.", serviceDate: "2026-08-18", source: "HIS · EMR", sizeKb: 48, relevanceTags: ["70486"] },
  { documentId: "DOC-9005", patientId: "PT-100294", visitId: "VIS-55001", documentType: "medication", title: "Pharmacy dispense record", summary: "Amoxicillin-clavulanate 1g BID ×10 days.", serviceDate: "2026-08-18", source: "HIS · Pharmacy", sizeKb: 32, relevanceTags: ["J01.90"] },
  { documentId: "DOC-9006", patientId: "PT-100294", visitId: "VIS-55001", documentType: "invoice", title: "Outpatient invoice INV-33121", summary: "Total SAR 1,150.00 for visit, CBC and CT.", serviceDate: "2026-08-18", source: "HIS · Billing", sizeKb: 74, relevanceTags: ["invoice"] },
  { documentId: "DOC-9007", patientId: "PT-100294", visitId: "VIS-55014", documentType: "medical_report", title: "Follow-up note", summary: "Symptoms improving, continue conservative management.", serviceDate: "2026-08-25", source: "HIS · EMR", sizeKb: 41, relevanceTags: ["99213"] },
  { documentId: "DOC-9008", patientId: "PT-100294", visitId: "VIS-55014", documentType: "invoice", title: "Outpatient invoice INV-33480", summary: "Total SAR 180.00 for follow-up visit.", serviceDate: "2026-08-25", source: "HIS · Billing", sizeKb: 66, relevanceTags: ["invoice"] },

  // Mona Al-Harbi — inpatient cardiology admission
  { documentId: "DOC-9101", patientId: "PT-100311", visitId: "VIS-55102", documentType: "admission_note", title: "Admission assessment", summary: "Chest pain onset 03:00, ST elevation in inferior leads.", serviceDate: "2026-08-19", source: "HIS · EMR", sizeKb: 120, relevanceTags: ["I21.9", "99222"] },
  { documentId: "DOC-9102", patientId: "PT-100311", visitId: "VIS-55102", documentType: "ecg", title: "12-lead ECG (admission)", summary: "Inferior ST elevation, Q waves in II/III/aVF.", serviceDate: "2026-08-19", source: "HIS · Cardiology", sizeKb: 310, relevanceTags: ["93000", "I21.9"] },
  { documentId: "DOC-9103", patientId: "PT-100311", visitId: "VIS-55102", documentType: "lab", title: "Cardiac enzymes panel", summary: "Troponin I 8.9 ng/mL (high), CK-MB elevated.", serviceDate: "2026-08-19", source: "HIS · Lab Module", sizeKb: 180, relevanceTags: ["I21.9"] },
  { documentId: "DOC-9104", patientId: "PT-100311", visitId: "VIS-55102", documentType: "procedure", title: "Permanent pacemaker insertion report", summary: "Dual-chamber pacemaker implanted, no complications.", serviceDate: "2026-08-20", source: "HIS · OR System", sizeKb: 420, relevanceTags: ["33208"] },
  { documentId: "DOC-9105", patientId: "PT-100311", visitId: "VIS-55102", documentType: "radiology", title: "Chest X-ray post-procedure", summary: "Lead position satisfactory, no pneumothorax.", serviceDate: "2026-08-20", source: "HIS · PACS", sizeKb: 900, relevanceTags: ["33208"] },
  { documentId: "DOC-9106", patientId: "PT-100311", visitId: "VIS-55102", documentType: "medication", title: "Inpatient medication administration record", summary: "Aspirin, clopidogrel, atorvastatin, enoxaparin.", serviceDate: "2026-08-21", source: "HIS · Pharmacy", sizeKb: 88, relevanceTags: ["I21.9"] },
  { documentId: "DOC-9107", patientId: "PT-100311", visitId: "VIS-55102", documentType: "medical_justification", title: "Medical necessity — pacemaker", summary: "Symptomatic complete heart block post-infarction.", serviceDate: "2026-08-20", source: "HIS · EMR", sizeKb: 54, relevanceTags: ["33208"] },
  { documentId: "DOC-9108", patientId: "PT-100311", visitId: "VIS-55102", documentType: "discharge_summary", title: "Discharge summary", summary: "5 inpatient days, discharged stable with cardiology follow-up.", serviceDate: "2026-08-24", source: "HIS · EMR", sizeKb: 150, relevanceTags: ["I21.9"] },
  { documentId: "DOC-9109", patientId: "PT-100311", visitId: "VIS-55102", documentType: "invoice", title: "Final inpatient invoice INV-33290", summary: "Total SAR 6,050.00 including room, procedure and pharmacy.", serviceDate: "2026-08-24", source: "HIS · Billing", sizeKb: 210, relevanceTags: ["invoice"] },

  // Khalid Nasser — emergency
  { documentId: "DOC-9201", patientId: "PT-100402", visitId: "VIS-55210", documentType: "radiology", title: "CT head without contrast", summary: "No acute intracranial haemorrhage or fracture.", serviceDate: "2026-08-20", source: "HIS · PACS", sizeKb: 1120, relevanceTags: ["70450", "S06.0X0A"] },
  { documentId: "DOC-9202", patientId: "PT-100402", visitId: "VIS-55210", documentType: "medical_report", title: "ER physician note", summary: "GCS 15, observation for 4 hours, discharged with head-injury advice.", serviceDate: "2026-08-20", source: "HIS · EMR", sizeKb: 72, relevanceTags: ["99284"] },
  { documentId: "DOC-9203", patientId: "PT-100402", visitId: "VIS-55210", documentType: "invoice", title: "Emergency invoice INV-33344", summary: "Total SAR 2,300.00.", serviceDate: "2026-08-20", source: "HIS · Billing", sizeKb: 61, relevanceTags: ["invoice"] },

  // Sara Al-Otaibi — outpatient endocrinology
  { documentId: "DOC-9301", patientId: "PT-100507", visitId: "VIS-55301", documentType: "lab", title: "HbA1c result", summary: "HbA1c 9.4% — poor control.", serviceDate: "2026-08-21", source: "HIS · Lab Module", sizeKb: 40, relevanceTags: ["83036", "E11.9"] },
  { documentId: "DOC-9302", patientId: "PT-100507", visitId: "VIS-55301", documentType: "medical_report", title: "Endocrinology clinic note", summary: "Treatment intensification discussed.", serviceDate: "2026-08-21", source: "HIS · EMR", sizeKb: 58, relevanceTags: ["99214"] },
  { documentId: "DOC-9303", patientId: "PT-100507", visitId: "VIS-55301", documentType: "invoice", title: "Outpatient invoice INV-33401", summary: "Total SAR 340.00.", serviceDate: "2026-08-21", source: "HIS · Billing", sizeKb: 55, relevanceTags: ["invoice"] },
];

export function getPatient(patientId: string) {
  return patients.find((p) => p.patientId === patientId);
}

export function getVisit(visitId: string) {
  return visits.find((v) => v.visitId === visitId);
}

export function getVisitsForPatient(patientId: string) {
  return visits.filter((v) => v.patientId === patientId);
}

export function getDocumentsForVisit(visitId: string) {
  return hisDocuments.filter((d) => d.visitId === visitId);
}

/** Documents automatically pulled from the HIS for a claim period. */
export function getDocumentsForPeriod(patientId: string, startDate: string, endDate: string) {
  return hisDocuments.filter(
    (d) => d.patientId === patientId && d.serviceDate >= startDate && d.serviceDate <= endDate,
  );
}

export function getVisitsForPeriod(patientId: string, startDate: string, endDate: string) {
  return visits.filter(
    (v) => v.patientId === patientId && v.visitDate >= startDate && v.visitDate <= endDate,
  );
}

export function serviceTotal(services: HisService[]) {
  return services.reduce((sum, s) => sum + s.qty * s.unitPrice, 0);
}

export function formatSar(amount: number) {
  return `SAR ${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
