import type { PhotoProcessingEngine, FaceDetectionResult } from "../../ports/PhotoProcessingEngine";
import type { ProcessedAsset } from "../../ports/ImageProcessingEngine";
import type { JobAsset } from "../../domain/JobAsset";
import { WebWorkerImageEngine } from "../image/WebWorkerImageEngine";

export class BrowserPhotoEngine implements PhotoProcessingEngine {
    private imageEngine = new WebWorkerImageEngine();

    async detectFace(asset: JobAsset, blob?: Blob): Promise<FaceDetectionResult> {
        // In a real production ML environment we'd use @mediapipe/face_detection or face-api.js
        // Here we mock a central detection since ML binaries are excluded right now.
        return {
            facesFound: 1,
            boundingBoxes: [
                // Mock box exactly in the center representing a human face
                { x: 30, y: 20, width: 40, height: 40 }
            ]
        };
    }

    async autoCrop(asset: JobAsset, targetWidthMm: number, targetHeightMm: number, blob?: Blob): Promise<ProcessedAsset> {
        // Calculate standard passport ratios
        const ratio = targetWidthMm / targetHeightMm;

        // We defer to our underlying generic WebWorkerImageEngine for the actual pixel operations
        return await (this.imageEngine as any).execute("resize", asset, {
            // we maintain physical layout aspect ratio
            width: 600, // HD internal print resolution standard
            height: 600 / ratio,
            maintainAspectRatio: true,
            fit: "cover",
            blob
        });
    }

    async removeBackground(asset: JobAsset, blob?: Blob): Promise<ProcessedAsset> {
        // Requires heavy ML or background removal API block. 
        // Returning standard stub for clean architecture graceful degrade.
        throw new Error("Background removal native ML model requires Desktop Bridge or Cloud API");
    }

    async createPhotoSheet(asset: JobAsset, sheetSize: string, rows: number, cols: number, blob?: Blob): Promise<ProcessedAsset> {
        // Implementation for N-up layouts will eventually hit the Layout/Print engine
        throw new Error("Not implemented yet");
    }
}
