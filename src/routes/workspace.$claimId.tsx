import { createFileRoute, Link, notFound } from "@tanstack/react-router";

import { AppShell } from "@/components/insuraguard/AppShell";
import { Icon } from "@/components/insuraguard/Icon";
import { findClaim, validationIssues, workspaceClaim } from "@/lib/mock-data";

export const Route = createFileRoute("/workspace/$claimId")({
  loader: ({ params }) => {
    const claim = findClaim(params.claimId);
    if (!claim) throw notFound();
    return { claim };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Claim unavailable | InsuraGuard AI" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const title = `Claim ${params.claimId} | InsuraGuard AI`;
    const description = `AI pre-validation workspace for claim ${params.claimId} before Nphies submission.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  notFoundComponent: ClaimNotFound,
  component: ClaimWorkspace,
});

function ClaimNotFound() {
  return (
    <AppShell title="Claim not found" contentClassName="p-lg">
      <div className="mx-auto max-w-md rounded-xl border border-border-slate bg-white p-lg text-center shadow-sm">
        <Icon name="search_off" className="text-[32px] text-secondary" />
        <h1 className="mt-sm font-headline-sm text-headline-sm">Claim not found</h1>
        <p className="mt-xs font-body-sm text-body-sm text-on-surface-variant">
          This claim is not in the current work queue.
        </p>
        <Link
          to="/workspace"
          className="mt-md inline-flex items-center gap-sm rounded bg-primary px-4 py-2 font-label-caps text-label-caps text-on-primary"
        >
          Back to workspace queue
        </Link>
      </div>
    </AppShell>
  );
}

function ClaimWorkspace() {
  const { claim } = Route.useLoaderData();
  const data = workspaceClaim;

  return (
    <AppShell
      title={`Claim ${claim.id}`}
      backTo={{ to: "/workspace" }}
      contentClassName="flex flex-col xl:h-[calc(100vh-64px)] xl:flex-row xl:overflow-hidden"
    >
      {/* Left panel: claim data */}
      <div className="flex flex-1 flex-col gap-lg border-border-slate bg-white p-md xl:overflow-y-auto xl:border-r xl:p-lg">
        <div className="flex flex-col gap-sm border-b border-border-slate/50 pb-sm">
          <div className="flex flex-wrap items-center justify-between gap-sm">
            <div className="flex flex-col gap-1">
              <h1 className="font-headline-md text-headline-md text-on-surface">
                CLAIM #{claim.id}
              </h1>
              <div className="flex w-fit items-center gap-2 rounded border border-critical-amethyst/30 bg-critical-amethyst/10 px-2 py-1 font-label-caps text-[11px] font-bold text-critical-amethyst">
                <span className="h-1.5 w-1.5 rounded-full bg-critical-amethyst" />
                HIGH RISK · 2 ISSUES · NOT READY TO SUBMIT
              </div>
            </div>
            <div className="flex h-fit items-center gap-sm rounded-full border border-success-emerald/30 bg-success-emerald/10 px-3 py-1.5 text-success-emerald">
              <span className="h-2 w-2 animate-pulse rounded-full bg-success-emerald" />
              <span className="font-label-sm text-label-sm">Data synced · Just now</span>
              <Icon name="sync_saved_locally" className="ml-1 text-[14px]" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-lg">
          {/* Patient profile */}
          <div className="relative col-span-12 overflow-hidden rounded-xl border border-border-slate bg-surface p-md shadow-sm xl:col-span-4">
            <div className="absolute top-0 left-0 h-full w-1 bg-primary" />
            <h2 className="mb-md flex items-center gap-xs font-label-caps text-label-caps text-secondary">
              <Icon name="person" className="text-[16px]" />
              Patient Profile
            </h2>
            <div className="flex flex-col gap-sm">
              {[
                ["Name", data.patient.name],
                ["Iqama / ID", data.patient.iqama],
                ["DOB", data.patient.dob],
                ["Policy No.", data.patient.policy],
              ].map(([label, value], i) => (
                <div
                  key={label}
                  className={`flex items-center justify-between ${i < 3 ? "border-b border-border-slate/40 pb-2" : ""}`}
                >
                  <span className="font-label-sm text-label-sm text-on-surface-variant">
                    {label}
                  </span>
                  <span className="font-data-mono text-data-mono text-on-surface">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ICD-10 */}
          <div className="col-span-12 flex flex-col rounded-xl border border-border-slate bg-surface p-md shadow-sm xl:col-span-8">
            <div className="mb-md flex items-center justify-between">
              <h2 className="flex items-center gap-xs font-label-caps text-label-caps text-secondary">
                <Icon name="coronavirus" className="text-[16px]" />
                ICD-10 Diagnosis
              </h2>
              <button
                type="button"
                className="flex items-center gap-xs text-label-sm font-medium text-primary hover:underline"
              >
                <Icon name="add" className="text-[14px]" /> Add Code
              </button>
            </div>
            <div className="flex flex-wrap gap-sm">
              {data.diagnoses.map((d) => (
                <div
                  key={d.code}
                  className={`relative flex items-center gap-sm rounded-full border px-3 py-1 ${
                    d.primary
                      ? "border-primary/30 bg-primary/10"
                      : "border-border-slate bg-surface-container"
                  }`}
                >
                  {d.flagged && (
                    <span className="absolute -top-1 -right-1 z-10 h-2.5 w-2.5 rounded-full border-2 border-white bg-warning-amber" />
                  )}
                  <span
                    className={`font-data-mono text-[12px] font-bold ${d.primary ? "text-primary" : "text-secondary"}`}
                  >
                    {d.code}
                  </span>
                  <span className="h-3 w-px bg-border-slate" />
                  <span className="font-body-sm text-body-sm text-on-surface">{d.label}</span>
                  {d.primary && (
                    <span className="ml-1 rounded bg-primary px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-white uppercase">
                      Primary
                    </span>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-md flex items-center gap-xs pt-sm text-secondary">
              <Icon name="info" className="text-[14px]" />
              <span className="font-label-sm text-[11px]">
                Primary diagnosis drives medical necessity rules. Ensure correct sequencing.
              </span>
            </div>
          </div>
        </div>

        {/* Services */}
        <div className="flex flex-col overflow-hidden rounded-xl border border-border-slate bg-surface shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-sm border-b border-border-slate bg-bg-slate-light px-md py-sm">
            <h2 className="flex items-center gap-xs font-label-caps text-label-caps text-secondary">
              <Icon name="receipt_long" className="text-[16px]" />
              Requested Services (CPT/HCPCS)
            </h2>
            <span className="font-data-mono text-data-mono font-bold text-on-surface">
              Total: {data.total}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-border-slate bg-bg-slate-light font-label-caps text-[11px] font-medium text-secondary">
                  <th className="w-10 px-sm py-xs text-center">#</th>
                  <th className="w-24 px-sm py-xs">Code</th>
                  <th className="px-sm py-xs">Description</th>
                  <th className="w-16 px-sm py-xs text-center">Qty</th>
                  <th className="w-24 px-sm py-xs text-right">Unit Price</th>
                  <th className="w-24 px-sm py-xs text-right">Net (SAR)</th>
                </tr>
              </thead>
              <tbody className="font-body-sm text-body-sm text-on-surface">
                {data.services.map((s, i) => (
                  <tr
                    key={s.code}
                    className={`border-b border-border-slate/50 transition-colors last:border-0 ${
                      s.flagged ? "bg-critical-amethyst/5" : "hover:bg-bg-slate-light"
                    }`}
                  >
                    <td className="px-sm py-sm text-center text-outline">{i + 1}</td>
                    <td
                      className={`px-sm py-sm font-data-mono font-medium ${s.flagged ? "text-critical-amethyst" : "text-primary"}`}
                    >
                      <span className="flex items-center gap-1">
                        {s.flagged && <Icon name="error" className="text-[14px]" />}
                        {s.code}
                      </span>
                    </td>
                    <td className="px-sm py-sm">{s.description}</td>
                    <td className="px-sm py-sm text-center">{s.qty}</td>
                    <td className="px-sm py-sm text-right font-data-mono text-secondary">
                      {s.unit}
                    </td>
                    <td className="px-sm py-sm text-right font-data-mono font-medium">{s.net}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Documents */}
        <div className="mt-auto">
          <h2 className="mb-sm flex items-center gap-xs font-label-caps text-label-caps text-secondary">
            <Icon name="attach_file" className="text-[16px]" />
            Attached Clinical Documents ({data.documents.length})
          </h2>
          <div className="flex gap-md overflow-x-auto pb-sm">
            {data.documents.map((doc) => (
              <button
                key={doc.name}
                type="button"
                className="group flex w-48 shrink-0 items-center gap-sm rounded-lg border border-border-slate bg-surface p-sm text-left transition-colors hover:border-primary/50"
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded ${
                    doc.kind === "pdf"
                      ? "bg-error-container text-error"
                      : "bg-surface-container-high text-primary"
                  }`}
                >
                  <Icon
                    name={doc.kind === "pdf" ? "picture_as_pdf" : "image"}
                    className="text-[20px]"
                  />
                </span>
                <span className="flex w-full flex-col overflow-hidden">
                  <span className="truncate font-label-sm text-[11px] font-medium text-on-surface">
                    {doc.name}
                  </span>
                  <span className="font-body-sm text-[10px] text-secondary">{doc.meta}</span>
                </span>
              </button>
            ))}
            <div className="flex w-12 shrink-0 items-center justify-center rounded-lg border border-dashed border-outline-variant bg-surface-container-low text-secondary transition-colors hover:border-primary hover:text-primary">
              <Icon name="add" className="text-[20px]" />
            </div>
          </div>
        </div>
      </div>

      {/* Right panel: AI validation */}
      <aside className="relative z-10 flex w-full flex-col border-t border-border-slate bg-surface shadow-[-4px_0_12px_rgba(15,23,42,0.03)] xl:w-sidebar-ai xl:border-t-0 xl:border-l">
        <div className="border-b border-border-slate bg-white p-md">
          <div className="mb-md flex items-center justify-between">
            <h2 className="flex items-center gap-sm font-headline-sm text-headline-sm">
              <Icon name="psychiatry" className="text-primary" />
              AI Pre-Validation
            </h2>
            <span className="rounded border border-outline-variant/30 bg-surface-container-high px-2 py-0.5 font-data-mono text-[11px] text-secondary">
              v2.4.1
            </span>
          </div>
          <button
            type="button"
            className="flex w-full items-center justify-center gap-sm rounded-lg border border-primary bg-white px-md py-sm font-label-caps text-label-caps text-primary shadow-sm transition-all duration-150 hover:bg-primary hover:text-white active:scale-[0.98]"
          >
            <Icon name="refresh" className="text-[16px]" />
            Run Nphies Validation
          </button>
        </div>

        <div className="flex items-center justify-between border-b border-critical-amethyst/20 bg-critical-amethyst/5 px-md py-sm">
          <div className="flex items-center gap-sm">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-critical-amethyst text-white shadow-sm">
              <Icon name="gpp_bad" className="text-[18px]" />
            </span>
            <span className="flex flex-col">
              <span className="font-label-caps text-[10px] font-bold tracking-wider text-critical-amethyst uppercase">
                Overall Status
              </span>
              <span className="font-headline-sm text-[16px] leading-tight font-bold text-critical-amethyst">
                High Risk
              </span>
            </span>
          </div>
          <span className="font-data-mono text-[14px] font-bold text-critical-amethyst">
            2 Flags
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-sm bg-bg-slate-light p-md xl:overflow-y-auto">
          <div className="mb-xs pl-1 font-label-caps text-[11px] text-secondary">
            2 Issues Found (1 Blocking, 1 Review Recommended)
          </div>

          {validationIssues.map((issue) => (
            <div
              key={issue.category}
              className={`relative overflow-hidden rounded-lg border bg-white shadow-sm ${
                issue.severity === "blocking"
                  ? "border-critical-amethyst/40"
                  : "border-warning-amber/40"
              }`}
            >
              <div
                className={`absolute top-0 bottom-0 left-0 w-1 ${
                  issue.severity === "blocking" ? "bg-critical-amethyst" : "bg-warning-amber"
                }`}
              />
              <div className="p-3">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded px-1.5 py-0.5 text-[9px] font-bold tracking-wider uppercase ${
                      issue.severity === "blocking"
                        ? "bg-critical-amethyst/15 text-critical-amethyst"
                        : "bg-warning-amber/15 text-warning-amber"
                    }`}
                  >
                    {issue.severity === "blocking" ? "Blocking" : "Review Recommended"}
                  </span>
                  <span className="font-label-caps text-[10px] font-medium text-secondary">
                    {issue.category}
                  </span>
                </div>
                <h3 className="mb-1 font-body-sm text-[13px] leading-tight font-medium text-on-surface">
                  {issue.title}
                </h3>
                <div className="mt-2 flex flex-col gap-1 rounded border border-outline-variant/30 bg-surface-container-low p-2">
                  <span className="font-label-sm text-[10px] text-secondary uppercase">
                    Evidence Trigger
                  </span>
                  <p className="flex items-start gap-1 font-data-mono text-[11px] text-on-surface-variant">
                    <Icon
                      name={issue.severity === "blocking" ? "error" : "info"}
                      className={`mt-0.5 text-[12px] ${issue.severity === "blocking" ? "text-critical-amethyst" : "text-warning-amber"}`}
                    />
                    {issue.evidence}
                  </p>
                </div>
                {issue.why && (
                  <div className="mt-2 text-[11px] text-on-surface-variant">
                    <span className="font-semibold">Why it matters:</span> {issue.why}
                  </div>
                )}
                {issue.fix && (
                  <div className="mt-1 text-[11px] text-on-surface-variant">
                    <span className="font-semibold">Recommended fix:</span> {issue.fix}
                  </div>
                )}
                <div className="mt-3 flex items-center justify-between gap-sm">
                  <button
                    type="button"
                    className="flex items-center gap-1 text-[11px] font-medium text-secondary transition-colors hover:text-on-surface"
                  >
                    <Icon name="visibility" className="text-[14px]" /> View Ruleset
                  </button>
                  <button
                    type="button"
                    className={`flex items-center gap-1 rounded border bg-white px-3 py-1 font-label-sm text-[11px] transition-colors ${
                      issue.severity === "blocking"
                        ? "border-success-emerald text-success-emerald hover:bg-success-emerald hover:text-white"
                        : "border-secondary text-secondary hover:bg-secondary hover:text-white"
                    }`}
                  >
                    {issue.severity === "blocking" ? (
                      <>
                        <Icon name="auto_fix_high" className="text-[14px]" /> Apply Fix
                      </>
                    ) : (
                      "Review Alternatives"
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}

          <div className="mt-2 flex items-center justify-center rounded-lg border border-dashed border-outline-variant py-3 text-secondary opacity-60">
            <span className="flex items-center gap-2 font-label-sm text-[11px]">
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-secondary border-t-transparent" />
              Monitoring changes...
            </span>
          </div>
        </div>

        <div className="border-t border-border-slate bg-white p-md">
          <button
            type="button"
            disabled
            className="flex w-full cursor-not-allowed items-center justify-center gap-sm rounded-lg bg-surface-container px-md py-sm font-label-caps text-label-caps text-outline"
          >
            <Icon name="lock" className="text-[18px]" />
            Submit Directly to Nphies
          </button>
          <p className="mt-2 flex items-center justify-center gap-1 text-center font-label-sm text-[11px] text-error-red">
            <Icon name="error" className="text-[12px]" /> 1 blocking issue remaining
          </p>
          <div className="pt-sm text-center">
            <Link
              to="/submissions"
              className="font-label-sm text-label-sm text-primary hover:underline"
            >
              View submission history
            </Link>
          </div>
        </div>
      </aside>
    </AppShell>
  );
}
