import type { AssetSourceType } from "../domain/JobAsset";

export interface AssetSourceCapabilities {
    supportsMultiple: boolean;
    supportsProgress: boolean;
    supportsCancellation: boolean;
    supportedMimeTypes: string[];
}

export interface ImportedAsset {
    blob: Blob;
    originalName: string;
    sourceContext?: Record<string, any>;
}

export interface AssetSource {
    id: string;
    type: AssetSourceType;

    isAvailable(): Promise<boolean>;
    capabilities(): AssetSourceCapabilities;

    // Abstract import workflow trigger
    import(): Promise<ImportedAsset[]>;

    cancel?(): Promise<void>;
}
