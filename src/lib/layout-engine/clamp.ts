import { applyOrientation } from "@/lib/templates/paper-sizes";
import type { LayoutItem, PaperSettings } from "@/lib/types";
import { toMillimeters } from "@/lib/utils/units";

export function getPrintableBounds(paper: PaperSettings) {
  const oriented = applyOrientation(paper);
  const paperWidth = toMillimeters(oriented.width, oriented.unit);
  const paperHeight = toMillimeters(oriented.height, oriented.unit);
  return {
    paperWidth,
    paperHeight,
    minX: paper.margins.left,
    minY: paper.margins.top,
    maxX: paperWidth - paper.margins.right,
    maxY: paperHeight - paper.margins.bottom,
  };
}

export function clampLayoutItem(
  item: LayoutItem,
  paper: PaperSettings,
  lockAspect = false,
  aspectRatio?: number
): LayoutItem {
  const { minX, minY, maxX, maxY } = getPrintableBounds(paper);
  const printableWidth = maxX - minX;
  const printableHeight = maxY - minY;

  let width = Math.max(5, Math.min(item.width, printableWidth));
  let height = Math.max(5, Math.min(item.height, printableHeight));

  if (lockAspect && aspectRatio) {
    if (width / height > aspectRatio) {
      width = height * aspectRatio;
    } else {
      height = width / aspectRatio;
    }
  }

  const x = Math.max(minX, Math.min(item.x, maxX - width));
  const y = Math.max(minY, Math.min(item.y, maxY - height));

  return { ...item, x, y, width, height };
}
