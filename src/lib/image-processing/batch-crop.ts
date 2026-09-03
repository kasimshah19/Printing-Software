import type { Template } from "@/lib/types";
import type { UploadedImage } from "@/lib/types";
import { centerCropArea, getCroppedImage, getDefaultAdjustments } from "@/lib/image-processing";
import { toMillimeters } from "@/lib/utils/units";

export interface BatchCropResult {
  imageId: string;
  success: boolean;
  dataUrl?: string;
  error?: string;
}

export async function batchAutoCrop(
  images: UploadedImage[],
  template: Template,
  dpi: number,
  onProgress?: (done: number, total: number) => void
): Promise<BatchCropResult[]> {
  const results: BatchCropResult[] = [];
  const outputWidthMm = toMillimeters(template.width, template.unit);
  const outputHeightMm = toMillimeters(template.height, template.unit);
  const aspect = template.aspectRatio;

  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    try {
      const img = await loadImageDimensions(image.objectUrl);
      const cropArea = centerCropArea(img.width, img.height, aspect);
      const dataUrl = await getCroppedImage(
        image.objectUrl,
        cropArea,
        0,
        false,
        false,
        getDefaultAdjustments(),
        outputWidthMm,
        outputHeightMm,
        dpi
      );
      results.push({ imageId: image.id, success: true, dataUrl });
    } catch {
      results.push({ imageId: image.id, success: false, error: "Crop failed" });
    }
    onProgress?.(i + 1, images.length);
  }

  return results;
}

function loadImageDimensions(src: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = reject;
    img.src = src;
  });
}
