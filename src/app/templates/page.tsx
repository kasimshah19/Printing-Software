"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { v4 as uuidv4 } from "uuid";
import { Pencil } from "lucide-react";
import { AppHeader } from "@/components/common/app-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { BUILT_IN_TEMPLATES } from "@/lib/templates/built-in";
import { PAPER_SIZES } from "@/lib/templates/paper-sizes";
import {
  loadUserTemplates,
  saveUserTemplate,
  deleteUserTemplate,
} from "@/lib/storage";
import { t } from "@/lib/i18n";
import { useSettingsStore } from "@/store";
import type { Template, TemplateCategory, Unit } from "@/lib/types";
import { formatDimensions } from "@/lib/utils/units";

const emptyForm = {
  name: "",
  category: "photo" as TemplateCategory,
  width: 35,
  height: 45,
  unit: "mm" as Unit,
  paperId: "a4",
  hGap: 3,
  vGap: 3,
  copies: "auto" as number | "auto",
};

export default function TemplatesPage() {
  const language = useSettingsStore((s) => s.settings.language);
  const [userTemplates, setUserTemplates] = useState<Template[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const refresh = async () => {
    setUserTemplates(await loadUserTemplates());
  };

  useEffect(() => {
    refresh();
  }, []);

  const buildTemplate = (id: string, createdAt: string): Template => ({
    id,
    name: form.name,
    category: form.category,
    width: form.width,
    height: form.height,
    unit: form.unit,
    aspectRatio: form.width / form.height,
    cropSettings: { aspectRatio: form.width / form.height },
    paperSettings: { id: form.paperId, orientation: "portrait" },
    layoutSettings: {
      horizontalGap: form.hGap,
      verticalGap: form.vGap,
      copies: form.copies,
    },
    isBuiltIn: false,
    createdAt,
    updatedAt: new Date().toISOString(),
  });

  const handleSave = async () => {
    if (!form.name.trim()) return;
    const existing = editingId ? userTemplates.find((t) => t.id === editingId) : null;
    const template = buildTemplate(editingId ?? uuidv4(), existing?.createdAt ?? new Date().toISOString());
    await saveUserTemplate(template);
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    refresh();
  };

  const startEdit = (tmpl: Template) => {
    setEditingId(tmpl.id);
    setForm({
      name: tmpl.name,
      category: tmpl.category,
      width: tmpl.width,
      height: tmpl.height,
      unit: tmpl.unit,
      paperId: tmpl.paperSettings?.id ?? "a4",
      hGap: tmpl.layoutSettings.horizontalGap,
      vGap: tmpl.layoutSettings.verticalGap,
      copies: tmpl.layoutSettings.copies,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this template?")) {
      await deleteUserTemplate(id);
      refresh();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">{t("nav.templates", language)}</h1>
          <Button
            onClick={() => {
              setEditingId(null);
              setForm(emptyForm);
              setShowForm(!showForm);
            }}
          >
            {t("templates.create", language)}
          </Button>
        </div>

        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{editingId ? "Edit Template" : "New Template"}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <Label>Category</Label>
                <Select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value as TemplateCategory })}
                >
                  <option value="photo">Photo</option>
                  <option value="id-card">ID Card</option>
                  <option value="layout">Layout</option>
                </Select>
              </div>
              <div>
                <Label>Width</Label>
                <Input type="number" value={form.width} onChange={(e) => setForm({ ...form, width: Number(e.target.value) })} />
              </div>
              <div>
                <Label>Height</Label>
                <Input type="number" value={form.height} onChange={(e) => setForm({ ...form, height: Number(e.target.value) })} />
              </div>
              <div>
                <Label>Unit</Label>
                <Select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value as Unit })}>
                  <option value="mm">mm</option>
                  <option value="cm">cm</option>
                  <option value="in">inch</option>
                </Select>
              </div>
              <div>
                <Label>Default Paper</Label>
                <Select value={form.paperId} onChange={(e) => setForm({ ...form, paperId: e.target.value })}>
                  {PAPER_SIZES.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>H Gap (mm)</Label>
                <Input type="number" value={form.hGap} onChange={(e) => setForm({ ...form, hGap: Number(e.target.value) })} />
              </div>
              <div>
                <Label>V Gap (mm)</Label>
                <Input type="number" value={form.vGap} onChange={(e) => setForm({ ...form, vGap: Number(e.target.value) })} />
              </div>
              <div>
                <Label>Copies</Label>
                <Input
                  type="text"
                  value={form.copies}
                  onChange={(e) => {
                    const v = e.target.value;
                    setForm({ ...form, copies: v === "auto" ? "auto" : Number(v) || "auto" });
                  }}
                  placeholder="auto or number"
                />
              </div>
              <div className="flex items-end gap-2 sm:col-span-2">
                <Button onClick={handleSave} className="flex-1">
                  {editingId ? "Update Template" : "Save Template"}
                </Button>
                <Button variant="outline" onClick={() => { setShowForm(false); setEditingId(null); }}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <section className="mb-8">
          <h2 className="mb-3 font-semibold">{t("templates.builtIn", language)}</h2>
          <div className="grid gap-2">
            {BUILT_IN_TEMPLATES.map((tmpl) => (
              <Card key={tmpl.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium">{tmpl.name}</p>
                    <p className="text-sm text-slate-500">
                      {formatDimensions(tmpl.width, tmpl.height, tmpl.unit)} · {tmpl.category}
                    </p>
                  </div>
                  <Link href={`/editor?template=${tmpl.id}`}>
                    <Button variant="outline" size="sm">Use</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 font-semibold">{t("templates.user", language)}</h2>
          {userTemplates.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-slate-500">No custom templates yet</CardContent>
            </Card>
          ) : (
            <div className="grid gap-2">
              {userTemplates.map((tmpl) => (
                <Card key={tmpl.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-medium">{tmpl.name}</p>
                      <p className="text-sm text-slate-500">
                        {formatDimensions(tmpl.width, tmpl.height, tmpl.unit)} · gap {tmpl.layoutSettings.horizontalGap}mm
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/editor?template=${tmpl.id}`}>
                        <Button variant="outline" size="sm">Use</Button>
                      </Link>
                      <Button variant="outline" size="sm" onClick={() => startEdit(tmpl)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(tmpl.id)}>
                        Delete
                      </Button>
                    </div>
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
