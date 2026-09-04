import type { JobAsset } from "../domain/JobAsset";
import type { ProcessedAsset } from "./ImageProcessingEngine";

export interface FaceDetectionResult {
    facesFound: number;
    boundingBoxes: Array<{ x: number, y: number, width: number, height: number }>;
}

export interface PhotoProcessingEngine {
    detectFace(asset: JobAsset, blob?: Blob): Promise<FaceDetectionResult>;
    autoCrop(asset: JobAsset, targetWidthMm: number, targetHeightMm: number, blob?: Blob): Promise<ProcessedAsset>;
    removeBackground(asset: JobAsset, blob?: Blob): Promise<ProcessedAsset>;
    createPhotoSheet(asset: JobAsset, sheetSize: string, rows: number, cols: number, blob?: Blob): Promise<ProcessedAsset>;
}
