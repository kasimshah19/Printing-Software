export interface FeatureFlags {
    qrUpload: boolean;
    hotFolder: boolean;
    scannerIntegration: boolean;
    cloudBackup: boolean;
    faceDetectionSync: boolean; // Optional: Sync face data across network
    advancedLogging: boolean;
}

export interface FeatureConfigPort {
    getFlags(): Promise<FeatureFlags>;
    setFlag<K extends keyof FeatureFlags>(key: K, value: FeatureFlags[K]): Promise<void>;
    isEnabled(key: keyof FeatureFlags): Promise<boolean>;
}
