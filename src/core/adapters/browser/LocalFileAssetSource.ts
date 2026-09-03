import type { AssetSource, AssetSourceCapabilities, ImportedAsset } from "../../ports/AssetSource";
import type { AssetSourceType } from "../../domain/JobAsset";

export class LocalFileAssetSource implements AssetSource {
    id = "local-file-picker";
    type: AssetSourceType = "LOCAL_FILE";

    async isAvailable(): Promise<boolean> {
        return typeof window !== "undefined" && typeof document !== "undefined";
    }

    capabilities(): AssetSourceCapabilities {
        return {
            supportsMultiple: true,
            supportsProgress: false,
            supportsCancellation: false,
            supportedMimeTypes: ["image/jpeg", "image/png", "image/webp", "application/pdf"]
        };
    }

    async import(): Promise<ImportedAsset[]> {
        return new Promise((resolve, reject) => {
            const input = document.createElement("input");
            input.type = "file";
            input.multiple = true;
            input.accept = this.capabilities().supportedMimeTypes.join(",");

            input.onchange = (e) => {
                const target = e.target as HTMLInputElement;
                const files = target.files;
                if (!files) {
                    resolve([]);
                    return;
                }

                const assets: ImportedAsset[] = [];
                for (let i = 0; i < files.length; i++) {
                    assets.push({
                        blob: files[i],
                        originalName: files[i].name
                    });
                }
                resolve(assets);
            };

            input.onerror = (err) => {
                reject(new Error("File selection failed"));
            };

            // Trigger the native file picker
            input.click();
        });
    }
}
