export interface PrinterInfo {
    id: string;
    name: string;
    isDefault: boolean;
    status: "idle" | "printing" | "offline" | "error";
}

export interface PrinterCapabilities {
    color: boolean;
    duplex: boolean;
    maxDpi: number;
    supportedPaperSizes: string[];
}

export interface PrintJobPayload {
    jobId: string;
    documentBlob: Blob;
    copies: number;
    paperSizeId: string;
    printerId?: string;
}

export interface PrintResult {
    success: boolean;
    printJobId: string;
    message?: string;
}

export interface PrintPort {
    getPrinters(): Promise<PrinterInfo[]>;
    getCapabilities(printerId: string): Promise<PrinterCapabilities>;
    print(job: PrintJobPayload): Promise<PrintResult>;
    cancel(printJobId: string): Promise<void>;
}
