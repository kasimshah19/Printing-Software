"use client";

import { useEffect, useState, useCallback } from "react";
import { AppHeader } from "@/components/common/app-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSettingsStore } from "@/store";
import {
  loadAllJobs,
  loadAllInvoices,
} from "@/lib/storage";
import type { PrintJob, Invoice } from "@/lib/types";
import { BarChart3, TrendingUp, Printer, FileText, IndianRupee, Calendar } from "lucide-react";

type DateRange = "today" | "week" | "month" | "all";

function getDateFilter(range: DateRange): (dateStr: string) => boolean {
  const now = new Date();
  switch (range) {
    case "today":
      return (d) => new Date(d).toDateString() === now.toDateString();
    case "week": {
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return (d) => new Date(d) >= weekAgo;
    }
    case "month": {
      const monthAgo = new Date(now);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return (d) => new Date(d) >= monthAgo;
    }
    default:
      return () => true;
  }
}

export default function ReportsPage() {
  const language = useSettingsStore((s) => s.settings.language);
  const [range, setRange] = useState<DateRange>("today");
  const [jobs, setJobs] = useState<PrintJob[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const load = useCallback(async () => {
    const filter = getDateFilter(range);
    const allJobs = await loadAllJobs();
    const allInvoices = await loadAllInvoices();
    setJobs(allJobs.filter((j) => filter(j.createdAt)));
    setInvoices(allInvoices.filter((inv) => filter(inv.createdAt)));
  }, [range]);

  useEffect(() => {
    load();
  }, [load]);

  const totalRevenue = invoices.reduce((s, inv) => s + inv.total, 0);
  const paidRevenue = invoices.filter((i) => i.paid).reduce((s, inv) => s + inv.total, 0);
  const unpaidRevenue = totalRevenue - paidRevenue;
  const totalJobs = jobs.length;
  const completedJobs = jobs.filter((j) => j.status === "completed" || j.status === "printed").length;
  const pendingJobs = jobs.filter((j) => j.status === "pending" || j.status === "processing").length;
  const totalCopies = jobs.reduce((s, j) => s + j.copies, 0);

  // service breakdown
  const serviceMap = new Map<string, { count: number; copies: number; revenue: number }>();
  jobs.forEach((j) => {
    const existing = serviceMap.get(j.serviceName) ?? { count: 0, copies: 0, revenue: 0 };
    existing.count++;
    existing.copies += j.copies;
    existing.revenue += j.price ?? 0;
    serviceMap.set(j.serviceName, existing);
  });
  const serviceBreakdown = Array.from(serviceMap.entries()).sort((a, b) => b[1].count - a[1].count);

  const handleExportCSV = () => {
    let csv = "Date,Job#,Customer,Service,Copies,Status,Price\n";
    jobs.forEach((j) => {
      csv += `${j.createdAt},${j.jobNumber},${j.customerName},${j.serviceName},${j.copies},${j.status},${j.price ?? 0}\n`;
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report-${range}-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="h-7 w-7 text-blue-600" />
            Reports
          </h1>
          <div className="flex gap-2">
            {(["today", "week", "month", "all"] as DateRange[]).map((r) => (
              <Button
                key={r}
                variant={range === r ? "default" : "outline"}
                size="sm"
                onClick={() => setRange(r)}
                className="capitalize"
              >
                {r}
              </Button>
            ))}
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              Export CSV
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Total Revenue</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">₹{totalRevenue.toFixed(0)}</p>
                </div>
                <div className="rounded-full bg-green-50 p-3"><IndianRupee className="h-5 w-5 text-green-600" /></div>
              </div>
              <div className="mt-2 flex gap-3 text-xs">
                <span className="text-green-600">₹{paidRevenue.toFixed(0)} paid</span>
                {unpaidRevenue > 0 && <span className="text-red-500">₹{unpaidRevenue.toFixed(0)} unpaid</span>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Total Jobs</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">{totalJobs}</p>
                </div>
                <div className="rounded-full bg-blue-50 p-3"><FileText className="h-5 w-5 text-blue-600" /></div>
              </div>
              <div className="mt-2 flex gap-3 text-xs">
                <span className="text-green-600">{completedJobs} completed</span>
                <span className="text-orange-500">{pendingJobs} pending</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Print Volume</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">{totalCopies}</p>
                </div>
                <div className="rounded-full bg-violet-50 p-3"><Printer className="h-5 w-5 text-violet-600" /></div>
              </div>
              <p className="mt-2 text-xs text-slate-500">total copies printed</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Invoices</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">{invoices.length}</p>
                </div>
                <div className="rounded-full bg-orange-50 p-3"><TrendingUp className="h-5 w-5 text-orange-600" /></div>
              </div>
              <p className="mt-2 text-xs text-slate-500">generated this period</p>
            </CardContent>
          </Card>
        </div>

        {/* Service Breakdown Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5" />
              Service Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            {serviceBreakdown.length === 0 ? (
              <p className="py-6 text-center text-slate-500">No data for the selected period.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-slate-500">
                      <th className="pb-2 font-medium">Service</th>
                      <th className="pb-2 font-medium text-right">Jobs</th>
                      <th className="pb-2 font-medium text-right">Copies</th>
                      <th className="pb-2 font-medium text-right">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {serviceBreakdown.map(([service, data]) => (
                      <tr key={service} className="border-b border-slate-100 last:border-0">
                        <td className="py-2.5 font-medium">{service}</td>
                        <td className="py-2.5 text-right">{data.count}</td>
                        <td className="py-2.5 text-right">{data.copies}</td>
                        <td className="py-2.5 text-right">₹{data.revenue.toFixed(0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
