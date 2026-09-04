import type { PDFEngine, PDFAsset, RenderedPage } from "../../ports/PDFEngine";
import type { JobAsset } from "../../domain/JobAsset";

export class BrowserPDFEngine implements PDFEngine {

    async renderPage(asset: JobAsset, pageNumber: number, scale: number = 1.5): Promise<RenderedPage> {
        // Full production uses pdf.js via WebWorker
        console.info(`[PDFEngine] Rasterizing page ${pageNumber} of ${asset.id}...`);

        await new Promise(r => setTimeout(r, 800));

        // Stubbed response for MVP UI layout
        const canvas = new OffscreenCanvas(800 * scale, 1131 * scale); // A4 approx
        const ctx = canvas.getContext("2d")!;
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "black";
        ctx.font = "40px Arial";
        ctx.fillText(`PDF Page ${pageNumber} Placeholder`, 50, 100);
        ctx.fillText(`Requires pdf.js WASM`, 50, 160);

        const blob = await canvas.convertToBlob({ type: "image/jpeg", quality: 0.9 });
        return {
            blob,
            pageNumber,
            width: canvas.width,
            height: canvas.height
        };
    }

    async merge(assets: JobAsset[]): Promise<PDFAsset> {
        // Uses pdf-lib in production
        throw new Error("PDF Merging requires pdf-lib injection.");
    }

    async split(asset: JobAsset, pages: number[]): Promise<PDFAsset[]> {
        throw new Error("PDF Splitting requires pdf-lib injection.");
    }

    async compress(asset: JobAsset, quality: "low" | "medium" | "high"): Promise<PDFAsset> {
        throw new Error("PDF Compression requires pdf-lib / Ghostscript webassembly.");
    }
}
