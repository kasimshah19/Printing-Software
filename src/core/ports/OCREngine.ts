import type { JobAsset } from "../domain/JobAsset";

export interface OCRResult {
    text: string;
    confidence: number;
    language: string;
    blocks: Array<{
        text: string;
        x: number;
        y: number;
        width: number;
        height: number;
    }>;
}

export interface OCREngine {
    recognize(asset: JobAsset, language?: string): Promise<OCRResult>;
}
