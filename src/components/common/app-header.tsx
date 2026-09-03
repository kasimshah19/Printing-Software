"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Printer, LayoutDashboard, Settings, Layers } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { t } from "@/lib/i18n";
import { useSettingsStore } from "@/store";

const navItems = [
  { href: "/", icon: LayoutDashboard, labelKey: "nav.dashboard" as const },
  { href: "/editor", icon: Printer, labelKey: "nav.editor" as const },
  { href: "/templates", icon: Layers, labelKey: "nav.templates" as const },
  { href: "/settings", icon: Settings, labelKey: "nav.settings" as const },
  { href: "/jobs", icon: Layers, labelKey: "nav.jobs" as const },
  { href: "/billing", icon: LayoutDashboard, labelKey: "nav.billing" as const },
];

export function AppHeader() {
  const pathname = usePathname();
  const language = useSettingsStore((s) => s.settings.language);

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold text-slate-900">
          <Printer className="h-5 w-5 text-blue-600" />
          {t("app.title", language)}
        </Link>
        <nav className="flex items-center gap-1">
          {navItems.map(({ href, icon: Icon, labelKey }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname === href || (href !== "/" && pathname.startsWith(href))
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{t(labelKey, language)}</span>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
