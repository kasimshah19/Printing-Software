"use client";

import { BUILT_IN_TEMPLATES } from "@/lib/templates/built-in";
import { useEditorStore } from "@/store";
import { cn } from "@/lib/utils/cn";
import { formatDimensions } from "@/lib/utils/units";
import type { Template, DocumentCategory } from "@/lib/types";
import { ShieldCheck, AlertCircle, Info } from "lucide-react";

export const categoryLabels: Record<string, string> = {
  photo: "Photos",
  "id-card": "ID Cards",
  layout: "Print Layouts",
  government_identity: "Government IDs",
  government_document: "Government Documents",
  financial: "Financial",
  education: "Education",
  employment: "Employment",
  healthcare: "Healthcare",
  transport: "Transport",
  postal: "Postal",
  membership: "Membership",
  photo_sheet: "Photo Sheets",
  custom: "Custom",
};

interface TemplateSelectorProps {
  userTemplates?: Template[];
}

export function TemplateSelector({ userTemplates = [] }: TemplateSelectorProps) {
  const template = useEditorStore((s) => s.template);
  const setTemplate = useEditorStore((s) => s.setTemplate);
  const allTemplates = [...BUILT_IN_TEMPLATES, ...userTemplates];

  // Group templates by category
  const grouped = allTemplates.reduce((acc, t) => {
    const cat = t.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(t);
    return acc;
  }, {} as Record<string, Template[]>);

  // We want to order categories roughly how they appear in the spec
  const orderedCategories = [
    "government_identity",
    "government_document",
    "photo",
    "layout",
    "financial",
    "education",
    "transport",
    "postal",
    "healthcare",
    "id-card",
    "custom",
  ];

  const presentCategories = Object.keys(grouped).sort((a, b) => {
    let idxA = orderedCategories.indexOf(a);
    let idxB = orderedCategories.indexOf(b);
    if (idxA === -1) idxA = 999;
    if (idxB === -1) idxB = 999;
    return idxA - idxB;
  });

  const getStatusBadge = (t: Template) => {
    if (!t.sizeSource) return null;
    if (t.sizeSource === "OFFICIAL") {
      return (
        <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded ml-2">
          <ShieldCheck className="h-3 w-3" /> OFFICIAL
        </span>
      );
    }
    if (t.sizeSource === "ISO_STANDARD") {
      return (
        <span className="flex items-center gap-1 text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded ml-2">
          <ShieldCheck className="h-3 w-3" /> ISO
        </span>
      );
    }
    if (t.sizeSource === "VERIFY_BEFORE_USE") {
      return (
        <span className="flex items-center gap-1 text-[10px] font-semibold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded ml-2">
          <AlertCircle className="h-3 w-3" /> VERIFY
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded ml-2">
        <Info className="h-3 w-3" /> {t.sizeSource.replace(/_/g, " ")}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {presentCategories.map((cat) => {
        const items = grouped[cat];
        return (
          <div key={cat}>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              {categoryLabels[cat] || cat}
            </h4>
            <div className="grid gap-2">
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTemplate(item)}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                    template?.id === item.id
                      ? "border-blue-500 bg-blue-50 text-blue-900"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{item.name}</span>
                    {getStatusBadge(item)}
                  </div>
                  <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                    <span>{formatDimensions(item.width, item.height, item.unit)}</span>
                    {item.sides === "front-back" && (
                      <span className="font-medium text-slate-400">Front + Back</span>
                    )}
                  </div>
                  {item.verificationStatus === "configurable" && (
                    <p className="mt-1 text-[10px] text-slate-400 italic">
                      Verify dimensions before printing.
                    </p>
                  )}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function TemplateSummary() {
  const template = useEditorStore((s) => s.template);
  const layout = useEditorStore((s) => s.layout);
  const layoutItems = useEditorStore((s) => s.layoutItems);
  const layoutMode = useEditorStore((s) => s.layoutMode);

  if (!template) return null;

  return (
    <div className="rounded-lg bg-slate-50 p-3 text-sm">
      <div className="flex items-center gap-2 mb-1">
        <p className="font-medium">{template.name}</p>
        {template.sizeSource === "OFFICIAL" && <ShieldCheck className="h-4 w-4 text-emerald-600" />}
      </div>
      <p className="text-slate-600">
        Size: {formatDimensions(template.width, template.height, template.unit)}
      </p>
      {layoutItems.length > 0 && (
        <p className="text-slate-600">
          Layout: {layoutItems.length} copies
          {layoutMode === "auto" && layout
            ? ` (${layout.columns}×${layout.rows})`
            : " (manual)"}
        </p>
      )}
    </div>
  );
}
