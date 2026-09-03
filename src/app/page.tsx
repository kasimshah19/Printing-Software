"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Camera,
  CreditCard,
  FileImage,
  Printer,
  ArrowRight,
  Clock,
} from "lucide-react";
import { AppHeader } from "@/components/common/app-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useProjectStore, useSettingsStore } from "@/store";
import { getTodayJobStats, getTodayInvoiceStats } from "@/lib/storage";
import { t } from "@/lib/i18n";

const quickActions = [
  {
    id: "passport-photo",
    labelKey: "dashboard.passportPhoto" as const,
    icon: Camera,
    href: "/editor?template=passport-photo",
    color: "bg-blue-50 text-blue-700 border-blue-200",
  },
  {
    id: "aadhaar",
    labelKey: "dashboard.idCard" as const,
    icon: CreditCard,
    href: "/editor?template=aadhaar",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  {
    id: "passport-a4-35",
    labelKey: "dashboard.a4Sheet" as const,
    icon: FileImage,
    href: "/editor?template=passport-a4-35",
    color: "bg-violet-50 text-violet-700 border-violet-200",
  },
  {
    id: "custom",
    labelKey: "dashboard.customPrint" as const,
    icon: Printer,
    href: "/editor",
    color: "bg-orange-50 text-orange-700 border-orange-200",
  },
];

export default function DashboardPage() {
  const language = useSettingsStore((s) => s.settings.language);
  const loadSettings = useSettingsStore((s) => s.loadFromStorage);
  const recentProjects = useProjectStore((s) => s.recentProjects);
  const loadRecent = useProjectStore((s) => s.loadRecent);

  const [jobStats, setJobStats] = useState({ total: 0, printed: 0, pending: 0 });
  const [invoiceStats, setInvoiceStats] = useState({ totalSales: 0, invoicesCount: 0 });

  useEffect(() => {
    loadSettings();
    loadRecent();
    getTodayJobStats().then(setJobStats);
    getTodayInvoiceStats().then(setInvoiceStats);
  }, [loadSettings, loadRecent]);

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            {t("nav.dashboard", language)}
          </h1>
          <p className="mt-1 text-slate-600">{t("app.tagline", language)}</p>
        </div>

        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">
            {t("dashboard.quickActions", language)}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map(({ id, labelKey, icon: Icon, href, color }) => (
              <Link key={id} href={href}>
                <Card
                  className={`cursor-pointer border-2 transition-all hover:shadow-md ${color}`}
                >
                  <CardContent className="flex flex-col items-center gap-3 p-6">
                    <div className="rounded-full bg-white/80 p-3">
                      <Icon className="h-8 w-8" />
                    </div>
                    <span className="text-center font-semibold">
                      {t(labelKey, language)}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <section className="mb-10 grid gap-4 sm:grid-cols-2">
          <Card>
            <CardContent className="p-6">
              <h3 className="mb-4 text-sm font-semibold text-slate-500 uppercase tracking-wider">
                {t("dashboard.todayStats", language)} - {t("nav.jobs", language)}
              </h3>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold text-slate-900">{jobStats.total}</p>
                  <p className="text-sm font-medium text-slate-500">{t("dashboard.totalJobs", language)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm">
                    <span className="font-semibold text-green-600">{jobStats.printed}</span> {t("dashboard.printed", language)}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold text-orange-600">{jobStats.pending}</span> {t("dashboard.pending", language)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <h3 className="mb-4 text-sm font-semibold text-slate-500 uppercase tracking-wider">
                {t("dashboard.todayStats", language)} - {t("nav.billing", language)}
              </h3>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold text-slate-900">₹{invoiceStats.totalSales.toFixed(2)}</p>
                  <p className="text-sm font-medium text-slate-500">{t("billing.totalRevenue", language)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm">
                    <span className="font-semibold text-blue-600">{invoiceStats.invoicesCount}</span> {t("billing.totalInvoices", language)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-800">
            <Clock className="h-5 w-5" />
            {t("dashboard.recentProjects", language)}
          </h2>
          {recentProjects.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-slate-500">
                {t("dashboard.noRecentProjects", language)}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3">
              {recentProjects.map((project) => (
                <Card key={project.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-medium">{project.name}</p>
                      <p className="text-sm text-slate-500">
                        {project.customerName && `${project.customerName} · `}
                        {new Date(project.updatedAt).toLocaleString()}
                      </p>
                    </div>
                    <Link href={`/editor?project=${project.id}`}>
                      <Button variant="outline" size="sm">
                        Open
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
