import type { JobAsset } from "../domain/JobAsset";

export interface QRSessionOptions {
    expiresInSeconds?: number;
    maxFiles?: number;
    maxFileSizeMb?: number;
}

export type QRTransferStatus = "active" | "expired" | "completed" | "error";

export interface QRTransferSession {
    sessionId: string;
    joinUrl: string;
    qrCodeDataUrl: string;
    expiresAt: string;
    status: QRTransferStatus;
}

export interface QRTransferPort {
    createSession(options: QRSessionOptions): Promise<QRTransferSession>;
    getSessionStatus(sessionId: string): Promise<QRTransferStatus>;
    receiveAssets(sessionId: string): Promise<JobAsset[]>;
    closeSession(sessionId: string): Promise<void>;
}
