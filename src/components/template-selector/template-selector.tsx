"use client";

import { BUILT_IN_TEMPLATES } from "@/lib/templates/built-in";
import { useEditorStore } from "@/store";
import { cn } from "@/lib/utils/cn";
import { formatDimensions } from "@/lib/utils/units";
import type { Template, TemplateCategory } from "@/lib/types";

const categoryLabels: Record<TemplateCategory, string> = {
  photo: "Photos",
  "id-card": "ID Cards",
  layout: "Print Layouts",
};

interface TemplateSelectorProps {
  userTemplates?: Template[];
}

export function TemplateSelector({ userTemplates = [] }: TemplateSelectorProps) {
  const template = useEditorStore((s) => s.template);
  const setTemplate = useEditorStore((s) => s.setTemplate);
  const allTemplates = [...BUILT_IN_TEMPLATES, ...userTemplates];

  const categories: TemplateCategory[] = ["photo", "id-card", "layout"];

  return (
    <div className="space-y-4">
      {categories.map((cat) => {
        const items = allTemplates.filter((t) => t.category === cat);
        if (items.length === 0) return null;
        return (
          <div key={cat}>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              {categoryLabels[cat]}
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
                  <span className="font-medium">{item.name}</span>
                  <span className="mt-0.5 block text-xs text-slate-500">
                    {formatDimensions(item.width, item.height, item.unit)}
                  </span>
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
      <p className="font-medium">{template.name}</p>
      <p className="text-slate-600">
        Photo: {formatDimensions(template.width, template.height, template.unit)}
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
