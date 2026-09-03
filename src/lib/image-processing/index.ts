import type { Area } from "react-easy-crop";
import type { CropSettings, ImageAdjustments, Rotation } from "@/lib/types";
import { DEFAULT_DPI, mmToPx } from "@/lib/utils/units";

export const SUPPORTED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

export const MAX_FILE_SIZE = 25 * 1024 * 1024;

export function validateImageFile(file: File): string | null {
  if (!SUPPORTED_MIME_TYPES.includes(file.type)) {
    return "unsupported";
  }
  if (file.size > MAX_FILE_SIZE) {
    return "tooLarge";
  }
  return null;
}

export async function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = src;
  });
}

export function getDefaultCropSettings(aspectRatio: number | null): CropSettings {
  return {
    aspectRatio,
    width: null,
    height: null,
    unit: "mm",
    rotation: 0,
    flipHorizontal: false,
    flipVertical: false,
    zoom: 1,
    cropArea: null,
  };
}

export function getDefaultAdjustments(): ImageAdjustments {
  return {
    brightness: 0,
    contrast: 0,
    saturation: 0,
    grayscale: false,
  };
}

function getRadianAngle(rotation: Rotation): number {
  return (rotation * Math.PI) / 180;
}

function rotateSize(width: number, height: number, rotation: Rotation) {
  const rotRad = getRadianAngle(rotation);
  return {
    width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
}

export async function getCroppedImage(
  imageSrc: string,
  pixelCrop: Area,
  rotation: Rotation = 0,
  flipHorizontal = false,
  flipVertical = false,
  adjustments: ImageAdjustments = getDefaultAdjustments(),
  outputWidthMm?: number,
  outputHeightMm?: number,
  dpi = DEFAULT_DPI
): Promise<string> {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  const rotRad = getRadianAngle(rotation);
  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
    image.width,
    image.height,
    rotation
  );

  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.scale(flipHorizontal ? -1 : 1, flipVertical ? -1 : 1);
  ctx.translate(-image.width / 2, -image.height / 2);
  ctx.drawImage(image, 0, 0);

  const croppedCanvas = document.createElement("canvas");
  const croppedCtx = croppedCanvas.getContext("2d");
  if (!croppedCtx) throw new Error("Canvas not supported");

  let outWidth = pixelCrop.width;
  let outHeight = pixelCrop.height;

  if (outputWidthMm && outputHeightMm) {
    outWidth = mmToPx(outputWidthMm, dpi);
    outHeight = mmToPx(outputHeightMm, dpi);
  }

  croppedCanvas.width = outWidth;
  croppedCanvas.height = outHeight;

  applyAdjustments(croppedCtx, adjustments);
  croppedCtx.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    outWidth,
    outHeight
  );

  return croppedCanvas.toDataURL("image/png");
}

function applyAdjustments(ctx: CanvasRenderingContext2D, adj: ImageAdjustments) {
  const filters: string[] = [];
  if (adj.brightness !== 0) filters.push(`brightness(${100 + adj.brightness}%)`);
  if (adj.contrast !== 0) filters.push(`contrast(${100 + adj.contrast}%)`);
  if (adj.saturation !== 0) filters.push(`saturate(${100 + adj.saturation}%)`);
  if (adj.grayscale) filters.push("grayscale(100%)");
  ctx.filter = filters.length ? filters.join(" ") : "none";
}

export async function renderPrintSheet(
  imageDataUrl: string,
  positions: { x: number; y: number; width: number; height: number }[],
  paperWidthMm: number,
  paperHeightMm: number,
  dpi = DEFAULT_DPI
): Promise<string> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  canvas.width = mmToPx(paperWidthMm, dpi);
  canvas.height = mmToPx(paperHeightMm, dpi);

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const img = await loadImage(imageDataUrl);

  for (const pos of positions) {
    const x = mmToPx(pos.x, dpi);
    const y = mmToPx(pos.y, dpi);
    const w = mmToPx(pos.width, dpi);
    const h = mmToPx(pos.height, dpi);
    ctx.drawImage(img, x, y, w, h);
  }

  return canvas.toDataURL("image/png");
}

export function centerCropArea(
  imageWidth: number,
  imageHeight: number,
  aspectRatio: number
): { x: number; y: number; width: number; height: number } {
  let cropWidth = imageWidth;
  let cropHeight = imageWidth / aspectRatio;

  if (cropHeight > imageHeight) {
    cropHeight = imageHeight;
    cropWidth = imageHeight * aspectRatio;
  }

  return {
    x: (imageWidth - cropWidth) / 2,
    y: (imageHeight - cropHeight) / 2,
    width: cropWidth,
    height: cropHeight,
  };
}
