import type { JobAsset } from "../domain/JobAsset";

export interface RenderedPage {
    blob: Blob;
    pageNumber: number;
    width: number;
    height: number;
}

// Extends JobAsset with PDF-specific fields
export interface PDFAsset extends JobAsset {
    type: "pdf";
    pageCount: number;
}

export interface PDFEngine {
    renderPage(asset: JobAsset, pageNumber: number, scale?: number): Promise<RenderedPage>;
    merge(assets: JobAsset[]): Promise<PDFAsset>;
    split(asset: JobAsset, pages: number[]): Promise<PDFAsset[]>;
    compress(asset: JobAsset, quality: "low" | "medium" | "high"): Promise<PDFAsset>;
}
