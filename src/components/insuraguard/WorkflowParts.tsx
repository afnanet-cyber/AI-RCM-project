import { useState } from "react";

import { Icon } from "./Icon";
import {
  documentTypeIcon,
  documentTypeLabel,
  type HisDocument,
} from "@/lib/his-data";
import { severityStyles, type ValidationResult } from "@/lib/rules-matrix";
import type { Message, StatusEvent, WorkMode } from "@/lib/rcm-store";

export function ModeToggle({
  mode,
  onChange,
}: {
  mode: WorkMode;
  onChange: (mode: WorkMode) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-sm rounded-xl border border-border-slate bg-white p-md">
      <div className="flex-1">
        <div className="font-label-caps text-label-caps text-on-surface">Working mode</div>
        <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
          {mode === "ai"
            ? "AI mode: documents are collected and analysed automatically from the hospital system."
            : "Manual mode: the auditor picks which hospital-system documents to attach."}
        </p>
      </div>
      <div className="flex overflow-hidden rounded border border-border-slate">
        {(["ai", "manual"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => onChange(m)}
            className={`flex items-center gap-1 px-4 py-2 font-label-caps text-label-caps transition-colors ${
              mode === m ? "bg-primary text-on-primary" : "text-on-surface hover:bg-surface-container-low"
            }`}
          >
            <Icon name={m === "ai" ? "auto_awesome" : "checklist"} className="text-[18px]" />
            {m === "ai" ? "AI Mode" : "Manual Mode"}
          </button>
        ))}
      </div>
    </div>
  );
}

export function DocumentPicker({
  documents,
  selectedIds,
  mode,
  onToggle,
}: {
  documents: HisDocument[];
  selectedIds: string[];
  mode: WorkMode;
  onToggle: (documentId: string) => void;
}) {
  return (
    <section className="rounded-xl border border-border-slate bg-white">
      <header className="flex items-center justify-between gap-sm border-b border-border-slate px-md py-sm">
        <h2 className="font-label-caps text-label-caps text-on-surface">
          Documents collected from the hospital system
        </h2>
        <span className="font-label-sm text-label-sm text-on-surface-variant">
          {selectedIds.length} / {documents.length} attached
        </span>
      </header>
      {documents.length === 0 ? (
        <p className="p-md font-body-sm text-body-sm text-on-surface-variant">
          No documents found in the hospital system for this period.
        </p>
      ) : (
        <ul className="divide-y divide-border-slate/60">
          {documents.map((doc) => {
            const checked = selectedIds.includes(doc.documentId);
            return (
              <li key={doc.documentId} className="flex items-start gap-sm px-md py-sm">
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={mode === "ai"}
                  onChange={() => onToggle(doc.documentId)}
                  aria-label={`Attach ${doc.title}`}
                  className="mt-1 h-4 w-4 accent-[#1D4ED8] disabled:opacity-50"
                />
                <Icon name={documentTypeIcon[doc.documentType]} className="mt-0.5 text-primary" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-sm">
                    <span className="font-body-md text-body-md text-on-surface">{doc.title}</span>
                    <span className="rounded bg-surface-variant px-2 py-0.5 font-label-caps text-[10px] text-secondary">
                      {documentTypeLabel[doc.documentType]}
                    </span>
                  </div>
                  <p className="mt-0.5 font-body-sm text-body-sm text-on-surface-variant">{doc.summary}</p>
                  <div className="mt-1 flex flex-wrap gap-sm font-label-sm text-label-sm text-on-surface-variant">
                    <span>{doc.serviceDate}</span>
                    <span>·</span>
                    <span>{doc.source}</span>
                    <span>·</span>
                    <span>{doc.sizeKb} KB</span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export function ValidationPanel({ result }: { result?: ValidationResult }) {
  if (!result) return null;
  return (
    <section className="rounded-xl border border-border-slate bg-white">
      <header className="flex items-center justify-between gap-sm border-b border-border-slate px-md py-sm">
        <h2 className="font-label-caps text-label-caps text-on-surface">AI validation against the rules matrix</h2>
        <span
          className={`rounded px-2 py-0.5 font-label-caps text-label-caps ${
            result.score >= 90
              ? "bg-emerald-50 text-emerald-700"
              : result.score >= 60
                ? "bg-amber-50 text-amber-700"
                : "bg-red-50 text-red-700"
          }`}
        >
          Readiness {result.score}%
        </span>
      </header>
      <div className="px-md py-sm font-label-sm text-label-sm text-on-surface-variant">
        {result.passedRules} of {result.totalRules} applicable rules passed.
      </div>
      {result.issues.length === 0 ? (
        <p className="flex items-center gap-sm px-md pb-md font-body-sm text-body-sm text-emerald-700">
          <Icon name="verified" /> No blocking issues detected — ready for submission.
        </p>
      ) : (
        <ul className="space-y-sm px-md pb-md">
          {result.issues.map((issue) => {
            const s = severityStyles[issue.severity];
            return (
              <li key={issue.ruleId} className={`rounded-lg border p-sm ${s.chip}`}>
                <div className="flex items-center gap-sm font-label-caps text-label-caps">
                  <Icon name={s.icon} className="text-[18px]" />
                  {s.label} · {issue.ruleId} · {issue.category}
                </div>
                <p className="mt-1 font-body-sm text-body-sm">{issue.message}</p>
                <p className="mt-0.5 font-body-sm text-body-sm opacity-80">{issue.detail}</p>
                <p className="mt-1 font-body-sm text-body-sm opacity-80">
                  <strong>Suggested fix:</strong> {issue.suggestion}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export function StatusTimeline({
  history,
  labelFor,
}: {
  history: StatusEvent[];
  labelFor: (status: string) => string;
}) {
  return (
    <section className="rounded-xl border border-border-slate bg-white p-md">
      <h2 className="font-label-caps text-label-caps text-on-surface">Status history</h2>
      <ol className="mt-sm space-y-sm">
        {history.map((event, i) => (
          <li key={`${event.at}-${i}`} className="flex gap-sm">
            <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
            <div>
              <div className="font-body-sm text-body-sm text-on-surface">{labelFor(event.status)}</div>
              <div className="font-label-sm text-label-sm text-on-surface-variant">
                {new Date(event.at).toLocaleString("en-GB")} · {event.actor}
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">{event.note}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function CommunicationBox({
  messages,
  onSend,
}: {
  messages: Message[];
  onSend: (channel: Message["channel"], body: string) => void;
}) {
  const [channel, setChannel] = useState<Message["channel"]>("internal");
  const [body, setBody] = useState("");

  return (
    <section className="rounded-xl border border-border-slate bg-white p-md">
      <h2 className="font-label-caps text-label-caps text-on-surface">Communication box</h2>
      <div className="mt-sm space-y-sm">
        {messages.length === 0 && (
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            No messages yet. Use this box to log internal notes or payer correspondence.
          </p>
        )}
        {messages.map((m) => (
          <div key={m.messageId} className="rounded-lg border border-border-slate/60 bg-surface-container-low p-sm">
            <div className="flex items-center gap-sm font-label-sm text-label-sm text-on-surface-variant">
              <span
                className={`rounded px-2 py-0.5 font-label-caps text-[10px] ${
                  m.channel === "payer" ? "bg-purple-50 text-purple-700" : "bg-sky-50 text-sky-700"
                }`}
              >
                {m.channel === "payer" ? "Payer" : "Internal"}
              </span>
              {m.author} · {new Date(m.at).toLocaleString("en-GB")}
            </div>
            <p className="mt-1 font-body-sm text-body-sm text-on-surface">{m.body}</p>
          </div>
        ))}
      </div>

      <form
        className="mt-md flex flex-col gap-sm"
        onSubmit={(e) => {
          e.preventDefault();
          if (!body.trim()) return;
          onSend(channel, body.trim());
          setBody("");
        }}
      >
        <div className="flex gap-sm">
          {(["internal", "payer"] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setChannel(c)}
              className={`rounded border px-3 py-1 font-label-caps text-label-caps transition-colors ${
                channel === c
                  ? "border-primary bg-primary text-on-primary"
                  : "border-border-slate text-on-surface hover:bg-surface-container-low"
              }`}
            >
              {c === "internal" ? "Internal note" : "Payer message"}
            </button>
          ))}
        </div>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          placeholder="Write a message…"
          className="rounded border border-border-slate px-3 py-2 font-body-sm text-body-sm text-on-surface outline-none focus:border-primary"
        />
        <button
          type="submit"
          className="self-start rounded bg-primary px-4 py-2 font-label-caps text-label-caps text-on-primary transition-opacity hover:opacity-90"
        >
          Send
        </button>
      </form>
    </section>
  );
}
