"use client";

import { useEffect, useState } from "react";
import { AppHeader } from "@/components/common/app-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { PAPER_SIZES } from "@/lib/templates/paper-sizes";
import { clearAllData } from "@/lib/storage";
import { t } from "@/lib/i18n";
import { useSettingsStore } from "@/store";
import type { Language } from "@/lib/i18n";

export default function SettingsPage() {
  const settings = useSettingsStore((s) => s.settings);
  const setSettings = useSettingsStore((s) => s.setSettings);
  const loadFromStorage = useSettingsStore((s) => s.loadFromStorage);
  const saveToStorage = useSettingsStore((s) => s.saveToStorage);
  const [saved, setSaved] = useState(false);

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

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold">{t("nav.settings", settings.language)}</h1>

        <div className="space-y-6">
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

          <Card>
            <CardHeader>
              <CardTitle>{t("settings.data", settings.language)}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-slate-600">
                All photos and projects are stored locally in your browser. Nothing is uploaded to a server.
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
