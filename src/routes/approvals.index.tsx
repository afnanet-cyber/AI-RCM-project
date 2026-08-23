import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";

import { AppShell } from "@/components/insuraguard/AppShell";
import { Icon } from "@/components/insuraguard/Icon";
import { formatSar, getPatient, getVisit } from "@/lib/his-data";
import {
  approvalStatusLabel,
  statusChip,
  useApprovals,
  type ApprovalStatus,
} from "@/lib/rcm-store";

export const Route = createFileRoute("/approvals/")({
  head: () => ({
    meta: [
      { title: "Approvals — Outpatient & Inpatient | InsuraGuard AI" },
      {
        name: "description",
        content:
          "Track outpatient and inpatient pre-approvals built automatically from hospital system data, with list and calendar views.",
      },
      { property: "og:title", content: "Approvals | InsuraGuard AI" },
      {
        property: "og:description",
        content: "Outpatient and inpatient pre-approvals generated automatically from the hospital system.",
      },
    ],
  }),
  component: ApprovalsPage,
});

const statuses: ApprovalStatus[] = [
  "draft",
  "under_review",
  "submitted",
  "pending_payer",
  "additional_info",
  "approved",
  "rejected",
];

function ApprovalsPage() {
  const approvals = useApprovals();
  const [view, setView] = useState<"list" | "calendar">("list");
  const [type, setType] = useState<"all" | "outpatient" | "inpatient">("all");
  const [status, setStatus] = useState<"all" | ApprovalStatus>("all");
  const [payer, setPayer] = useState("all");
  const [query, setQuery] = useState("");

  const payers = useMemo(
    () =>
      Array.from(
        new Set(approvals.map((a) => getPatient(a.patientId)?.insuranceCompany ?? "—")),
      ),
    [approvals],
  );

  const filtered = approvals.filter((a) => {
    const patient = getPatient(a.patientId);
    if (type !== "all" && a.type !== type) return false;
    if (status !== "all" && a.status !== status) return false;
    if (payer !== "all" && patient?.insuranceCompany !== payer) return false;
    if (query) {
      const q = query.toLowerCase();
      const haystack = `${a.approvalId} ${patient?.name ?? ""} ${patient?.mrn ?? ""}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  return (
    <AppShell title="Approvals" contentClassName="p-md lg:p-lg">
      <div className="flex flex-col gap-lg">
        <div className="flex flex-wrap items-end justify-between gap-md">
          <div>
            <h1 className="font-headline-md text-headline-md text-on-surface">Approvals</h1>
            <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
              Requests are created automatically from hospital system encounters — no manual data entry.
            </p>
          </div>
          <div className="flex overflow-hidden rounded border border-border-slate bg-white">
            {(["list", "calendar"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={`flex items-center gap-1 px-4 py-2 font-label-caps text-label-caps transition-colors ${
                  view === v ? "bg-primary text-on-primary" : "text-on-surface hover:bg-surface-container-low"
                }`}
              >
                <Icon name={v === "list" ? "list" : "calendar_month"} className="text-[18px]" />
                {v === "list" ? "List" : "Calendar"}
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 gap-sm rounded-xl border border-border-slate bg-white p-md sm:grid-cols-2 xl:grid-cols-4">
          <label className="flex flex-col gap-1 font-label-sm text-label-sm text-on-surface-variant">
            Search
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Approval ID, patient, MRN"
              className="rounded border border-border-slate px-3 py-2 font-body-sm text-body-sm text-on-surface outline-none focus:border-primary"
            />
          </label>
          <label className="flex flex-col gap-1 font-label-sm text-label-sm text-on-surface-variant">
            Type
            <select
              value={type}
              onChange={(e) => setType(e.target.value as typeof type)}
              className="rounded border border-border-slate px-3 py-2 font-body-sm text-body-sm text-on-surface outline-none focus:border-primary"
            >
              <option value="all">All types</option>
              <option value="outpatient">Outpatient</option>
              <option value="inpatient">Inpatient</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 font-label-sm text-label-sm text-on-surface-variant">
            Status
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof status)}
              className="rounded border border-border-slate px-3 py-2 font-body-sm text-body-sm text-on-surface outline-none focus:border-primary"
            >
              <option value="all">All statuses</option>
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {approvalStatusLabel[s]}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 font-label-sm text-label-sm text-on-surface-variant">
            Insurance company
            <select
              value={payer}
              onChange={(e) => setPayer(e.target.value)}
              className="rounded border border-border-slate px-3 py-2 font-body-sm text-body-sm text-on-surface outline-none focus:border-primary"
            >
              <option value="all">All payers</option>
              {payers.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
        </div>

        {view === "list" ? (
          <ApprovalList items={filtered} />
        ) : (
          <ApprovalCalendar items={filtered} />
        )}
      </div>
    </AppShell>
  );
}

type ApprovalRow = ReturnType<typeof useApprovals>[number];

function ApprovalList({ items }: { items: ApprovalRow[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border-slate bg-white p-xl text-center font-body-sm text-body-sm text-on-surface-variant">
        No approvals match the selected filters.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border-slate bg-white">
      <table className="w-full min-w-[860px] text-left">
        <thead className="border-b border-border-slate bg-surface-container-low font-label-caps text-label-caps text-on-surface-variant">
          <tr>
            <th className="px-md py-sm">Approval</th>
            <th className="px-md py-sm">Patient</th>
            <th className="px-md py-sm">Type</th>
            <th className="px-md py-sm">Payer</th>
            <th className="px-md py-sm">Requested</th>
            <th className="px-md py-sm">Status</th>
            <th className="px-md py-sm text-right">Action</th>
          </tr>
        </thead>
        <tbody className="font-body-sm text-body-sm">
          {items.map((a) => {
            const patient = getPatient(a.patientId);
            const visit = getVisit(a.visitId);
            return (
              <tr key={a.approvalId} className="border-b border-border-slate/60 last:border-0 hover:bg-surface-container-low">
                <td className="px-md py-sm">
                  <div className="font-data-mono text-data-mono font-bold text-primary">{a.approvalId}</div>
                  <div className="text-on-surface-variant">{a.createdAt}</div>
                </td>
                <td className="px-md py-sm">
                  <div className="text-on-surface">{patient?.name}</div>
                  <div className="text-on-surface-variant">{visit?.department}</div>
                </td>
                <td className="px-md py-sm capitalize text-on-surface">{a.type}</td>
                <td className="px-md py-sm text-on-surface">{patient?.insuranceCompany}</td>
                <td className="px-md py-sm font-data-mono text-on-surface">{formatSar(a.requestedAmount)}</td>
                <td className="px-md py-sm">
                  <span className={`inline-block rounded border px-2 py-0.5 font-label-caps text-[10px] ${statusChip[a.status]}`}>
                    {approvalStatusLabel[a.status]}
                  </span>
                </td>
                <td className="px-md py-sm text-right">
                  <Link
                    to="/approvals/$approvalId"
                    params={{ approvalId: a.approvalId }}
                    className="inline-flex items-center gap-1 font-label-caps text-label-caps text-primary hover:underline"
                  >
                    Open <Icon name="arrow_forward" className="text-[14px]" />
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ApprovalCalendar({ items }: { items: ApprovalRow[] }) {
  const byDate = new Map<string, ApprovalRow[]>();
  for (const a of items) {
    const list = byDate.get(a.createdAt) ?? [];
    list.push(a);
    byDate.set(a.createdAt, list);
  }
  const dates = [...byDate.keys()].sort();

  if (dates.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border-slate bg-white p-xl text-center font-body-sm text-body-sm text-on-surface-variant">
        No approvals scheduled for the selected filters.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-md md:grid-cols-2 xl:grid-cols-3">
      {dates.map((date) => (
        <div key={date} className="rounded-xl border border-border-slate bg-white p-md">
          <div className="flex items-center gap-sm border-b border-border-slate/60 pb-sm">
            <Icon name="event" className="text-primary" />
            <span className="font-label-caps text-label-caps text-on-surface">{date}</span>
            <span className="ml-auto font-label-sm text-label-sm text-on-surface-variant">
              {byDate.get(date)!.length} request(s)
            </span>
          </div>
          <ul className="mt-sm space-y-sm">
            {byDate.get(date)!.map((a) => (
              <li key={a.approvalId}>
                <Link
                  to="/approvals/$approvalId"
                  params={{ approvalId: a.approvalId }}
                  className="block rounded-lg border border-border-slate/60 p-sm transition-colors hover:border-primary/40 hover:bg-surface-container-low"
                >
                  <div className="flex items-center justify-between gap-sm">
                    <span className="font-data-mono text-data-mono text-primary">{a.approvalId}</span>
                    <span className={`rounded border px-2 py-0.5 font-label-caps text-[10px] ${statusChip[a.status]}`}>
                      {approvalStatusLabel[a.status]}
                    </span>
                  </div>
                  <div className="mt-1 font-body-sm text-body-sm text-on-surface">
                    {getPatient(a.patientId)?.name} · <span className="capitalize">{a.type}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
