export interface CloudUpload {
    blob: Blob;
    filename: string;
    metadata?: Record<string, any>;
}

export interface CloudObject {
    id: string;
    url: string;
    sizeBytes: number;
}

export interface CloudUsage {
    usedBytes: number;
    totalBytes?: number;
}

export interface CloudListOptions {
    prefix?: string;
    limit?: number;
}

export interface CloudStoragePort {
    authenticate(): Promise<void>;
    isAuthenticated(): Promise<boolean>;

    upload(asset: CloudUpload): Promise<CloudObject>;
    download(objectId: string): Promise<Blob>;
    delete(objectId: string): Promise<void>;

    list(options?: CloudListOptions): Promise<CloudObject[]>;
    getUsage(): Promise<CloudUsage>;
    disconnect(): Promise<void>;
}
