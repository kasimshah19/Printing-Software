export interface HotFolderConfig {
    id: string;
    path: string;
    allowedExtensions: string[];
    debounceMs: number;
}

export type HotFolderStatus = "active" | "error" | "stopped";

export interface HotFolderPort {
    registerFolder(config: HotFolderConfig): Promise<void>;
    unregisterFolder(id: string): Promise<void>;
    listFolders(): Promise<HotFolderConfig[]>;
    start(): Promise<void>;
    stop(): Promise<void>;
    getStatus(): Promise<HotFolderStatus>;
}
