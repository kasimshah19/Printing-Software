"use client";

import { AppHeader } from "@/components/common/app-header";
import { PrintPreview } from "@/components/print-preview/print-preview";

export default function PrintPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="print:hidden">
        <AppHeader />
      </div>
      <main className="mx-auto max-w-7xl px-4 py-8 print:p-0">
        <PrintPreview />
      </main>
    </div>
  );
}
