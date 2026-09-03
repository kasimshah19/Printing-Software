import { describe, it, expect } from "vitest";
import { clampLayoutItem, getPrintableBounds } from "@/lib/layout-engine/clamp";
import type { LayoutItem, PaperSettings } from "@/lib/types";

const paper: PaperSettings = {
  id: "a4",
  name: "A4",
  width: 210,
  height: 297,
  unit: "mm",
  orientation: "portrait",
  margins: { top: 5, right: 5, bottom: 5, left: 5 },
};

describe("layout clamp", () => {
  it("keeps item inside printable margins", () => {
    const item: LayoutItem = { id: "1", x: 0, y: 0, width: 35, height: 45 };
    const clamped = clampLayoutItem(item, paper, true, 35 / 45);
    expect(clamped.x).toBeGreaterThanOrEqual(5);
    expect(clamped.y).toBeGreaterThanOrEqual(5);
    const bounds = getPrintableBounds(paper);
    expect(clamped.x + clamped.width).toBeLessThanOrEqual(bounds.maxX + 0.01);
    expect(clamped.y + clamped.height).toBeLessThanOrEqual(bounds.maxY + 0.01);
  });

  it("prevents oversized items from exceeding printable area", () => {
    const item: LayoutItem = { id: "1", x: 5, y: 5, width: 500, height: 500 };
    const clamped = clampLayoutItem(item, paper);
    const bounds = getPrintableBounds(paper);
    expect(clamped.width).toBeLessThanOrEqual(bounds.maxX - bounds.minX);
    expect(clamped.height).toBeLessThanOrEqual(bounds.maxY - bounds.minY);
  });
});
