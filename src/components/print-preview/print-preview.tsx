"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Printer, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PrintCanvas } from "@/components/layout-editor/print-canvas";
import { useEditorStore, getProcessedUrl } from "@/store";
import { useSettingsStore } from "@/store";
import { t } from "@/lib/i18n";
import { applyOrientation } from "@/lib/templates/paper-sizes";
import { formatDimensions, toMillimeters } from "@/lib/utils/units";
import { TemplateSummary } from "@/components/template-selector/template-selector";

export function PrintPreview() {
  const language = useSettingsStore((s) => s.settings.language);
  const printInstructions = useSettingsStore((s) => s.settings.printInstructions);
  const paper = useEditorStore((s) => s.paper);
  const template = useEditorStore((s) => s.template);
  const layout = useEditorStore((s) => s.layout);
  const layoutItems = useEditorStore((s) => s.layoutItems);
  const processedImages = useEditorStore((s) => s.processedImages);
  const selectedImageId = useEditorStore((s) => s.selectedImageId);

  const [scale, setScale] = useState(0.5);
  const hasProcessed = Object.keys(processedImages).length > 0;

  useEffect(() => {
    if (layoutItems.length === 0 && hasProcessed) {
      useEditorStore.getState().computeLayout();
    }
  }, [layoutItems.length, hasProcessed]);

  const oriented = applyOrientation(paper);

  const handlePrint = () => {
    window.print();
  };

  if (!hasProcessed || !template || layoutItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <p className="text-slate-600">Complete crop and layout in the editor first.</p>
        <Link href="/editor">
          <Button>Go to Editor</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="print:hidden space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/editor">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4" />
                {t("print.backToEditor", language)}
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">{t("print.title", language)}</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={() => setScale((s) => Math.max(0.2, s - 0.1))}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => setScale(0.5)}>
              <Maximize2 className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => setScale((s) => Math.min(1.2, s + 0.1))}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button size="lg" onClick={handlePrint}>
              <Printer className="h-4 w-4" />
              {t("editor.print", language)}
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <PrintCanvas scale={scale} className="rounded-xl border border-slate-200 bg-slate-100 p-6" />
          </div>
          <div className="space-y-4">
            <TemplateSummary />
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
              <h3 className="mb-3 font-semibold">Print Details</h3>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-slate-500">Paper</dt>
                  <dd>{oriented.name}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Orientation</dt>
                  <dd className="capitalize">{paper.orientation}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Copies</dt>
                  <dd>{layoutItems.length}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Photo Size</dt>
                  <dd>{formatDimensions(template.width, template.height, template.unit)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Grid</dt>
                  <dd>{layout ? `${layout.columns} × ${layout.rows}` : "Custom"}</dd>
                </div>
              </dl>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <h3 className="mb-2 font-semibold">{t("print.instructions", language)}</h3>
              <p>{printInstructions}</p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-xs">
                <li>Scale: 100%</li>
                <li>Margins: None</li>
                <li>Headers & Footers: Off</li>
                <li>Paper: {oriented.name}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden print:block">
        <PrintSheet />
      </div>
    </>
  );
}

function PrintSheet() {
  const paper = useEditorStore((s) => s.paper);
  const layoutItems = useEditorStore((s) => s.layoutItems);
  const processedImages = useEditorStore((s) => s.processedImages);
  const selectedImageId = useEditorStore((s) => s.selectedImageId);

  const oriented = applyOrientation(paper);
  const paperWidthMm = toMillimeters(oriented.width, oriented.unit);
  const paperHeightMm = toMillimeters(oriented.height, oriented.unit);

  return (
    <div
      className="print-sheet"
      style={{
        width: `${paperWidthMm}mm`,
        height: `${paperHeightMm}mm`,
        position: "relative",
        background: "white",
      }}
    >
      {layoutItems.map((item) => {
        const imgUrl = getProcessedUrl(processedImages, item.imageId, selectedImageId);
        if (!imgUrl) return null;
        return (
        <div
          key={item.id}
          style={{
            position: "absolute",
            left: `${item.x}mm`,
            top: `${item.y}mm`,
            width: `${item.width}mm`,
            height: `${item.height}mm`,
            overflow: "hidden",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imgUrl}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
        );
      })}
    </div>
  );
}
