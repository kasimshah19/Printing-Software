export type VerificationStatus =
    | "OFFICIAL"
    | "ISO_STANDARD"
    | "STANDARD_DERIVED"
    | "COMMON_PRINT_FORMAT"
    | "CUSTOM"
    | "VERIFY_BEFORE_USE";

export interface Preset {
    id: string;
    name: string;
    category: "PhotoPreset" | "CardPreset" | "DocumentPreset" | "PrintPreset" | "PaperPreset" | "PrinterPreset";
    widthMm?: number;
    heightMm?: number;
    orientation?: "portrait" | "landscape";
    sides?: "single" | "front-back";
    cropMode?: "free" | "fixed-ratio" | "fixed-size" | "perspective";
    defaultDpi?: number;
    safeArea?: number;
    bleed?: number;
    verificationStatus?: VerificationStatus;
    sourceReference?: string;
    version?: string;
}

export interface PresetRegistry {
    get(id: string): Preset | undefined;
    getAll(category?: Preset['category']): Preset[];
    register(preset: Preset): void;
}
