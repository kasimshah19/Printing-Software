export type JobAssetType = "image" | "pdf" | "document" | "signature" | "id-card" | "photo";

export type AssetSourceType =
    | "LOCAL_FILE"
    | "DRAG_DROP"
    | "CLIPBOARD"
    | "CAMERA"
    | "SCANNER"
    | "PDF"
    | "PHONE_QR"
    | "HOT_FOLDER"
    | "CLOUD_IMPORT";

export interface StorageReference {
    id: string;
    provider: string; // e.g., 'indexeddb', 'localfs'
}

export interface JobAsset {
    id: string;
    type: JobAssetType;
    source: AssetSourceType;
    name: string;
    mimeType: string;
    sizeBytes: number;
    createdAt: string;
    metadata: Record<string, any>;
    storageRef: StorageReference;
    processingState: "pending" | "processing" | "ready" | "failed";
    originalAssetId?: string;
    parentAssetId?: string;
}
