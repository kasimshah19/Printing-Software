"use client";

import { useMemo } from "react";
import { useEditorStore, getProcessedUrl } from "@/store";
import { applyOrientation } from "@/lib/templates/paper-sizes";
import { toMillimeters } from "@/lib/utils/units";

interface PrintCanvasProps {
  scale?: number;
  showMargins?: boolean;
  className?: string;
}

export function PrintCanvas({
  scale = 0.4,
  showMargins = true,
  className = "",
}: PrintCanvasProps) {
  const paper = useEditorStore((s) => s.paper);
  const layoutItems = useEditorStore((s) => s.layoutItems);
  const processedImages = useEditorStore((s) => s.processedImages);
  const selectedImageId = useEditorStore((s) => s.selectedImageId);
  const template = useEditorStore((s) => s.template);

  const orientedPaper = applyOrientation(paper);
  const paperWidthMm = toMillimeters(orientedPaper.width, orientedPaper.unit);
  const paperHeightMm = toMillimeters(orientedPaper.height, orientedPaper.unit);

  const canvasStyle = useMemo(
    () => ({
      width: `${paperWidthMm * scale}mm`,
      height: `${paperHeightMm * scale}mm`,
    }),
    [paperWidthMm, paperHeightMm, scale]
  );

  return (
    <div className={`overflow-auto ${className}`}>
      <div className="relative mx-auto bg-white shadow-lg" style={canvasStyle}>
        {showMargins && (
          <div
            className="pointer-events-none absolute border border-dashed border-blue-300"
            style={{
              top: `${paper.margins.top * scale}mm`,
              left: `${paper.margins.left * scale}mm`,
              right: `${paper.margins.right * scale}mm`,
              bottom: `${paper.margins.bottom * scale}mm`,
            }}
          />
        )}

        {layoutItems.map((item, i) => {
          const imgUrl = getProcessedUrl(processedImages, item.imageId, selectedImageId);
          return (
            <div
              key={item.id}
              className="absolute overflow-hidden border border-slate-200 bg-slate-100"
              style={{
                left: `${item.x * scale}mm`,
                top: `${item.y * scale}mm`,
                width: `${item.width * scale}mm`,
                height: `${item.height * scale}mm`,
              }}
            >
              {imgUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imgUrl} alt={`Copy ${i + 1}`} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-[8px] text-slate-400">
                  {template?.name ?? "Photo"}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
