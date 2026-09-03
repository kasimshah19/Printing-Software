"use client";

import { useCallback, useEffect, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import {
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  RefreshCw,
  Lock,
  Unlock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/input";
import { useEditorStore } from "@/store";
import { t } from "@/lib/i18n";
import { useSettingsStore } from "@/store";
import { getCroppedImage } from "@/lib/image-processing";
import { batchAutoCrop } from "@/lib/image-processing/batch-crop";
import { toMillimeters } from "@/lib/utils/units";

export function CropEditor({ onApplied }: { onApplied?: () => void }) {
  const language = useSettingsStore((s) => s.settings.language);
  const dpi = useSettingsStore((s) => s.settings.defaultDpi);
  const images = useEditorStore((s) => s.images);
  const selectedImageId = useEditorStore((s) => s.selectedImageId);
  const selectImage = useEditorStore((s) => s.selectImage);
  const template = useEditorStore((s) => s.template);
  const cropSettings = useEditorStore((s) => s.cropSettings);
  const adjustments = useEditorStore((s) => s.adjustments);
  const cropMode = useEditorStore((s) => s.cropMode);
  const processedImages = useEditorStore((s) => s.processedImages);
  const setCropSettings = useEditorStore((s) => s.setCropSettings);
  const setAdjustments = useEditorStore((s) => s.setAdjustments);
  const setProcessedImage = useEditorStore((s) => s.setProcessedImage);
  const setCropMode = useEditorStore((s) => s.setCropMode);
  const resetAdjustments = useEditorStore((s) => s.resetAdjustments);
  const resetCrop = useEditorStore((s) => s.resetCrop);
  const pushHistory = useEditorStore((s) => s.pushHistory);
  const computeLayout = useEditorStore((s) => s.computeLayout);
  const layoutItems = useEditorStore((s) => s.layoutItems);
  const setIsProcessing = useEditorStore((s) => s.setIsProcessing);

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(cropSettings.zoom || 1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [batchProgress, setBatchProgress] = useState<{done: number, total: number} | null>(null);

  const selectedImage = images.find((i) => i.id === selectedImageId);

  useEffect(() => {
    setZoom(cropSettings.zoom || 1);
    setCrop({ x: 0, y: 0 });
  }, [selectedImageId, cropSettings.zoom]);

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const applyCrop = async () => {
    if (!selectedImage || !croppedAreaPixels || !template) return;
    setIsProcessing(true);
    try {
      const outputWidthMm = toMillimeters(template.width, template.unit);
      const outputHeightMm = toMillimeters(template.height, template.unit);
      const url = await getCroppedImage(
        selectedImage.objectUrl,
        croppedAreaPixels,
        cropSettings.rotation,
        cropSettings.flipHorizontal,
        cropSettings.flipVertical,
        adjustments,
        outputWidthMm,
        outputHeightMm,
        dpi
      );
      pushHistory();
      setProcessedImage(selectedImage.id, url);
      setCropSettings({ cropArea: croppedAreaPixels, zoom });
      if (useEditorStore.getState().layoutItems.length === 0) {
        computeLayout();
      }
      onApplied?.();
    } finally {
      setIsProcessing(false);
    }
  };

  const applyBatchCrop = async () => {
    if (!template) return;
    setIsProcessing(true);
    setBatchProgress({ done: 0, total: images.length });
    try {
      const results = await batchAutoCrop(images, template, dpi, (done, total) => {
        setBatchProgress({ done, total });
      });
      
      pushHistory();
      let hasError = false;
      for (const res of results) {
        if (res.success && res.dataUrl) {
          setProcessedImage(res.imageId, res.dataUrl);
        } else {
          hasError = true;
        }
      }
      
      if (useEditorStore.getState().layoutItems.length === 0) {
        computeLayout();
      }
      
      if (hasError) {
        alert(t("batch.failed", language));
      } else {
        alert(t("batch.complete", language));
      }
      
      onApplied?.();
    } finally {
      setIsProcessing(false);
      setBatchProgress(null);
    }
  };

  if (!selectedImage) {
    return (
      <div className="flex h-96 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500">
        {t("editor.noImage", language)}
      </div>
    );
  }

  const aspect = cropMode === "fixed" ? template?.aspectRatio : undefined;
  const isProcessed = Boolean(selectedImageId && processedImages[selectedImageId]);

  return (
    <div className="space-y-4">
      {images.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {images.map((img) => (
            <button
              key={img.id}
              type="button"
              onClick={() => selectImage(img.id)}
              className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm ${
                selectedImageId === img.id
                  ? "border-blue-500 bg-blue-50 text-blue-800"
                  : "border-slate-200 hover:bg-slate-50"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.objectUrl} alt="" className="h-8 w-8 rounded object-cover" />
              <span className="max-w-[100px] truncate">{img.filename}</span>
              {processedImages[img.id] && (
                <span className="text-xs text-green-600">✓</span>
              )}
            </button>
          ))}
        </div>
      )}

      <div className="relative h-96 overflow-hidden rounded-xl bg-slate-900">
        <Cropper
          image={selectedImage.objectUrl}
          crop={crop}
          zoom={zoom}
          aspect={aspect}
          rotation={cropSettings.rotation}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onRotationChange={(rotation) =>
            setCropSettings({ rotation: rotation as 0 | 90 | 180 | 270 })
          }
          onCropComplete={onCropComplete}
        />
      </div>

      <div>
        <Label>Zoom</Label>
        <input
          type="range"
          min={1}
          max={3}
          step={0.05}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="w-full"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant={cropMode === "fixed" ? "default" : "outline"}
          size="sm"
          onClick={() => setCropMode("fixed")}
        >
          <Lock className="h-4 w-4" />
          Fixed Ratio
        </Button>
        <Button
          variant={cropMode === "free" ? "default" : "outline"}
          size="sm"
          onClick={() => setCropMode("free")}
        >
          <Unlock className="h-4 w-4" />
          Free Crop
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            setCropSettings({
              rotation: ((cropSettings.rotation + 90) % 360) as 0 | 90 | 180 | 270,
            })
          }
        >
          <RotateCw className="h-4 w-4" />
          {t("editor.rotate", language)}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            setCropSettings({ flipHorizontal: !cropSettings.flipHorizontal })
          }
        >
          <FlipHorizontal className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            setCropSettings({ flipVertical: !cropSettings.flipVertical })
          }
        >
          <FlipVertical className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={resetCrop}>
          <RefreshCw className="h-4 w-4" />
          {t("editor.reset", language)}
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <Label>{t("editor.brightness", language)}</Label>
          <input
            type="range"
            min={-50}
            max={50}
            value={adjustments.brightness}
            onChange={(e) => setAdjustments({ brightness: Number(e.target.value) })}
            className="w-full"
          />
        </div>
        <div>
          <Label>{t("editor.contrast", language)}</Label>
          <input
            type="range"
            min={-50}
            max={50}
            value={adjustments.contrast}
            onChange={(e) => setAdjustments({ contrast: Number(e.target.value) })}
            className="w-full"
          />
        </div>
        <div>
          <Label>{t("editor.saturation", language)}</Label>
          <input
            type="range"
            min={-50}
            max={50}
            value={adjustments.saturation}
            onChange={(e) => setAdjustments({ saturation: Number(e.target.value) })}
            className="w-full"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="grayscale"
          checked={adjustments.grayscale}
          onChange={(e) => setAdjustments({ grayscale: e.target.checked })}
        />
        <Label htmlFor="grayscale">{t("editor.grayscale", language)}</Label>
        <Button variant="ghost" size="sm" onClick={resetAdjustments}>
          Reset adjustments
        </Button>
      </div>

      {isProcessed && (
        <p className="text-sm text-green-700">This image is cropped. Re-apply to update the layout.</p>
      )}

      {batchProgress && (
        <div className="rounded-lg bg-blue-50 p-3 text-center text-sm font-medium text-blue-700">
          {t("batch.processing", language)} {batchProgress.done} / {batchProgress.total}
        </div>
      )}

      <div className="flex gap-2">
        <Button onClick={applyCrop} className="flex-1" size="lg" disabled={!!batchProgress}>
          Apply Crop{layoutItems.length === 0 ? " & Generate Layout" : ""}
        </Button>
        {images.length > 1 && (
          <Button variant="secondary" onClick={applyBatchCrop} className="flex-1" size="lg" disabled={!!batchProgress}>
            {t("batch.autoCrop", language)}
          </Button>
        )}
      </div>
    </div>
  );
}
