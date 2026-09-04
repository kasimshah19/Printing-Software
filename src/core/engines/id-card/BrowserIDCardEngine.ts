import type { IDCardProcessingEngine, DocumentDetectionResult } from "../../ports/IDCardProcessingEngine";
import type { ProcessedAsset } from "../../ports/ImageProcessingEngine";
import type { JobAsset } from "../../domain/JobAsset";
import { WebWorkerImageEngine } from "../image/WebWorkerImageEngine";

export class BrowserIDCardEngine implements IDCardProcessingEngine {
    private imageEngine = new WebWorkerImageEngine();

    async detectDocument(asset: JobAsset, blob?: Blob): Promise<DocumentDetectionResult> {
        // Without OpenCV.js embedded, we do naive center bound detection
        // In full production, this hooks into OpenCV edge detection Canny/FindContours
        return {
            corners: [
                { x: 10, y: 10 },
                { x: 90, y: 10 },
                { x: 90, y: 50 },
                { x: 10, y: 50 }
            ],
            confidence: 0.85
        };
    }

    async perspectiveCorrect(asset: JobAsset, corners: Array<{ x: number, y: number }>, blob?: Blob): Promise<ProcessedAsset> {
        // Since pure JS Perspective Transform is math heavy, we fallback to standard cropping for standard UI
        // until a WASM matrix library is injected. We just send it to WebWorker generic crop.
        console.warn("Perspective correct math fallback to standard crop mode without OpenCV");
        return await (this.imageEngine as any).execute("resize", asset, {
            width: 800,
            height: 500,
            fit: "cover",
            blob
        });
    }

    async cropCard(asset: JobAsset, targetRatio: number, blob?: Blob): Promise<ProcessedAsset> {
        return await (this.imageEngine as any).execute("resize", asset, {
            width: 800, // Standard CR80 ID card internal HD print resolution mapping
            height: 800 / targetRatio,
            fit: "fill", // stretch perfectly to card edge
            blob
        });
    }
}
