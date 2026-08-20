import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/insuraguard/AppShell";
import { Icon } from "@/components/insuraguard/Icon";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings | InsuraGuard AI" },
      {
        name: "description",
        content:
          "Manage facility profile, Nphies integration credentials and AI validation preferences.",
      },
      { property: "og:title", content: "Settings | InsuraGuard AI" },
      {
        property: "og:description",
        content: "Manage facility profile, Nphies integration and AI validation preferences.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SettingsPage,
});

const sections = [
  {
    icon: "local_hospital",
    title: "Facility Profile",
    desc: "King Faisal Specialist Hospital — Provider ID 1002938",
  },
  {
    icon: "hub",
    title: "Nphies Integration",
    desc: "Connected · Last handshake 20-May-2024 14:32 AST",
  },
  {
    icon: "smart_toy",
    title: "AI Validation Rules",
    desc: "Strict coding checks enabled · Auto-flag duplicates",
  },
  {
    icon: "group",
    title: "Team & Permissions",
    desc: "12 active users across RCM, Coding and Billing",
  },
];

function SettingsPage() {
  return (
    <AppShell title="Settings" contentClassName="p-md lg:p-lg">
      <div className="flex flex-col gap-lg">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Settings</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Configuration for your facility, integrations and validation engine.
          </p>
        </div>

        <div className="grid gap-md sm:grid-cols-2">
          {sections.map((s) => (
            <div
              key={s.title}
              className="flex items-start gap-sm rounded-lg border border-border-slate bg-white p-md shadow-sm"
            >
              <span className="rounded-lg bg-surface-container-low p-2 text-primary">
                <Icon name={s.icon} />
              </span>
              <div>
                <div className="font-headline-sm text-headline-sm text-on-surface">{s.title}</div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
