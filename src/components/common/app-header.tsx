"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Printer,
  LayoutDashboard,
  Settings,
  Layers,
  Scissors,
  Users,
  BarChart3,
  Search,
  X,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { t } from "@/lib/i18n";
import { useSettingsStore } from "@/store";
import { globalSearch } from "@/lib/storage";
import type { Customer, PrintJob, Invoice } from "@/lib/types";

const navItems = [
  { href: "/", icon: LayoutDashboard, labelKey: "nav.dashboard" as const },
  { href: "/editor", icon: Printer, labelKey: "nav.editor" as const },
  { href: "/templates", icon: Layers, labelKey: "nav.templates" as const },
  { href: "/jobs", icon: Layers, labelKey: "nav.jobs" as const },
  { href: "/billing", icon: LayoutDashboard, labelKey: "nav.billing" as const },
  { href: "/file-tools", icon: Scissors, labelKey: "nav.fileTools" as const },
  { href: "/customers", icon: Users, labelKey: "nav.customers" as const },
  { href: "/reports", icon: BarChart3, labelKey: "nav.reports" as const },
  { href: "/settings", icon: Settings, labelKey: "nav.settings" as const },
];

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const language = useSettingsStore((s) => s.settings.language);

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<{
    customers: Customer[];
    jobs: PrintJob[];
    invoices: Invoice[];
  } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const runSearch = useCallback(async (q: string) => {
    if (q.length < 2) { setResults(null); return; }
    const r = await globalSearch(q);
    setResults(r);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => runSearch(searchQuery), 250);
    return () => clearTimeout(timer);
  }, [searchQuery, runSearch]);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  // F6 global search hotkey
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "F6") { e.preventDefault(); setSearchOpen(true); }
      if (e.key === "Escape") { setSearchOpen(false); setSearchQuery(""); setResults(null); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <header className="border-b border-slate-200 bg-white relative">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold text-slate-900">
          <Printer className="h-5 w-5 text-blue-600" />
          <span className="hidden md:inline">{t("app.title", language)}</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-0.5">
          {navItems.map(({ href, icon: Icon, labelKey }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors",
                pathname === href || (href !== "/" && pathname.startsWith(href))
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {t(labelKey, language)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {/* Search button */}
          <button
            onClick={() => setSearchOpen((s) => !s)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-50"
          >
            <Search className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Search</span>
            <kbd className="hidden sm:inline rounded bg-slate-100 px-1 text-[10px]">F6</kbd>
          </button>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen((s) => !s)}
            className="lg:hidden rounded-lg p-2 text-slate-600 hover:bg-slate-50"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-2">
          <nav className="grid grid-cols-3 gap-1">
            {navItems.map(({ href, icon: Icon, labelKey }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-lg p-2 text-xs font-medium",
                  pathname === href || (href !== "/" && pathname.startsWith(href))
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-50"
                )}
              >
                <Icon className="h-4 w-4" />
                {t(labelKey, language)}
              </Link>
            ))}
          </nav>
        </div>
      )}

      {/* Search overlay */}
      {searchOpen && (
        <div className="absolute left-0 right-0 top-14 z-50 border-b border-slate-200 bg-white px-4 py-3 shadow-lg">
          <div className="mx-auto max-w-2xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                ref={searchRef}
                type="text"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-10 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
                placeholder="Search customers, jobs, invoices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                onClick={() => { setSearchOpen(false); setSearchQuery(""); setResults(null); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {results && (
              <div className="mt-3 max-h-72 space-y-3 overflow-y-auto">
                {results.customers.length > 0 && (
                  <div>
                    <p className="mb-1 text-xs font-semibold text-slate-400 uppercase">Customers</p>
                    {results.customers.map((c) => (
                      <button key={c.id} className="block w-full rounded px-3 py-1.5 text-left text-sm hover:bg-slate-50" onClick={() => { router.push("/customers"); setSearchOpen(false); }}>
                        {c.name} {c.mobile && `· ${c.mobile}`}
                      </button>
                    ))}
                  </div>
                )}
                {results.jobs.length > 0 && (
                  <div>
                    <p className="mb-1 text-xs font-semibold text-slate-400 uppercase">Jobs</p>
                    {results.jobs.map((j) => (
                      <button key={j.id} className="block w-full rounded px-3 py-1.5 text-left text-sm hover:bg-slate-50" onClick={() => { router.push("/jobs"); setSearchOpen(false); }}>
                        #{j.jobNumber} — {j.customerName} · {j.serviceName}
                      </button>
                    ))}
                  </div>
                )}
                {results.invoices.length > 0 && (
                  <div>
                    <p className="mb-1 text-xs font-semibold text-slate-400 uppercase">Invoices</p>
                    {results.invoices.map((inv) => (
                      <button key={inv.id} className="block w-full rounded px-3 py-1.5 text-left text-sm hover:bg-slate-50" onClick={() => { router.push("/billing"); setSearchOpen(false); }}>
                        {inv.invoiceNumber} — {inv.customerName} · ₹{inv.total}
                      </button>
                    ))}
                  </div>
                )}
                {results.customers.length === 0 && results.jobs.length === 0 && results.invoices.length === 0 && (
                  <p className="py-4 text-center text-sm text-slate-500">No results found.</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
