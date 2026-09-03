"use client";

import { PAPER_SIZES } from "@/lib/templates/paper-sizes";
import { useEditorStore } from "@/store";
import { Label, Select, Input } from "@/components/ui/input";
import { t } from "@/lib/i18n";
import { useSettingsStore } from "@/store";
import type { PaperOrientation } from "@/lib/types";

export function PaperSelector() {
  const language = useSettingsStore((s) => s.settings.language);
  const paper = useEditorStore((s) => s.paper);
  const template = useEditorStore((s) => s.template);
  const setPaper = useEditorStore((s) => s.setPaper);
  const computeLayout = useEditorStore((s) => s.computeLayout);

  const updatePaper = (partial: Partial<typeof paper>) => {
    setPaper({ ...paper, ...partial });
  };

  const onPaperChange = (id: string) => {
    const selected = PAPER_SIZES.find((p) => p.id === id);
    if (selected) {
      setPaper({ ...selected, orientation: paper.orientation });
      computeLayout();
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <Label>{t("paper.size", language)}</Label>
        <Select value={paper.id} onChange={(e) => onPaperChange(e.target.value)}>
          {PAPER_SIZES.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label>{t("paper.orientation", language)}</Label>
        <Select
          value={paper.orientation}
          onChange={(e) => {
            updatePaper({ orientation: e.target.value as PaperOrientation });
            computeLayout();
          }}
        >
          <option value="portrait">Portrait</option>
          <option value="landscape">Landscape</option>
        </Select>
      </div>

      <div>
        <Label>{t("paper.margins", language)}</Label>
        <div className="grid grid-cols-2 gap-2">
          {(["top", "right", "bottom", "left"] as const).map((side) => (
            <Input
              key={side}
              type="number"
              min={0}
              step={1}
              value={paper.margins[side]}
              onChange={(e) => {
                updatePaper({
                  margins: { ...paper.margins, [side]: Number(e.target.value) },
                });
              }}
              onBlur={() => computeLayout()}
              placeholder={side}
            />
          ))}
        </div>
      </div>

      {template && (
        <div>
          <Label>{t("paper.spacing", language)}</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              min={0}
              value={template.layoutSettings.horizontalGap}
              onChange={(e) => {
                useEditorStore.setState({
                  template: {
                    ...template,
                    layoutSettings: {
                      ...template.layoutSettings,
                      horizontalGap: Number(e.target.value),
                    },
                  },
                });
              }}
              onBlur={() => computeLayout()}
              placeholder="H gap"
            />
            <Input
              type="number"
              min={0}
              value={template.layoutSettings.verticalGap}
              onChange={(e) => {
                useEditorStore.setState({
                  template: {
                    ...template,
                    layoutSettings: {
                      ...template.layoutSettings,
                      verticalGap: Number(e.target.value),
                    },
                  },
                });
              }}
              onBlur={() => computeLayout()}
              placeholder="V gap"
            />
          </div>
        </div>
      )}
    </div>
  );
}
