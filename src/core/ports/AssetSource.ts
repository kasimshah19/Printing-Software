import { AssetSourceType } from "../domain/JobAsset";

export interface AssetSourceCapabilities {
    allowsMultiple: boolean;
    maxFileSize: number;
    supportedMimeTypes: string[];
}

export interface AssetSource<ImportedAsset = any> {
    id: string;
    type: AssetSourceType;

    isAvailable(): Promise<boolean>;
    capabilities(): AssetSourceCapabilities;
    import(): Promise<ImportedAsset[]>;
    cancel?(): Promise<void>;
}
