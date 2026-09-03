"use client";

import { Suspense, useEffect, useCallback, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import {
  Save,
  Eye,
  Printer,
  Upload,
  Crop,
  LayoutGrid,
  Undo2,
  Redo2,
  Keyboard,
} from "lucide-react";
import { AppHeader } from "@/components/common/app-header";
import { ImageUploader } from "@/components/image-uploader/image-uploader";
import { CropEditor } from "@/components/crop-editor/crop-editor";
import { TemplateSelector, TemplateSummary } from "@/components/template-selector/template-selector";
import { PaperSelector } from "@/components/paper-selector/paper-selector";
import { ManualLayoutEditor } from "@/components/layout-editor/manual-layout-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEditorStore, useProjectStore, useSettingsStore } from "@/store";
import { useEditorShortcuts, SHORTCUT_HINTS } from "@/hooks/use-editor-shortcuts";
import { t } from "@/lib/i18n";
import { resolveTemplate } from "@/lib/templates/resolve";
import { loadUserTemplates } from "@/lib/storage";
import type { Template } from "@/lib/types";

type EditorTab = "upload" | "crop" | "layout";

function EditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const language = useSettingsStore((s) => s.settings.language);
  const loadSettings = useSettingsStore((s) => s.loadFromStorage);
  const initFromTemplateId = useEditorStore((s) => s.initFromTemplateId);
  const setTemplate = useEditorStore((s) => s.setTemplate);
  const template = useEditorStore((s) => s.template);
  const layoutItems = useEditorStore((s) => s.layoutItems);
  const processedImages = useEditorStore((s) => s.processedImages);
  const loadProjectById = useEditorStore((s) => s.loadProjectById);
  const hasProcessed = Object.keys(processedImages).length > 0;
  const projectName = useEditorStore((s) => s.projectName);
  const customerName = useEditorStore((s) => s.customerName);
  const setProjectInfo = useEditorStore((s) => s.setProjectInfo);
  const saveCurrent = useProjectStore((s) => s.saveCurrent);
  const images = useEditorStore((s) => s.images);
  const canUndo = useEditorStore((s) => s.canUndo);
  const canRedo = useEditorStore((s) => s.canRedo);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);

  const [userTemplates, setUserTemplates] = useState<Template[]>([]);
  const [activeTab, setActiveTab] = useState<EditorTab>("upload");
  const [showShortcuts, setShowShortcuts] = useState(false);

  useEffect(() => {
    if (hasProcessed && layoutItems.length > 0) setActiveTab("layout");
    else if (images.length > 0 && activeTab === "upload") setActiveTab("crop");
  }, [hasProcessed, layoutItems.length, images.length, activeTab]);

  useEffect(() => {
    loadSettings();
    loadUserTemplates().then((user) => {
      setUserTemplates(user);
      const templateId = searchParams.get("template");
      const projectId = searchParams.get("project");

      if (projectId) {
        loadProjectById(projectId).then((ok) => {
          if (ok) setActiveTab("layout");
        });
        return;
      }

      if (templateId) {
        const tmpl = resolveTemplate(templateId, user);
        if (tmpl) setTemplate(tmpl);
      } else if (!useEditorStore.getState().template) {
        initFromTemplateId("passport-photo");
      }
    });
  }, [searchParams, loadSettings, initFromTemplateId, setTemplate, loadProjectById]);

  const handleSave = useCallback(async () => {
    const id = await saveCurrent();
    if (id) alert("Project saved!");
  }, [saveCurrent]);

  const triggerUpload = useCallback(() => {
    uploadInputRef.current?.click();
  }, []);

  useEditorShortcuts({
    onUpload: triggerUpload,
    onSave: handleSave,
    onPrint: () => {
      if (hasProcessed && layoutItems.length > 0) router.push("/print");
    },
    onTabChange: setActiveTab,
  });

  const canPrint = Boolean(hasProcessed && layoutItems.length > 0);

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />

      {/* Hidden file input for Ctrl+O shortcut when not on upload tab */}
      <input
        ref={uploadInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = e.target.files;
          if (!files?.length) return;
          const process = async () => {
            const { validateImageFile } = await import("@/lib/image-processing");
            const { convertPdfToImages } = await import("@/lib/utils/pdf");
            const { v4: uuidv4 } = await import("uuid");
            const addImage = useEditorStore.getState().addImage;
            const language = useSettingsStore.getState().settings.language;
            
            for (let file of Array.from(files)) {
              let filesToProcess: File[] = [file];
              if (file.type === "application/pdf") {
                try {
                  filesToProcess = await convertPdfToImages(file);
                } catch (err) {
                  alert(t("error.generic", language));
                  continue;
                }
              }

              for (const f of filesToProcess) {
                const error = validateImageFile(f);
                if (error === "unsupported") {
                  alert(t("error.unsupportedImage", language));
                  continue;
                }
                if (error === "tooLarge") {
                  alert(t("error.tooLarge", language));
                  continue;
                }
                const url = URL.createObjectURL(f);
                const img = new Image();
                await new Promise<void>((resolve, reject) => {
                  img.onload = () => resolve();
                  img.onerror = () => reject();
                  img.src = url;
                });
                addImage({
                  id: uuidv4(),
                  filename: f.name,
                  width: img.naturalWidth,
                  height: img.naturalHeight,
                  fileSize: f.size,
                  mimeType: f.type,
                  createdAt: new Date().toISOString(),
                  objectUrl: url,
                });
              }
            }
            setActiveTab("crop");
          };
          process().finally(() => {
            e.target.value = "";
          });
        }}
      />

      <div className="border-b border-slate-200 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <Input
              className="w-40"
              value={projectName}
              onChange={(e) => setProjectInfo(e.target.value, customerName)}
              placeholder="Project name"
            />
            <Input
              className="w-40"
              value={customerName}
              onChange={(e) => setProjectInfo(projectName, e.target.value)}
              placeholder="Customer name"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="icon" disabled={!canUndo} onClick={undo} title="Undo (Ctrl+Z)">
              <Undo2 className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" disabled={!canRedo} onClick={redo} title="Redo (Ctrl+Shift+Z)">
              <Redo2 className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowShortcuts((s) => !s)}
              title="Keyboard shortcuts"
            >
              <Keyboard className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={handleSave}>
              <Save className="h-4 w-4" />
              {t("editor.save", language)}
            </Button>
            <Link href="/print">
              <Button variant="outline" disabled={!canPrint}>
                <Eye className="h-4 w-4" />
                {t("editor.preview", language)}
              </Button>
            </Link>
            <Link href="/print">
              <Button disabled={!canPrint}>
                <Printer className="h-4 w-4" />
                {t("editor.print", language)}
              </Button>
            </Link>
          </div>
        </div>

        {showShortcuts && (
          <div className="mx-auto mt-3 max-w-7xl rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="mb-2 text-xs font-semibold uppercase text-slate-500">Keyboard Shortcuts</p>
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
              {SHORTCUT_HINTS.map(({ keys, action }) => (
                <span key={keys} className="text-slate-600">
                  <kbd className="rounded bg-white px-1.5 py-0.5 font-mono text-xs shadow-sm">{keys}</kbd>
                  {" "}{action}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mx-auto grid max-w-7xl gap-4 p-4 lg:grid-cols-12">
        <aside className="space-y-4 lg:col-span-2">
          <nav className="space-y-1 rounded-xl border border-slate-200 bg-white p-2">
            {(
              [
                { id: "upload" as const, icon: Upload, label: t("editor.upload", language) },
                { id: "crop" as const, icon: Crop, label: t("editor.crop", language) },
                { id: "layout" as const, icon: LayoutGrid, label: t("editor.layout", language) },
              ] as const
            ).map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                  activeTab === id
                    ? "bg-blue-50 font-medium text-blue-700"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </nav>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="mb-3 text-sm font-semibold">{t("editor.templates", language)}</h3>
            <TemplateSelector userTemplates={userTemplates} />
          </div>
        </aside>

        <main className="lg:col-span-7">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            {activeTab === "upload" && (
              <ImageUploader
                inputRef={uploadInputRef}
                onFilesAdded={() => setActiveTab("crop")}
              />
            )}
            {activeTab === "crop" && <CropEditor onApplied={() => setActiveTab("layout")} />}
            {activeTab === "layout" && (
              <div className="space-y-4">
                <TemplateSummary />
                {layoutItems.length > 0 ? (
                  <ManualLayoutEditor scale={0.45} />
                ) : hasProcessed ? (
                  <div className="space-y-4 py-8 text-center">
                    <p className="text-slate-600">Images cropped. Generate a print layout to continue.</p>
                    <Button
                      size="lg"
                      onClick={() => useEditorStore.getState().computeLayout()}
                    >
                      Generate Layout
                    </Button>
                  </div>
                ) : (
                  <p className="py-12 text-center text-slate-500">
                    Apply crop first to generate layout, or switch to Crop tab.
                  </p>
                )}
                {canPrint && (
                  <Link href="/print">
                    <Button className="w-full" size="lg">
                      <Eye className="h-4 w-4" />
                      Open Print Preview
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </div>
        </main>

        <aside className="space-y-4 lg:col-span-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="mb-3 text-sm font-semibold">Paper & Layout</h3>
            <PaperSelector />
          </div>
          <TemplateSummary />
        </aside>
      </div>
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading editor...</div>}>
      <EditorContent />
    </Suspense>
  );
}
