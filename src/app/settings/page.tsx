"use client";

import { useEffect, useState } from "react";
import { AppHeader } from "@/components/common/app-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { PAPER_SIZES } from "@/lib/templates/paper-sizes";
import { clearAllData, exportBackup, importBackup, cleanupOldData } from "@/lib/storage";
import { t } from "@/lib/i18n";
import { useSettingsStore } from "@/store";
import type { Language } from "@/lib/i18n";
import { Download, Upload, Trash2, Shield } from "lucide-react";

export default function SettingsPage() {
  const settings = useSettingsStore((s) => s.settings);
  const setSettings = useSettingsStore((s) => s.setSettings);
  const loadFromStorage = useSettingsStore((s) => s.loadFromStorage);
  const saveToStorage = useSettingsStore((s) => s.saveToStorage);
  const [saved, setSaved] = useState(false);
  const [cleanedCount, setCleanedCount] = useState<number | null>(null);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  const handleSave = async () => {
    await saveToStorage();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClearData = async () => {
    if (confirm("Clear all projects, templates, and cached images? This cannot be undone.")) {
      await clearAllData();
      alert("All local data cleared.");
    }
  };

  const handleExportBackup = async () => {
    try {
      const data = await exportBackup(true);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cybercafe-backup-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Export failed.");
    }
  };

  const handleImportBackup = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        if (!data.version) throw new Error("Invalid backup file");
        await importBackup(data);
        alert("Backup imported successfully. Refresh the page to see changes.");
      } catch {
        alert("Invalid backup file.");
      }
    };
    input.click();
  };

  const handleCleanup = async () => {
    const count = await cleanupOldData(settings.dataRetentionDays);
    setCleanedCount(count);
    setTimeout(() => setCleanedCount(null), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold">{t("nav.settings", settings.language)}</h1>

        <div className="space-y-6">
          {/* Business Info */}
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Business Name</Label>
                <Input
                  value={settings.businessName}
                  onChange={(e) => setSettings({ businessName: e.target.value })}
                  placeholder="CyberCafe Print Studio"
                />
              </div>
              <div>
                <Label>Address</Label>
                <Input
                  value={settings.businessAddress}
                  onChange={(e) => setSettings({ businessAddress: e.target.value })}
                  placeholder="Shop address for receipts"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={settings.businessPhone}
                    onChange={(e) => setSettings({ businessPhone: e.target.value })}
                    placeholder="+91 9876543210"
                  />
                </div>
                <div>
                  <Label>Tax Rate (%)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={50}
                    value={settings.taxRate}
                    onChange={(e) => setSettings({ taxRate: Number(e.target.value) })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Printing */}
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.printing", settings.language)}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Default Paper Size</Label>
                <Select
                  value={settings.defaultPaperId}
                  onChange={(e) => setSettings({ defaultPaperId: e.target.value })}
                >
                  {PAPER_SIZES.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Default DPI</Label>
                <Input
                  type="number"
                  min={72}
                  max={600}
                  value={settings.defaultDpi}
                  onChange={(e) => setSettings({ defaultDpi: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>Print Instructions</Label>
                <textarea
                  className="w-full rounded-lg border border-slate-300 p-3 text-sm"
                  rows={3}
                  value={settings.printInstructions}
                  onChange={(e) => setSettings({ printInstructions: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Application */}
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.application", settings.language)}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Language</Label>
                <Select
                  value={settings.language}
                  onChange={(e) => setSettings({ language: e.target.value as Language })}
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="mr">Marathi</option>
                </Select>
              </div>
              <div>
                <Label>Theme</Label>
                <Select
                  value={settings.theme}
                  onChange={(e) =>
                    setSettings({ theme: e.target.value as "light" | "dark" | "system" })
                  }
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System</option>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="autosave"
                  checked={settings.autosave}
                  onChange={(e) => setSettings({ autosave: e.target.checked })}
                />
                <Label htmlFor="autosave">Autosave projects</Label>
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Retention */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Privacy & Data Retention
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-600">
                All data (photos, projects, customer info) is stored locally in your browser. Nothing is uploaded to any server.
              </p>
              <div>
                <Label>Auto-delete completed jobs older than (days)</Label>
                <Input
                  type="number"
                  min={1}
                  max={365}
                  value={settings.dataRetentionDays}
                  onChange={(e) => setSettings({ dataRetentionDays: Number(e.target.value) })}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleCleanup}>
                  Run Cleanup Now
                </Button>
                {cleanedCount !== null && (
                  <span className="self-center text-sm text-green-600">
                    {cleanedCount} old records cleaned.
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Backup & Restore */}
          <Card>
            <CardHeader>
              <CardTitle>Backup & Restore</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-600">
                Export all templates, settings, customers, jobs, and invoices as a JSON backup file. Import to restore on any device.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={handleExportBackup} className="gap-2">
                  <Download className="h-4 w-4" />
                  Export Backup
                </Button>
                <Button variant="outline" onClick={handleImportBackup} className="gap-2">
                  <Upload className="h-4 w-4" />
                  Import Backup
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600 flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-slate-600">
                Permanently delete all local data including projects, templates, images, jobs, and customers.
              </p>
              <Button variant="destructive" onClick={handleClearData}>
                {t("settings.clearData", settings.language)}
              </Button>
            </CardContent>
          </Card>

          <Button onClick={handleSave} size="lg" className="w-full">
            Save Settings
          </Button>
          {saved && (
            <p className="text-center text-sm text-green-600">
              {t("settings.saved", settings.language)}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
