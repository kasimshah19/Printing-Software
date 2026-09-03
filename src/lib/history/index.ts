import type {
  CropSettings,
  ImageAdjustments,
  LayoutItem,
  LayoutMode,
  PaperSettings,
} from "@/lib/types";
import type { CropMode } from "@/lib/types";

export interface EditorSnapshot {
  layoutItems: LayoutItem[];
  layoutMode: LayoutMode;
  cropSettings: CropSettings;
  adjustments: ImageAdjustments;
  paper: PaperSettings;
  selectedLayoutItemId: string | null;
  processedImages: Record<string, string>;
  cropMode: "fixed" | "free";
}

export const MAX_HISTORY = 50;

export function createSnapshot(state: {
  layoutItems: LayoutItem[];
  layoutMode: LayoutMode;
  cropSettings: CropSettings;
  adjustments: ImageAdjustments;
  paper: PaperSettings;
  selectedLayoutItemId: string | null;
  processedImages: Record<string, string>;
  cropMode: CropMode;
}): EditorSnapshot {
  return {
    layoutItems: state.layoutItems.map((item) => ({ ...item })),
    layoutMode: state.layoutMode,
    cropSettings: { ...state.cropSettings },
    adjustments: { ...state.adjustments },
    paper: {
      ...state.paper,
      margins: { ...state.paper.margins },
    },
    selectedLayoutItemId: state.selectedLayoutItemId,
    processedImages: { ...state.processedImages },
    cropMode: state.cropMode,
  };
}

export function snapshotsEqual(a: EditorSnapshot, b: EditorSnapshot): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}
