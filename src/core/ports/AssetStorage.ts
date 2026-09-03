import type { StorageReference } from "../domain/JobAsset";

export interface AssetMetadata {
    originalName: string;
    mimeType: string;
    sizeBytes: number;
    width?: number;
    height?: number;
    createdAt: string;
    sourceType: string;
}

export interface AssetStorage {
    save(asset: Blob, metadata: AssetMetadata): Promise<StorageReference>;
    get(ref: StorageReference): Promise<Blob>;
    delete(ref: StorageReference): Promise<void>;
    exists(ref: StorageReference): Promise<boolean>;
    list(prefix?: string): Promise<StorageReference[]>;
    getMetadata(ref: StorageReference): Promise<AssetMetadata>;
}
