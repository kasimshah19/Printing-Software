import type { JobAsset } from "../domain/JobAsset";

export interface ProcessedAsset {
    blob: Blob;
    mimeType: string;
    metadata: Record<string, any>;
}

export interface ImageProcessingEngine {
    resize(options: any): Promise<ProcessedAsset>;
    crop(options: any): Promise<ProcessedAsset>;
    rotate(options: any): Promise<ProcessedAsset>;
    compress(options: any): Promise<ProcessedAsset>;
    enhance(options: any): Promise<ProcessedAsset>;
}

export interface PhotoProcessingEngine {
    detectFace(asset: JobAsset): Promise<any>;
    autoCrop(asset: JobAsset): Promise<ProcessedAsset>;
    removeBackground(asset: JobAsset): Promise<ProcessedAsset>;
    createPhotoSheet(asset: JobAsset): Promise<ProcessedAsset>;
}

export interface IDCardProcessingEngine {
    detectDocument(asset: JobAsset): Promise<any>;
    perspectiveCorrect(asset: JobAsset): Promise<ProcessedAsset>;
    cropCard(asset: JobAsset): Promise<ProcessedAsset>;
}

export interface PDFEngine {
    renderPage(asset: JobAsset, pageNum: number): Promise<any>;
    merge(assets: JobAsset[]): Promise<any>;
    split(asset: JobAsset): Promise<any[]>;
    compress(asset: JobAsset): Promise<any>;
}

export interface OCREngine {
    recognize(asset: JobAsset): Promise<any>;
}
