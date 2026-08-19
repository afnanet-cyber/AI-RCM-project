import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";

import { cn } from "@/lib/utils";
import { Icon } from "./Icon";
import { Logo } from "./Logo";

const navItems = [
  { to: "/", label: "Dashboard", icon: "dashboard", exact: true },
  { to: "/workspace", label: "Workspace", icon: "clinical_notes", exact: false },
  { to: "/submissions", label: "Submissions", icon: "history", exact: false },
  { to: "/reports", label: "Reports", icon: "analytics", exact: false },
  { to: "/settings", label: "Settings", icon: "settings", exact: false },
] as const;

function SideNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full w-nav-width flex-col border-r border-border-slate bg-surface py-lg">
      <Link
        to="/"
        onClick={onNavigate}
        className="mb-xl flex items-center gap-sm px-gutter"
      >
        <Logo />
        <div>
          <div className="font-headline-sm text-headline-sm font-bold text-primary">
            InsuraGuard <span className="text-tertiary">AI</span>
          </div>
          <div className="font-body-sm text-body-sm text-secondary">
            RCM Management
          </div>
        </div>
      </Link>

      <nav className="flex-1 space-y-xs px-sm">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            activeOptions={{ exact: item.exact }}
            className="flex items-center gap-sm rounded-lg px-sm py-sm text-secondary transition-colors hover:bg-surface-container"
            activeProps={{
              className:
                "flex items-center gap-sm rounded-lg px-sm py-sm text-primary bg-surface-container-low border-l-4 border-primary transition-all duration-150",
            }}
          >
            {({ isActive }) => (
              <>
                <Icon name={item.icon} fill={isActive} />
                {item.label}
              </>
            )}
          </Link>
        ))}
      </nav>

      <div className="mt-auto px-gutter">
        <Link
          to="/workspace/$claimId"
          params={{ claimId: "CLM-2023-891A" }}
          onClick={onNavigate}
          className="flex w-full items-center justify-center gap-sm rounded bg-primary px-md py-sm font-label-sm text-label-sm text-on-primary transition-opacity hover:opacity-90"
        >
          Submit to InsuraGuard AI
        </Link>
      </div>
    </div>
  );
}

export function AppShell({
  title,
  backTo,
  children,
  contentClassName,
}: {
  title: string;
  backTo?: { to: string; params?: Record<string, string> };
  children: ReactNode;
  contentClassName?: string;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg-slate-light font-body-md text-body-md text-on-surface">
      {/* Desktop side navigation */}
      <div className="fixed inset-y-0 left-0 z-20 hidden lg:block">
        <SideNav />
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            className="absolute inset-0 bg-nav-dark/40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 shadow-xl">
            <SideNav onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Top app bar */}
      <header className="fixed top-0 right-0 left-0 z-30 flex h-16 items-center justify-between border-b border-border-slate bg-white px-md font-label-caps text-label-caps shadow-sm lg:left-nav-width lg:px-lg">
        <div className="flex min-w-0 items-center gap-sm font-bold text-on-surface">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
            className="text-on-surface-variant transition-colors hover:text-primary lg:hidden"
          >
            <Icon name="menu" />
          </button>
          {backTo && (
            <Link
              to={backTo.to}
              params={backTo.params as never}
              aria-label="Go back"
              className="text-secondary transition-colors hover:text-primary"
            >
              <Icon name="arrow_back" />
            </Link>
          )}
          <span className="truncate">{title}</span>
        </div>

        <div className="flex items-center gap-md">
          <div className="hidden text-right sm:block">
            <div className="text-on-surface">Al Noor Hospital</div>
            <div className="normal-case text-on-surface-variant">RCM Auditor</div>
          </div>
          <div className="mx-sm hidden h-8 w-px bg-border-slate sm:block" />
          <Link
            to="/submissions"
            aria-label="Notifications"
            className="text-on-surface-variant transition-all hover:text-primary"
          >
            <Icon name="notifications" />
          </Link>
          <Link
            to="/settings"
            aria-label="Help and settings"
            className="text-on-surface-variant transition-all hover:text-primary"
          >
            <Icon name="help" />
          </Link>
          <Link
            to="/settings"
            aria-label="Account settings"
            className="ml-sm flex h-8 w-8 items-center justify-center rounded-full border border-border-slate bg-surface-container-high font-label-sm text-primary"
          >
            AN
          </Link>
        </div>
      </header>

      <main className={cn("pt-16 lg:ml-nav-width", contentClassName)}>
        {children}
      </main>
    </div>
  );
}
