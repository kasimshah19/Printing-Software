import { describe, it, expect } from "vitest";
import { calculateLayout } from "@/lib/layout-engine";

describe("layout engine", () => {
  const a4Base = {
    paperWidth: 210,
    paperHeight: 297,
    itemWidth: 35,
    itemHeight: 45,
    marginTop: 5,
    marginRight: 5,
    marginBottom: 5,
    marginLeft: 5,
    horizontalGap: 3,
    verticalGap: 3,
  };

  it("calculates passport photos on A4", () => {
    const result = calculateLayout(a4Base);
    expect(result.columns).toBeGreaterThan(0);
    expect(result.rows).toBeGreaterThan(0);
    expect(result.totalItems).toBe(result.columns * result.rows);
    expect(result.totalItems).toBeGreaterThan(20);
  });

  it("never overflows printable area", () => {
    const result = calculateLayout(a4Base);
    const maxX = Math.max(...result.positions.map((p) => p.x + p.width));
    const maxY = Math.max(...result.positions.map((p) => p.y + p.height));

    expect(maxX).toBeLessThanOrEqual(210 - 5 + 0.01);
    expect(maxY).toBeLessThanOrEqual(297 - 5 + 0.01);
  });

  it("respects max copies limit", () => {
    const result = calculateLayout({ ...a4Base, maxCopies: 8 });
    expect(result.totalItems).toBeLessThanOrEqual(8);
  });

  it("handles 4x6 inch paper in mm", () => {
    const result = calculateLayout({
      paperWidth: 101.6,
      paperHeight: 152.4,
      itemWidth: 35,
      itemHeight: 45,
      marginTop: 3,
      marginRight: 3,
      marginBottom: 3,
      marginLeft: 3,
      horizontalGap: 2,
      verticalGap: 2,
    });
    expect(result.totalItems).toBeGreaterThan(0);
    const maxX = Math.max(...result.positions.map((p) => p.x + p.width));
    expect(maxX).toBeLessThanOrEqual(101.6 - 3 + 0.01);
  });

  it("handles rotation by swapping item dimensions", () => {
    const normal = calculateLayout(a4Base);
    const rotated = calculateLayout({ ...a4Base, rotation: 90 });
    expect(rotated.positions[0]?.width).toBe(45);
    expect(rotated.positions[0]?.height).toBe(35);
    expect(normal.totalItems).not.toBe(rotated.totalItems);
  });

  it("returns zero items for invalid dimensions", () => {
    const result = calculateLayout({
      ...a4Base,
      itemWidth: 500,
      itemHeight: 500,
    });
    expect(result.totalItems).toBe(0);
  });

  it("accounts for margins reducing available space", () => {
    const tight = calculateLayout({ ...a4Base, marginTop: 20, marginBottom: 20 });
    const loose = calculateLayout({ ...a4Base, marginTop: 2, marginBottom: 2 });
    expect(loose.totalItems).toBeGreaterThanOrEqual(tight.totalItems);
  });
});
