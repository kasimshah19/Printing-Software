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
  Upload,
  FileUp,
  ClipboardPaste,
  Smartphone,
  ScanLine,
  FolderDown,
  Star
} from "lucide-react";
import { AppHeader } from "@/components/common/app-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSettingsStore } from "@/store";
import { getTodayJobStats, getTodayInvoiceStats, loadAllJobs } from "@/lib/storage";
import type { PrintJob } from "@/lib/types";
import { t } from "@/lib/i18n";
import { BUILT_IN_TEMPLATES } from "@/lib/templates/built-in";

const quickActions = [
  { id: "passport", label: "Passport Photo", icon: Camera, href: "/photo-studio", color: "bg-blue-50 text-blue-700 border-blue-200" },
  { id: "id-card", label: "Generic ID Card", icon: CreditCard, href: "/id-card-studio?template=generic", color: "bg-sky-50 text-sky-700 border-sky-200" },
  { id: "aadhaar", label: "Aadhaar PVC", icon: CreditCard, href: "/id-card-studio?template=aadhaar", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { id: "pan", label: "PAN Card", icon: CreditCard, href: "/id-card-studio?template=pan", color: "bg-teal-50 text-teal-700 border-teal-200" },
  { id: "dl", label: "Driving Licence", icon: CreditCard, href: "/id-card-studio?template=dl", color: "bg-cyan-50 text-cyan-700 border-cyan-200" },
  { id: "voter", label: "Voter ID", icon: CreditCard, href: "/id-card-studio?template=voter", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  { id: "document", label: "A4 Document", icon: FileText, href: "/editor?template=aadhaar-letter", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  { id: "pdf", label: "PDF Tools", icon: FileUp, href: "/file-tools", color: "bg-pink-50 text-pink-700 border-pink-200" },
  { id: "signature", label: "Signature", icon: FileSignature, href: "/file-tools", color: "bg-amber-50 text-amber-700 border-amber-200" },
  { id: "compress", label: "Compress", icon: Scissors, href: "/file-tools", color: "bg-rose-50 text-rose-700 border-rose-200" },
  { id: "custom", label: "Custom Print", icon: Printer, href: "/editor", color: "bg-orange-50 text-orange-700 border-orange-200" },
];

interface ActionType {
  id: string;
  label: string;
  icon: any;
  href: string;
  comingSoon?: boolean;
}

const importActions: ActionType[] = [
  { id: "upload-image", label: "Upload Image", icon: Upload, href: "/editor" },
  { id: "upload-pdf", label: "Upload PDF", icon: FileUp, href: "/editor" },
  { id: "paste-image", label: "Paste Image", icon: ClipboardPaste, href: "/editor" },
  { id: "camera", label: "Camera", icon: Camera, href: "/editor" },
  { id: "phone-qr", label: "Phone QR", icon: Smartphone, href: "/connectivity" },
  { id: "scanner", label: "Scanner", icon: ScanLine, href: "/connectivity" },
  { id: "hot-folder", label: "Hot Folder", icon: FolderDown, href: "/connectivity" },
];

export default function DashboardPage() {
  const language = useSettingsStore((s) => s.settings.language);
  const loadSettings = useSettingsStore((s) => s.loadFromStorage);

  const [jobStats, setJobStats] = useState({ total: 0, printed: 0, pending: 0 });
  const [invoiceStats, setInvoiceStats] = useState({ totalSales: 0, invoicesCount: 0 });
  const [recentJobs, setRecentJobs] = useState<PrintJob[]>([]);

  useEffect(() => {
    loadSettings();
    getTodayJobStats().then(setJobStats);
    getTodayInvoiceStats().then(setInvoiceStats);
    loadAllJobs().then((jobs) => setRecentJobs(jobs.slice(0, 5)));
  }, [loadSettings]);

  // Favorites dummy logic (ideally saved in store/local storage)
  const favorites = BUILT_IN_TEMPLATES.filter(t => ["aadhaar-pvc", "pan-card", "passport-photo", "driving-licence"].includes(t.id));

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            {t("nav.dashboard", language)}
          </h1>
          <p className="mt-1 text-slate-600">CyberCafe Document & Print Production Suite</p>
        </div>

        {/* 1. TODAY SUMMARY */}
        <section className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
            </CardContent>
          </Card>
        </section>

        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8 space-y-10">
            {/* 2. QUICK ACTIONS */}
            <section>
              <h2 className="mb-4 text-sm font-semibold text-slate-500 uppercase tracking-wider">
                Quick Actions
              </h2>
              <div className="grid gap-3 grid-cols-2 sm:grid-cols-4 lg:grid-cols-5">
                {quickActions.map(({ id, icon: Icon, href, color, label }) => (
                  <Link key={id} href={href}>
                    <Card className={`cursor-pointer border transition-all hover:shadow-md hover:-translate-y-0.5 ${color} h-full`}>
                      <CardContent className="flex flex-col items-center gap-2 p-3 text-center">
                        <div className="rounded-full bg-white/80 p-2.5">
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="text-xs font-semibold leading-tight">
                          {label}
                        </span>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>

            {/* 3. IMPORT */}
            <section>
              <h2 className="mb-4 text-sm font-semibold text-slate-500 uppercase tracking-wider">
                Import
              </h2>
              <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
                {importActions.map((action) => (
                  <Link key={action.id} href={action.href} className={("comingSoon" in action && action.comingSoon) ? "pointer-events-none opacity-60" : ""}>
                    <Card className="cursor-pointer border transition-all hover:border-slate-300 hover:bg-slate-50">
                      <CardContent className="flex items-center gap-3 p-3">
                        <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
                          <action.icon className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-slate-800">{action.label}</span>
                          {("comingSoon" in action && action.comingSoon) && <span className="text-[9px] font-bold text-orange-500 uppercase tracking-wider">Coming Soon</span>}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          </div>

          <div className="lg:col-span-4 space-y-10">
            {/* 4. FAVORITE PRESETS */}
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-500 uppercase tracking-wider">
                  <Star className="h-4 w-4" /> Favorite Presets
                </h2>
                <Link href="/templates" className="text-xs font-medium text-blue-600 hover:underline">
                  Manage
                </Link>
              </div>
              <div className="space-y-2">
                {favorites.map((preset) => (
                  <Link key={preset.id} href={`/editor?template=${preset.id}`}>
                    <Card className="hover:border-slate-300 hover:bg-slate-50 transition-colors">
                      <CardContent className="flex items-center gap-3 p-3">
                        <div className="rounded bg-yellow-50 p-2 border border-yellow-200">
                          <Star className="h-4 w-4 text-yellow-600 fill-yellow-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-slate-900">{preset.name}</p>
                          <p className="text-xs text-slate-500">
                            {preset.width}×{preset.height} {preset.unit}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>

            {/* 5. RECENT JOBS */}
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                  Recent Jobs
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
                        <div className="flex items-center gap-2">
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
                          <div className="flex -mr-1">
                            <Link href={`/editor?template=${job.templateId}`}>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-blue-600" title="Duplicate Job">
                                <FileUp className="h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
