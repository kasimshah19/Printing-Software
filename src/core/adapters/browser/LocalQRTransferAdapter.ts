import type { JobAsset } from "../../domain/JobAsset";
import { ImportManager } from "../../application/ImportManager";

export interface QRUploadSessionState {
    id: string;
    joinUrl: string;
    token: string;
    expiresAt: string;
}

export type QRTransferStatus = "waiting" | "connected" | "uploading" | "completed" | "expired" | "error";

export class LocalQRTransferAdapter {

    static async createSession(): Promise<QRUploadSessionState> {
        const res = await fetch("/api/qr/session", { method: "POST" });
        if (!res.ok) throw new Error("Failed to create QR Session");
        const json = await res.json();

        // In dev, the host might be localhost but phone needs actual IP. 
        // We'll rely on the frontend injecting the window.location.origin
        const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";

        return {
            id: json.data.id,
            token: json.data.token,
            expiresAt: json.data.expiresAt,
            joinUrl: `${origin}/mobile-upload/${json.data.id}?token=${json.data.token}`
        };
    }

    static async pollStatus(sessionId: string): Promise<{ status: QRTransferStatus; count: number }> {
        const res = await fetch(`/api/qr/status/${sessionId}`);
        if (!res.ok) throw new Error("Failed to poll status");
        const json = await res.json();
        return {
            status: json.data.status,
            count: json.data.uploadedCount
        };
    }

    static async retrieveAssets(sessionId: string): Promise<JobAsset[]> {
        const res = await fetch(`/api/qr/download/${sessionId}`);
        if (!res.ok) throw new Error("Failed to retrieve files");

        const json = await res.json();
        const assets: JobAsset[] = [];

        for (const fileItem of json.files) {
            // fileItem has { name, size, mime, dataBase64 }
            const binaryString = atob(fileItem.dataBase64);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            const blob = new Blob([bytes], { type: fileItem.mime });

            const asset = await ImportManager.importAsset({
                blob,
                sourceType: "PHONE_QR",
                originalName: fileItem.name,
                sourceContext: { sessionId }
            });

            assets.push(asset);
        }

        return assets;
    }
}
