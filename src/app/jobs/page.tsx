"use client";

import { useEffect, useState } from "react";
import { AppHeader } from "@/components/common/app-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { t } from "@/lib/i18n";
import { useSettingsStore } from "@/store";
import { loadAllJobs, saveJob, deleteJob } from "@/lib/storage";
import type { PrintJob, JobStatus } from "@/lib/types";

export default function JobsPage() {
  const language = useSettingsStore((s) => s.settings.language);
  const [jobs, setJobs] = useState<PrintJob[]>([]);
  const [statusFilter, setStatusFilter] = useState<JobStatus | "all">("all");

  const refresh = async () => {
    let all = await loadAllJobs();
    if (statusFilter !== "all") {
      all = all.filter((j) => j.status === statusFilter);
    }
    setJobs(all);
  };

  useEffect(() => {
    refresh();
  }, [statusFilter]);

  const updateStatus = async (job: PrintJob, status: JobStatus) => {
    await saveJob({ ...job, status, updatedAt: new Date().toISOString() });
    refresh();
  };

  const removeJob = async (id: string) => {
    if (confirm("Delete this job?")) {
      await deleteJob(id);
      refresh();
    }
  };

  const getStatusColor = (status: JobStatus) => {
    switch (status) {
      case "pending": return "text-orange-600 bg-orange-50";
      case "processing": return "text-blue-600 bg-blue-50";
      case "printed": return "text-indigo-600 bg-indigo-50";
      case "completed": return "text-green-600 bg-green-50";
      case "cancelled": return "text-red-600 bg-red-50";
      default: return "text-slate-600 bg-slate-50";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">{t("nav.jobs", language)}</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{t("jobs.filterByStatus", language)}:</span>
            <Select
              className="w-40"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <option value="all">{t("jobs.all", language)}</option>
              <option value="pending">{t("jobs.pending", language)}</option>
              <option value="processing">{t("jobs.processing", language)}</option>
              <option value="printed">{t("jobs.printed", language)}</option>
              <option value="completed">{t("jobs.completed", language)}</option>
            </Select>
          </div>
        </div>

        {jobs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-slate-500">
              {t("jobs.noJobs", language)}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {jobs.map((job) => (
              <Card key={job.id}>
                <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">#{job.jobNumber}</h3>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(
                          job.status
                        )}`}
                      >
                        {t(`jobs.${job.status}` as any, language)}
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-slate-600">
                      <p>
                        <span className="font-medium">{t("jobs.customer", language)}:</span>{" "}
                        {job.customerName || "N/A"}
                      </p>
                      <p>
                        <span className="font-medium">{t("jobs.service", language)}:</span>{" "}
                        {job.serviceName}
                      </p>
                      <p>
                        <span className="font-medium">{t("jobs.copies", language)}:</span>{" "}
                        {job.copies}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {job.status !== "printed" && job.status !== "completed" && job.status !== "cancelled" && (
                      <Button size="sm" variant="outline" onClick={() => updateStatus(job, "printed")}>
                        {t("jobs.markPrinted", language)}
                      </Button>
                    )}
                    {(job.status === "printed") && (
                      <Button size="sm" onClick={() => updateStatus(job, "completed")}>
                        {t("jobs.markCompleted", language)}
                      </Button>
                    )}
                    {job.status !== "cancelled" && job.status !== "completed" && (
                      <Button size="sm" variant="ghost" onClick={() => updateStatus(job, "cancelled")}>
                        Cancel
                      </Button>
                    )}
                    <Button size="sm" variant="destructive" onClick={() => removeJob(job.id)}>
                      {t("jobs.delete", language)}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
