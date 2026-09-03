import type { PaperSettings } from "@/lib/types";

export const PAPER_SIZES: PaperSettings[] = [
  {
    id: "a4",
    name: "A4",
    width: 210,
    height: 297,
    unit: "mm",
    orientation: "portrait",
    margins: { top: 5, right: 5, bottom: 5, left: 5 },
  },
  {
    id: "a5",
    name: "A5",
    width: 148,
    height: 210,
    unit: "mm",
    orientation: "portrait",
    margins: { top: 5, right: 5, bottom: 5, left: 5 },
  },
  {
    id: "4x6",
    name: "4×6 inch",
    width: 4,
    height: 6,
    unit: "in",
    orientation: "portrait",
    margins: { top: 3, right: 3, bottom: 3, left: 3 },
  },
  {
    id: "5x7",
    name: "5×7 inch",
    width: 5,
    height: 7,
    unit: "in",
    orientation: "portrait",
    margins: { top: 3, right: 3, bottom: 3, left: 3 },
  },
  {
    id: "letter",
    name: "Letter",
    width: 8.5,
    height: 11,
    unit: "in",
    orientation: "portrait",
    margins: { top: 5, right: 5, bottom: 5, left: 5 },
  },
  {
    id: "legal",
    name: "Legal",
    width: 8.5,
    height: 14,
    unit: "in",
    orientation: "portrait",
    margins: { top: 5, right: 5, bottom: 5, left: 5 },
  },
];

export function getPaperSize(id: string): PaperSettings {
  return PAPER_SIZES.find((p) => p.id === id) ?? PAPER_SIZES[0];
}

export function applyOrientation(paper: PaperSettings): PaperSettings {
  if (paper.orientation === "portrait") return paper;
  return {
    ...paper,
    width: paper.height,
    height: paper.width,
  };
}
