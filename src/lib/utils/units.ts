import type { Unit } from "@/lib/types";

export const MM_PER_INCH = 25.4;
export const MM_PER_CM = 10;
export const DEFAULT_DPI = 300;

export function toMillimeters(value: number, unit: Unit): number {
  switch (unit) {
    case "mm":
      return value;
    case "cm":
      return value * MM_PER_CM;
    case "in":
      return value * MM_PER_INCH;
  }
}

export function fromMillimeters(valueMm: number, unit: Unit): number {
  switch (unit) {
    case "mm":
      return valueMm;
    case "cm":
      return valueMm / MM_PER_CM;
    case "in":
      return valueMm / MM_PER_INCH;
  }
}

export function mmToPx(mm: number, dpi: number = DEFAULT_DPI): number {
  return (mm * dpi) / MM_PER_INCH;
}

export function pxToMm(px: number, dpi: number = DEFAULT_DPI): number {
  return (px * MM_PER_INCH) / dpi;
}

export function inchToMm(inches: number): number {
  return inches * MM_PER_INCH;
}

export function mmToInch(mm: number): number {
  return mm / MM_PER_INCH;
}

export function formatDimensions(
  width: number,
  height: number,
  unit: Unit,
  precision = 1
): string {
  return `${width.toFixed(precision)} × ${height.toFixed(precision)} ${unit}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
