export interface BackupReference {
    id: string;
    path: string;
    timestamp: string;
}

export interface BackupOptions {
    includeDatabase?: boolean;
    includeAssets?: boolean;
    includeTemplates?: boolean;
    includeSettings?: boolean;
}

export interface BackupResult {
    reference: BackupReference;
    sizeBytes: number;
}

export interface RestoreResult {
    success: boolean;
    itemsRestored: number;
    errors?: string[];
}

export interface BackupValidationResult {
    isValid: boolean;
    errors?: string[];
    versionMismatch?: boolean;
}

export interface BackupPort {
    createBackup(options: BackupOptions): Promise<BackupResult>;
    restoreBackup(backup: BackupReference): Promise<RestoreResult>;
    validateBackup(backup: BackupReference): Promise<BackupValidationResult>;
}
