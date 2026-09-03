import type { JobAsset, JobAssetType, AssetSourceType } from "../domain/JobAsset";
import { ApplicationError } from "../domain/Errors";

export interface RawInput {
    blob: Blob;
    sourceType: AssetSourceType;
    originalName: string;
    sourceContext?: Record<string, any>;
}

export class ImportManager {

    static async importAsset(input: RawInput): Promise<JobAsset> {
        const { blob, sourceType, originalName, sourceContext } = input;

        // 1. Validation
        const sizeBytes = blob.size;
        if (sizeBytes > 50 * 1024 * 1024) { // 50MB limit
            throw new ApplicationError("File exceeds maximum allowed size of 50MB", "FILE_TOO_LARGE");
        }

        // 2. MIME Detection
        const mimeType = blob.type || this.guessMimeType(originalName);
        const assetType = this.mapMimeToAssetType(mimeType);

        // 3. Fake Storage (In a real implementation, this would call AssetStoragePort)
        const storageRef = {
            id: crypto.randomUUID(),
            provider: "indexeddb"
        };

        // 4. Normalization to JobAsset
        const asset: JobAsset = {
            id: crypto.randomUUID(),
            type: assetType,
            source: sourceType,
            name: originalName,
            mimeType,
            sizeBytes,
            createdAt: new Date().toISOString(),
            metadata: { ...sourceContext },
            storageRef,
            processingState: "pending"
        };

        return asset;
    }

    private static guessMimeType(name: string): string {
        if (name.toLowerCase().endsWith(".pdf")) return "application/pdf";
        if (name.toLowerCase().endsWith(".png")) return "image/png";
        if (name.toLowerCase().endsWith(".jpg") || name.toLowerCase().endsWith(".jpeg")) return "image/jpeg";
        return "application/octet-stream";
    }

    private static mapMimeToAssetType(mime: string): JobAssetType {
        if (mime.includes("pdf")) return "pdf";
        if (mime.includes("image")) return "image";
        return "document";
    }
}
