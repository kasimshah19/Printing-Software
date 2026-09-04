import type { ImageProcessingEngine, ProcessedAsset, ResizeOptions, CropOptions } from "../../ports/ImageProcessingEngine";
import type { JobAsset } from "../../domain/JobAsset";
import { IDBAssetRepository } from "../../infrastructure/IndexedDBRepositories";

export class WebWorkerImageEngine implements ImageProcessingEngine {
    private worker: Worker | null = null;
    private callbacks: Map<string, { resolve: Function, reject: Function }> = new Map();
    private msgId = 0;

    constructor() {
        if (typeof window !== "undefined") {
            // Initiate worker from the script path.
            // Vite/NextJS handles new Worker(new URL('...', import.meta.url)) bundling.
            // For NextJS app router specifically, we might need a public script or a special loader.
            // We use simple blob URL string wrapping to bypass bundling issues in legacy environments that break Webpack if needed, 
            // but Next 13+ supports new URL directly if we were in client scope.
            // A safer cross-platform dynamic worker initialization:

            this.initWorker();
        }
    }

    private async initWorker() {
        const response = await fetch('/image-worker.js'); // Assuming we will compile worker.ts to public/image-worker.js
        // Wait, for NextJS to bundle it inline nicely without a public eject:
    }

    // A safer inline web worker without ejecting to public:
    private getWorker(): Worker {
        if (!this.worker) {
            // Define purely inline for NextJS zero-config support:
            // Notice: the worker code is stringified here for robust compatibility without ejecting files
            const workerCode = `
                self.onmessage = async (e) => {
                    const { id, action, blob, options } = e.data;
                    try {
                        const imageBitmap = await createImageBitmap(blob);
                        let resultBlob;
                        let width = imageBitmap.width;
                        let height = imageBitmap.height;

                        if (action === "resize") {
                            let targetW = options.width || width;
                            let targetH = options.height || height;
                            
                            if (options.maintainAspectRatio) {
                                const aspect = width / height;
                                if (options.width && !options.height) targetH = targetW / aspect;
                                else if (options.height && !options.width) targetW = targetH * aspect;
                            }

                            const canvas = new OffscreenCanvas(targetW, targetH);
                            const ctx = canvas.getContext("2d");
                            if (options.fit === "cover") {
                                const scale = Math.max(targetW / width, targetH / height);
                                const x = (targetW / scale - width) / 2;
                                const y = (targetH / scale - height) / 2;
                                ctx.scale(scale, scale);
                                ctx.drawImage(imageBitmap, x, y);
                            } else {
                                ctx.drawImage(imageBitmap, 0, 0, targetW, targetH);
                            }
                            resultBlob = await canvas.convertToBlob({ type: blob.type, quality: 1 });
                            width = targetW;
                            height = targetH;
                        } 
                        else if (action === "crop") {
                            const canvas = new OffscreenCanvas(options.width, options.height);
                            const ctx = canvas.getContext("2d");
                            ctx.drawImage(
                                imageBitmap, 
                                options.x, options.y, options.width, options.height, 
                                0, 0, options.width, options.height
                            );
                            resultBlob = await canvas.convertToBlob({ type: blob.type, quality: 1 });
                            width = options.width;
                            height = options.height;
                        }
                        else if (action === "rotate") {
                            const rads = (options.degrees * Math.PI) / 180;
                            const sin = Math.abs(Math.sin(rads));
                            const cos = Math.abs(Math.cos(rads));
                            const newW = Math.floor(width * cos + height * sin);
                            const newH = Math.floor(height * cos + width * sin);
                            const canvas = new OffscreenCanvas(newW, newH);
                            const ctx = canvas.getContext("2d");
                            ctx.translate(newW / 2, newH / 2);
                            ctx.rotate(rads);
                            ctx.drawImage(imageBitmap, -width / 2, -height / 2);
                            resultBlob = await canvas.convertToBlob({ type: blob.type, quality: 1 });
                            width = newW;
                            height = newH;
                        }
                        else if (action === "compress" || action === "formatConversion") {
                            const canvas = new OffscreenCanvas(width, height);
                            const ctx = canvas.getContext("2d");
                            ctx.drawImage(imageBitmap, 0, 0);
                            const targetType = action === "formatConversion" ? options.targetMimeType : blob.type;
                            const quality = action === "compress" ? options.quality : 1.0;
                            resultBlob = await canvas.convertToBlob({ type: targetType, quality });
                        }
                        else {
                            throw new Error("Unknown action type");
                        }
                        self.postMessage({ id, success: true, blob: resultBlob, width, height, mimeType: resultBlob.type });
                    } catch (err) {
                        self.postMessage({ id, success: false, error: err.message });
                    }
                };
            `;
            const blob = new Blob([workerCode], { type: "application/javascript" });
            this.worker = new Worker(URL.createObjectURL(blob));
            this.worker.onmessage = (e) => {
                const { id, success, error, blob, width, height, mimeType } = e.data;
                const cb = this.callbacks.get(id);
                if (cb) {
                    if (success) cb.resolve({ blob, width, height, mimeType });
                    else cb.reject(new Error(error));
                    this.callbacks.delete(id);
                }
            };
        }
        return this.worker;
    }

    private async execute(action: string, asset: JobAsset, options: any): Promise<ProcessedAsset> {
        return new Promise(async (resolve, reject) => {
            const id = `msg_${this.msgId++}`;
            this.callbacks.set(id, { resolve, reject });

            // To fetch the blob of the asset from storage:
            // Placeholder: Assume IDBAssetRepository is handling Blobs via IDB
            // Currently, JobAsset only holds metadata, so we need to hit AssetStoragePort to fetch it
            try {
                const repo = new IDBAssetRepository(); // just for fake local resolving demo
                const meta = await repo.get(asset.id);
                if (!meta) throw new Error("Asset missing");

                // In production, we'd hit IDB Asset Storage directly here to reconstruct the File object 
                // We will mock blob resolution temporarily until AssetStorage is wired fully
                const blob = new Blob([]);

                this.getWorker().postMessage({ id, action, blob, options });
            } catch (e) {
                reject(e);
                this.callbacks.delete(id);
            }
        });
    }

    async resize(asset: JobAsset, options: ResizeOptions): Promise<ProcessedAsset> {
        return this.execute("resize", asset, options);
    }

    async crop(asset: JobAsset, options: CropOptions): Promise<ProcessedAsset> {
        return this.execute("crop", asset, options);
    }

    async rotate(asset: JobAsset, degrees: number): Promise<ProcessedAsset> {
        return this.execute("rotate", asset, { degrees });
    }

    async compress(asset: JobAsset, quality: number): Promise<ProcessedAsset> {
        return this.execute("compress", asset, { quality });
    }

    async formatConversion(asset: JobAsset, targetMimeType: string): Promise<ProcessedAsset> {
        return this.execute("formatConversion", asset, { targetMimeType });
    }
}
