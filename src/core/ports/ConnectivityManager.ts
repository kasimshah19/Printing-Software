import type { AssetSource } from "./AssetSource";

export type CapabilityStatus =
    | "available"
    | "unavailable"
    | "unsupported"
    | "not-configured"
    | "permission-required"
    | "offline"
    | "error";

export interface ConnectivityCapabilities {
    phoneUpload: CapabilityStatus;
    hotFolder: CapabilityStatus;
    scanner: CapabilityStatus;
    cloudBackup: CapabilityStatus;
}

export interface ConnectivityStatus {
    activeSessions: number;
    lastEvent: string;
}

export interface ConnectivityManager {
    getSources(): AssetSource[];
    getCapabilities(): ConnectivityCapabilities;
    start(): Promise<void>;
    stop(): Promise<void>;
    getStatus(): ConnectivityStatus;
}
