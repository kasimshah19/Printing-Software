"use client";

import { useCallback, useRef, useState } from "react";
import {
  Plus,
  Copy,
  Trash2,
  AlignHorizontalJustifyCenter,
  AlignVerticalJustifyCenter,
  Grid3X3,
  Magnet,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label, Select } from "@/components/ui/input";
import { useEditorStore, getProcessedUrl } from "@/store";
import { applyOrientation } from "@/lib/templates/paper-sizes";
import { toMillimeters } from "@/lib/utils/units";

type DragMode = "move" | "resize" | null;

interface ManualLayoutEditorProps {
  scale?: number;
  className?: string;
}

export function ManualLayoutEditor({ scale: initialScale = 0.45, className = "" }: ManualLayoutEditorProps) {
  const paper = useEditorStore((s) => s.paper);
  const layoutItems = useEditorStore((s) => s.layoutItems);
  const selectedLayoutItemId = useEditorStore((s) => s.selectedLayoutItemId);
  const processedImages = useEditorStore((s) => s.processedImages);
  const selectedImageId = useEditorStore((s) => s.selectedImageId);
  const images = useEditorStore((s) => s.images);
  const template = useEditorStore((s) => s.template);
  const snapToGrid = useEditorStore((s) => s.snapToGrid);
  const gridSize = useEditorStore((s) => s.gridSize);
  const selectLayoutItem = useEditorStore((s) => s.selectLayoutItem);
  const updateLayoutItem = useEditorStore((s) => s.updateLayoutItem);
  const pushHistory = useEditorStore((s) => s.pushHistory);
  const deleteSelectedLayoutItem = useEditorStore((s) => s.deleteSelectedLayoutItem);
  const duplicateSelectedLayoutItem = useEditorStore((s) => s.duplicateSelectedLayoutItem);
  const addLayoutItem = useEditorStore((s) => s.addLayoutItem);
  const alignLayoutItems = useEditorStore((s) => s.alignLayoutItems);
  const distributeLayoutItems = useEditorStore((s) => s.distributeLayoutItems);
  const assignLayoutItemImage = useEditorStore((s) => s.assignLayoutItemImage);
  const setSnapToGrid = useEditorStore((s) => s.setSnapToGrid);
  const computeLayout = useEditorStore((s) => s.computeLayout);

  const [scale, setScale] = useState(initialScale);
  const dragRef = useRef<{
    mode: DragMode;
    itemId: string;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    origW: number;
    origH: number;
  } | null>(null);

  const [isDragging, setIsDragging] = useState(false);

  const orientedPaper = applyOrientation(paper);
  const paperWidthMm = toMillimeters(orientedPaper.width, orientedPaper.unit);
  const paperHeightMm = toMillimeters(orientedPaper.height, orientedPaper.unit);

  const pxToMm = useCallback((px: number) => px / scale, [scale]);

  const handlePointerDown = (e: React.PointerEvent, itemId: string, mode: DragMode) => {
    e.stopPropagation();
    const item = layoutItems.find((i) => i.id === itemId);
    if (!item) return;

    selectLayoutItem(itemId);
    pushHistory();
    dragRef.current = {
      mode,
      itemId,
      startX: e.clientX,
      startY: e.clientY,
      origX: item.x,
      origY: item.y,
      origW: item.width,
      origH: item.height,
    };
    setIsDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag) return;

    const dx = pxToMm(e.clientX - drag.startX);
    const dy = pxToMm(e.clientY - drag.startY);

    if (drag.mode === "move") {
      updateLayoutItem(drag.itemId, { x: drag.origX + dx, y: drag.origY + dy });
    } else if (drag.mode === "resize") {
      updateLayoutItem(drag.itemId, {
        width: drag.origW + dx,
        height: drag.origH + dy,
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    dragRef.current = null;
    setIsDragging(false);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  const processedImageIds = Object.keys(processedImages);

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => computeLayout()}>
          <Grid3X3 className="h-4 w-4" />
          Auto Layout
        </Button>
        <Button variant="outline" size="sm" onClick={addLayoutItem}>
          <Plus className="h-4 w-4" />
          Add Photo
        </Button>
        <Button variant="outline" size="sm" disabled={!selectedLayoutItemId} onClick={duplicateSelectedLayoutItem}>
          <Copy className="h-4 w-4" />
          Duplicate
        </Button>
        <Button variant="outline" size="sm" disabled={!selectedLayoutItemId} onClick={deleteSelectedLayoutItem}>
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
        <Button variant="outline" size="sm" onClick={() => alignLayoutItems("center")}>
          <AlignHorizontalJustifyCenter className="h-4 w-4" />
          Align H
        </Button>
        <Button variant="outline" size="sm" onClick={() => alignLayoutItems("middle")}>
          <AlignVerticalJustifyCenter className="h-4 w-4" />
          Align V
        </Button>
        <Button variant="outline" size="sm" onClick={() => distributeLayoutItems("horizontal")}>
          Distribute H
        </Button>
        <Button variant="outline" size="sm" onClick={() => distributeLayoutItems("vertical")}>
          Distribute V
        </Button>
        <Button variant={snapToGrid ? "default" : "outline"} size="sm" onClick={() => setSnapToGrid(!snapToGrid)}>
          <Magnet className="h-4 w-4" />
          Snap {snapToGrid ? `${gridSize}mm` : "Off"}
        </Button>
        <Button variant="outline" size="icon" onClick={() => setScale((s) => Math.max(0.25, s - 0.05))}>
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => setScale(initialScale)}>
          {Math.round(scale * 100)}%
        </Button>
        <Button variant="outline" size="icon" onClick={() => setScale((s) => Math.min(1, s + 0.05))}>
          <ZoomIn className="h-4 w-4" />
        </Button>
      </div>

      <div className="overflow-auto rounded-lg bg-slate-100 p-4">
        <div
          className="relative mx-auto bg-white shadow-lg select-none"
          style={{
            width: `${paperWidthMm * scale}mm`,
            height: `${paperHeightMm * scale}mm`,
            cursor: isDragging ? "grabbing" : "default",
          }}
          onClick={() => selectLayoutItem(null)}
        >
          {snapToGrid && (
            <div
              className="pointer-events-none absolute inset-0 opacity-20"
              style={{
                backgroundImage: `linear-gradient(to right, #94a3b8 1px, transparent 1px), linear-gradient(to bottom, #94a3b8 1px, transparent 1px)`,
                backgroundSize: `${gridSize * scale}mm ${gridSize * scale}mm`,
              }}
            />
          )}

          <div
            className="pointer-events-none absolute border border-dashed border-blue-300"
            style={{
              top: `${paper.margins.top * scale}mm`,
              left: `${paper.margins.left * scale}mm`,
              right: `${paper.margins.right * scale}mm`,
              bottom: `${paper.margins.bottom * scale}mm`,
            }}
          />

          {layoutItems.map((item) => {
            const isSelected = item.id === selectedLayoutItemId;
            const imgUrl = getProcessedUrl(processedImages, item.imageId, selectedImageId);
            return (
              <div
                key={item.id}
                className={`absolute overflow-hidden border-2 bg-slate-50 ${
                  isSelected ? "border-blue-500 ring-2 ring-blue-200" : "border-slate-300 hover:border-blue-300"
                }`}
                style={{
                  left: `${item.x * scale}mm`,
                  top: `${item.y * scale}mm`,
                  width: `${item.width * scale}mm`,
                  height: `${item.height * scale}mm`,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  selectLayoutItem(item.id);
                }}
                onPointerDown={(e) => handlePointerDown(e, item.id, "move")}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
              >
                {imgUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imgUrl} alt="" className="pointer-events-none h-full w-full object-cover" draggable={false} />
                ) : (
                  <div className="flex h-full items-center justify-center text-[8px] text-slate-400">
                    {template?.name ?? "Photo"}
                  </div>
                )}

                {isSelected && (
                  <>
                    <div className="pointer-events-none absolute bottom-0 right-0 bg-blue-500 px-1 text-[7px] text-white">
                      {item.width.toFixed(0)}×{item.height.toFixed(0)}mm
                    </div>
                    <div
                      className="absolute bottom-0 right-0 h-3 w-3 cursor-se-resize bg-blue-500"
                      onPointerDown={(e) => handlePointerDown(e, item.id, "resize")}
                      onPointerMove={handlePointerMove}
                      onPointerUp={handlePointerUp}
                    />
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {selectedLayoutItemId && (
        <div className="space-y-3 rounded-lg bg-slate-50 p-3 text-sm">
          <div className="grid grid-cols-4 gap-2">
            {(["x", "y", "width", "height"] as const).map((field) => {
              const item = layoutItems.find((i) => i.id === selectedLayoutItemId);
              if (!item) return null;
              return (
                <div key={field}>
                  <Label className="text-xs capitalize">{field} (mm)</Label>
                  <input
                    type="number"
                    step={0.5}
                    className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                    value={Math.round(item[field] * 10) / 10}
                    onChange={(e) => {
                      pushHistory();
                      updateLayoutItem(selectedLayoutItemId, { [field]: Number(e.target.value) });
                    }}
                  />
                </div>
              );
            })}
          </div>
          {processedImageIds.length > 0 && (
            <div>
              <Label className="text-xs">Assign Image</Label>
              <Select
                value={layoutItems.find((i) => i.id === selectedLayoutItemId)?.imageId ?? ""}
                onChange={(e) => assignLayoutItemImage(selectedLayoutItemId, e.target.value)}
              >
                <option value="">Default</option>
                {images
                  .filter((img) => processedImages[img.id])
                  .map((img) => (
                    <option key={img.id} value={img.id}>
                      {img.filename}
                    </option>
                  ))}
              </Select>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
