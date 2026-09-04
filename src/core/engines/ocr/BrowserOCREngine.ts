import type { OCREngine, OCRResult } from "../../ports/OCREngine";
import type { JobAsset } from "../../domain/JobAsset";

export class BrowserOCREngine implements OCREngine {
    async recognize(asset: JobAsset, language: string = "eng"): Promise<OCRResult> {
        // In full production, this integrates tesseract.js via WebWorker
        console.info(`[OCREngine] Simulating OCR for ${asset.id} using lang ${language}...`);

        // Simulating processing delay
        await new Promise(r => setTimeout(r, 1500));

        return {
            text: "Mocked OCR Text Extracted from Document. Requires Tesseract.js WASM binaries.",
            confidence: 0.92,
            language,
            blocks: [
                { text: "Mocked", x: 10, y: 10, width: 50, height: 20 },
                { text: "OCR Text", x: 70, y: 10, width: 80, height: 20 }
            ]
        };
    }
}
