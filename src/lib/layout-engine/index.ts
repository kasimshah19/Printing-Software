import type { LayoutInput, LayoutPosition, LayoutResult, Rotation } from "@/lib/types";

function getEffectiveItemSize(
  itemWidth: number,
  itemHeight: number,
  rotation: Rotation
): { width: number; height: number } {
  if (rotation === 90 || rotation === 270) {
    return { width: itemHeight, height: itemWidth };
  }
  return { width: itemWidth, height: itemHeight };
}

function computeGrid(
  availableWidth: number,
  availableHeight: number,
  itemWidth: number,
  itemHeight: number,
  horizontalGap: number,
  verticalGap: number
): { columns: number; rows: number } {
  if (itemWidth <= 0 || itemHeight <= 0 || availableWidth <= 0 || availableHeight <= 0) {
    return { columns: 0, rows: 0 };
  }

  const columns = Math.floor(
    (availableWidth + horizontalGap) / (itemWidth + horizontalGap)
  );
  const rows = Math.floor(
    (availableHeight + verticalGap) / (itemHeight + verticalGap)
  );

  return {
    columns: Math.max(0, columns),
    rows: Math.max(0, rows),
  };
}

function verifyNoOverflow(
  columns: number,
  rows: number,
  itemWidth: number,
  itemHeight: number,
  horizontalGap: number,
  verticalGap: number,
  availableWidth: number,
  availableHeight: number
): boolean {
  if (columns === 0 || rows === 0) return false;

  const totalWidth = columns * itemWidth + (columns - 1) * horizontalGap;
  const totalHeight = rows * itemHeight + (rows - 1) * verticalGap;

  return totalWidth <= availableWidth + 0.001 && totalHeight <= availableHeight + 0.001;
}

export function calculateLayout(input: LayoutInput): LayoutResult {
  const rotation = input.rotation ?? 0;
  const { width: itemWidth, height: itemHeight } = getEffectiveItemSize(
    input.itemWidth,
    input.itemHeight,
    rotation
  );

  const availableWidth =
    input.paperWidth - input.marginLeft - input.marginRight;
  const availableHeight =
    input.paperHeight - input.marginTop - input.marginBottom;

  let { columns, rows } = computeGrid(
    availableWidth,
    availableHeight,
    itemWidth,
    itemHeight,
    input.horizontalGap,
    input.verticalGap
  );

  while (
    columns > 0 &&
    rows > 0 &&
    !verifyNoOverflow(
      columns,
      rows,
      itemWidth,
      itemHeight,
      input.horizontalGap,
      input.verticalGap,
      availableWidth,
      availableHeight
    )
  ) {
    if (columns >= rows) {
      columns -= 1;
    } else {
      rows -= 1;
    }
  }

  let totalItems = columns * rows;

  if (input.maxCopies !== undefined && totalItems > input.maxCopies) {
    totalItems = input.maxCopies;
    rows = Math.ceil(totalItems / Math.max(columns, 1));
    if (columns * rows > totalItems) {
      rows = Math.ceil(totalItems / columns);
    }
  }

  const positions: LayoutPosition[] = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      if (positions.length >= totalItems) break;

      positions.push({
        x: input.marginLeft + col * (itemWidth + input.horizontalGap),
        y: input.marginTop + row * (itemHeight + input.verticalGap),
        width: itemWidth,
        height: itemHeight,
      });
    }
  }

  return {
    columns,
    rows,
    totalItems: positions.length,
    positions,
  };
}
