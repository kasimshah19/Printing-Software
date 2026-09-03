import type { HotFolderConfig, HotFolderPort, HotFolderStatus } from "../../ports/HotFolderPort";
import { ImportManager } from "../../application/ImportManager";
import { JobAsset } from "../../domain/JobAsset";

export class FileSystemHotFolderAdapter implements HotFolderPort {
    private activeIntervals: Record<string, NodeJS.Timeout> = {};
    private knownFiles: Record<string, Set<string>> = {};
    private directoryHandles: Record<string, any> = {}; // FileSystemDirectoryHandle (Any to bypass TS strict lib issues if not enabled)
    private status: HotFolderStatus = "stopped";
    private configs: Record<string, HotFolderConfig> = {};

    async registerFolder(config: HotFolderConfig): Promise<void> {
        this.configs[config.id] = config;
        this.knownFiles[config.id] = new Set<string>();
    }

    async unregisterFolder(id: string): Promise<void> {
        await this.stopFolder(id);
        delete this.configs[id];
        delete this.knownFiles[id];
        delete this.directoryHandles[id];
    }

    async listFolders(): Promise<HotFolderConfig[]> {
        return Object.values(this.configs);
    }

    // Request user permission for a specific folder
    async attachDirectoryHandle(id: string, handle: any): Promise<void> {
        this.directoryHandles[id] = handle;
    }

    async start(): Promise<void> {
        if (this.status === "active") return;
        this.status = "active";
        for (const id of Object.keys(this.configs)) {
            this.startFolder(id);
        }
    }

    async stop(): Promise<void> {
        this.status = "stopped";
        for (const id of Object.keys(this.activeIntervals)) {
            this.stopFolder(id);
        }
    }

    async getStatus(): Promise<HotFolderStatus> {
        return this.status;
    }

    private startFolder(id: string) {
        if (this.activeIntervals[id]) return;
        const config = this.configs[id];
        const handle = this.directoryHandles[id];

        if (!handle) {
            console.warn(`Cannot start Hot Folder monitor for ${id}: missing directory handle.`);
            return;
        }

        this.activeIntervals[id] = setInterval(() => this.pollDirectory(id), config.debounceMs || 2000);
    }

    private stopFolder(id: string) {
        if (this.activeIntervals[id]) {
            clearInterval(this.activeIntervals[id]);
            delete this.activeIntervals[id];
        }
    }

    private async pollDirectory(id: string) {
        try {
            const handle = this.directoryHandles[id];
            const config = this.configs[id];
            const known = this.knownFiles[id];

            // Ensure permission is still valid
            const permission = await handle.queryPermission({ mode: 'read' });
            if (permission !== 'granted') {
                this.stopFolder(id);
                console.error(`Lost permission for Hot Folder ${id}`);
                return;
            }

            // iterate directory
            for await (const entry of handle.values()) {
                if (entry.kind === "file") {
                    if (!known.has(entry.name)) {
                        // Check extension
                        const ext = entry.name.split('.').pop()?.toLowerCase();
                        if (!config.allowedExtensions.length || (ext && config.allowedExtensions.includes(ext))) {
                            known.add(entry.name);
                            await this.processNewFile(id, entry);
                        }
                    }
                }
            }
        } catch (err) {
            console.error("Hot Folder Polling Error:", err);
        }
    }

    private async processNewFile(folderId: string, fileHandle: any) {
        try {
            const file: File = await fileHandle.getFile();

            // 23. HOT FOLDER PROCESSING PIPELINE
            const asset = await ImportManager.importAsset({
                blob: file,
                sourceType: "HOT_FOLDER",
                originalName: file.name,
                sourceContext: { folderId }
            });

            // Fire an event (ideally through an EventBus)
            console.log(`HotFolder: Imported ${file.name} as JobAsset ${asset.id}`);

        } catch (err) {
            console.error(`Failed to ingest HotFolder file:`, err);
        }
    }
}

// Global Singleton for Local State
const globalForHotFolder = global as unknown as { HotFolderAdapter: FileSystemHotFolderAdapter };
export const HotFolderAdapter = globalForHotFolder.HotFolderAdapter || new FileSystemHotFolderAdapter();
if (process.env.NODE_ENV !== "production") globalForHotFolder.HotFolderAdapter = HotFolderAdapter;
