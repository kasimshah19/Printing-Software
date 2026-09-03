export interface ScannerDevice {
    id: string;
    name: string;
    isDefault: boolean;
}

export interface ScanOptions {
    dpi: number;
    colorMode: "color" | "grayscale" | "blackAndWhite";
    duplex: boolean;
}

export interface ScanResult {
    blob: Blob;
    mimeType: string;
    metadata: Record<string, any>;
}

export interface ScannerPort {
    getDevices(): Promise<ScannerDevice[]>;
    connect(deviceId: string): Promise<void>;
    scan(options: ScanOptions): Promise<ScanResult>;
    cancel(): Promise<void>;
    disconnect(): Promise<void>;
}
