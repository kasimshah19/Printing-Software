import { describe, it, expect } from "vitest";
import {
  mmToPx,
  pxToMm,
  inchToMm,
  mmToInch,
  toMillimeters,
  fromMillimeters,
  DEFAULT_DPI,
} from "@/lib/utils/units";

describe("unit conversion", () => {
  it("converts mm to px at 300 DPI", () => {
    expect(mmToPx(25.4, 300)).toBeCloseTo(300, 0);
  });

  it("converts px to mm at 300 DPI", () => {
    expect(pxToMm(300, 300)).toBeCloseTo(25.4, 1);
  });

  it("converts inch to mm", () => {
    expect(inchToMm(1)).toBeCloseTo(25.4, 1);
  });

  it("converts mm to inch", () => {
    expect(mmToInch(25.4)).toBeCloseTo(1, 2);
  });

  it("converts to millimeters from cm and in", () => {
    expect(toMillimeters(2.54, "in")).toBeCloseTo(64.516, 1);
    expect(toMillimeters(10, "cm")).toBe(100);
  });

  it("converts from millimeters to other units", () => {
    expect(fromMillimeters(25.4, "in")).toBeCloseTo(1, 2);
    expect(fromMillimeters(100, "cm")).toBe(10);
  });

  it("round-trips mm and px", () => {
    const mm = 35;
    expect(pxToMm(mmToPx(mm, DEFAULT_DPI), DEFAULT_DPI)).toBeCloseTo(mm, 2);
  });
});
