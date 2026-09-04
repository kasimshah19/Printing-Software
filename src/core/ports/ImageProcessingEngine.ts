import type { JobAsset } from "../domain/JobAsset";

export interface ProcessedAsset {
    blob: Blob;
    width: number;
    height: number;
    mimeType: string;
}

export interface ResizeOptions {
    width?: number;
    height?: number;
    maintainAspectRatio?: boolean;
    fit?: "cover" | "contain" | "fill";
}

export interface CropOptions {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface ImageProcessingEngine {
    resize(asset: JobAsset, options: ResizeOptions): Promise<ProcessedAsset>;
    crop(asset: JobAsset, options: CropOptions): Promise<ProcessedAsset>;
    rotate(asset: JobAsset, degrees: number): Promise<ProcessedAsset>;
    compress(asset: JobAsset, quality: number): Promise<ProcessedAsset>;
    formatConversion(asset: JobAsset, targetMimeType: string): Promise<ProcessedAsset>;
}
