"use client";

import { useState } from "react";
import { AppHeader } from "@/components/common/app-header";
import { Smartphone, ScanLine, FolderDown, Cloud } from "lucide-react";
import { ConnectivityCard } from "./connectivity-card";

export default function ConnectivityCenterPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Connectivity Center</h1>
          <p className="mt-1 text-slate-600">Manage device integrations and external inputs</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          <ConnectivityCard
            title="Phone QR"
            icon={<Smartphone className="h-5 w-5 text-blue-600" />}
            status="available"
            statusLabel="Ready"
            description="Receive photos from phone via local QR scan."
            actionLabel="Generate QR"
            onAction={() => alert("QR Generator opening...")}
          />
          
          <ConnectivityCard
            title="Scanner"
            icon={<ScanLine className="h-5 w-5 text-indigo-600" />}
            status="unsupported"
            statusLabel="Native integration required"
            description="Scan documents directly. Requires desktop bridge for TWAIN access."
            actionLabel="Setup"
            onAction={() => alert("Scanner Setup")}
          />
          
          <ConnectivityCard
            title="Hot Folder"
            icon={<FolderDown className="h-5 w-5 text-orange-600" />}
            status="available"
            statusLabel="Ready to Monitor"
            description="Automatically ingest files dropped into a designated folder."
            actionLabel="Manage"
            onAction={() => alert("Hot Folder config opening...")}
          />

          <ConnectivityCard
            title="Cloud Backup"
            icon={<Cloud className="h-5 w-5 text-slate-600" />}
            status="not-configured"
            statusLabel="Not Configured"
            description="Securely sync application data to cloud storage."
            actionLabel="Setup"
            onAction={() => alert("Cloud Setup")}
          />
        </div>
      </main>
    </div>
  );
}
