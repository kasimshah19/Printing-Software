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
  Scissors,
  FileSignature,
  FileText,
  IndianRupee,
  TrendingUp,
  Layers,
} from "lucide-react";
import { AppHeader } from "@/components/common/app-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useProjectStore, useSettingsStore } from "@/store";
import { getTodayJobStats, getTodayInvoiceStats, loadAllJobs } from "@/lib/storage";
import type { PrintJob } from "@/lib/types";
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
  {
    id: "compress",
    label: "Compress Image",
    icon: Scissors,
    href: "/file-tools",
    color: "bg-pink-50 text-pink-700 border-pink-200",
  },
  {
    id: "signature",
    label: "Signature",
    icon: FileSignature,
    href: "/file-tools",
    color: "bg-amber-50 text-amber-700 border-amber-200",
  },
  {
    id: "document",
    label: "Document Scan",
    icon: FileText,
    href: "/editor",
    color: "bg-teal-50 text-teal-700 border-teal-200",
  },
  {
    id: "new-job",
    label: "New Job",
    icon: Layers,
    href: "/jobs",
    color: "bg-slate-100 text-slate-700 border-slate-200",
  },
];

export default function DashboardPage() {
  const language = useSettingsStore((s) => s.settings.language);
  const loadSettings = useSettingsStore((s) => s.loadFromStorage);
  const recentProjects = useProjectStore((s) => s.recentProjects);
  const loadRecent = useProjectStore((s) => s.loadRecent);

  const [jobStats, setJobStats] = useState({ total: 0, printed: 0, pending: 0 });
  const [invoiceStats, setInvoiceStats] = useState({ totalSales: 0, invoicesCount: 0 });
  const [recentJobs, setRecentJobs] = useState<PrintJob[]>([]);

  useEffect(() => {
    loadSettings();
    loadRecent();
    getTodayJobStats().then(setJobStats);
    getTodayInvoiceStats().then(setInvoiceStats);
    loadAllJobs().then((jobs) => setRecentJobs(jobs.slice(0, 5)));
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

        {/* Today Stats */}
        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase">{t("dashboard.totalJobs", language)}</p>
                  <p className="mt-1 text-3xl font-bold text-slate-900">{jobStats.total}</p>
                </div>
                <div className="rounded-full bg-blue-50 p-3">
                  <Layers className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase">{t("dashboard.printed", language)}</p>
                  <p className="mt-1 text-3xl font-bold text-green-600">{jobStats.printed}</p>
                </div>
                <div className="rounded-full bg-green-50 p-3">
                  <Printer className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase">{t("dashboard.pending", language)}</p>
                  <p className="mt-1 text-3xl font-bold text-orange-500">{jobStats.pending}</p>
                </div>
                <div className="rounded-full bg-orange-50 p-3">
                  <Clock className="h-5 w-5 text-orange-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase">{t("billing.todaySales", language)}</p>
                  <p className="mt-1 text-3xl font-bold text-slate-900">₹{invoiceStats.totalSales.toFixed(0)}</p>
                </div>
                <div className="rounded-full bg-violet-50 p-3">
                  <IndianRupee className="h-5 w-5 text-violet-600" />
                </div>
              </div>
              <p className="mt-2 text-xs text-slate-500 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> {invoiceStats.invoicesCount} invoices
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Quick Jobs */}
        <section className="mb-10">
          <h2 className="mb-4 text-sm font-semibold text-slate-500 uppercase tracking-wider">
            Quick Jobs
          </h2>
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-4 lg:grid-cols-8">
            {quickActions.map(({ id, icon: Icon, href, color, ...rest }) => {
              const label = "labelKey" in rest ? t(rest.labelKey as any, language) : (rest as any).label ?? id;
              return (
                <Link key={id} href={href}>
                  <Card className={`cursor-pointer border transition-all hover:shadow-md hover:-translate-y-0.5 ${color}`}>
                    <CardContent className="flex flex-col items-center gap-2 p-4">
                      <div className="rounded-full bg-white/80 p-2.5">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-center text-xs font-semibold leading-tight">
                        {label}
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Recent Jobs */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-500 uppercase tracking-wider">
                Active Jobs
              </h2>
              <Link href="/jobs" className="text-xs font-medium text-blue-600 hover:underline">
                View All →
              </Link>
            </div>
            {recentJobs.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center text-slate-500">
                  {t("jobs.noJobs", language)}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {recentJobs.map((job) => (
                  <Card key={job.id}>
                    <CardContent className="flex items-center justify-between p-3">
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">
                          <span className="text-slate-400">#{job.jobNumber}</span>{" "}
                          {job.customerName || "Walk-in"}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {job.serviceName} · {job.copies} copies
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                          job.status === "completed" || job.status === "printed"
                            ? "bg-green-50 text-green-700"
                            : job.status === "cancelled" || job.status === "failed"
                            ? "bg-red-50 text-red-700"
                            : "bg-orange-50 text-orange-700"
                        }`}
                      >
                        {job.status}
                      </span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* Recent Projects */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-500 uppercase tracking-wider">
                {t("dashboard.recentProjects", language)}
              </h2>
            </div>
            {recentProjects.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center text-slate-500">
                  {t("dashboard.noRecentProjects", language)}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {recentProjects.map((project) => (
                  <Card key={project.id}>
                    <CardContent className="flex items-center justify-between p-3">
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{project.name}</p>
                        <p className="text-xs text-slate-500 truncate">
                          {project.customerName && `${project.customerName} · `}
                          {new Date(project.updatedAt).toLocaleString()}
                        </p>
                      </div>
                      <Link href={`/editor?project=${project.id}`}>
                        <Button variant="outline" size="sm" className="gap-1 text-xs">
                          Open <ArrowRight className="h-3 w-3" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
