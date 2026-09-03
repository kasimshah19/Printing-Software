import type { CropSettings, ImageAdjustments } from "@/lib/types";
import { getDefaultAdjustments, getDefaultCropSettings } from "@/lib/image-processing";

export interface ImageEditorState {
  cropSettings: CropSettings;
  adjustments: ImageAdjustments;
}

export function getDefaultImageState(aspectRatio: number | null): ImageEditorState {
  return {
    cropSettings: getDefaultCropSettings(aspectRatio),
    adjustments: getDefaultAdjustments(),
  };
}

export function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(",");
  const mime = header.match(/:(.*?);/)?.[1] ?? "image/png";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

export async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
