export type AppEvent =
    | { type: "AssetImported"; payload: { assetId: string; source: string } }
    | { type: "AssetValidated"; payload: { assetId: string } }
    | { type: "AssetProcessingStarted"; payload: { assetId: string; processType: string } }
    | { type: "AssetProcessingCompleted"; payload: { assetId: string; resultAssetId: string } }
    | { type: "JobCreated"; payload: { jobId: string } }
    | { type: "JobUpdated"; payload: { jobId: string; status: string } }
    | { type: "JobQueued"; payload: { jobId: string } }
    | { type: "JobPrinted"; payload: { jobId: string } }
    | { type: "JobCompleted"; payload: { jobId: string } }
    | { type: "JobFailed"; payload: { jobId: string; error: string } }
    | { type: "QRSessionCreated"; payload: { sessionId: string } }
    | { type: "QRAssetReceived"; payload: { sessionId: string; assetCount: number } }
    | { type: "HotFolderFileDetected"; payload: { path: string } }
    | { type: "ScannerScanCompleted"; payload: { deviceId: string } }
    | { type: "BackupStarted"; payload: { type: string } }
    | { type: "BackupCompleted"; payload: { type: string; url: string } }
    | { type: "BackupFailed"; payload: { type: string; error: string } };

export type EventHandler<T extends AppEvent['type']> = (
    event: Extract<AppEvent, { type: T }>
) => void | Promise<void>;

export interface EventBus {
    publish(event: AppEvent): void;
    subscribe<T extends AppEvent['type']>(type: T, handler: EventHandler<T>): () => void;
}
