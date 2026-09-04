import type { JobAsset } from "../domain/JobAsset";
import type { ProcessedAsset } from "./ImageProcessingEngine";

export interface DocumentDetectionResult {
    corners: Array<{ x: number, y: number }>;
    confidence: number;
}

export interface IDCardProcessingEngine {
    detectDocument(asset: JobAsset, blob?: Blob): Promise<DocumentDetectionResult>;
    perspectiveCorrect(asset: JobAsset, corners: Array<{ x: number, y: number }>, blob?: Blob): Promise<ProcessedAsset>;
    cropCard(asset: JobAsset, targetRatio: number, blob?: Blob): Promise<ProcessedAsset>;
}
