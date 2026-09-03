import type { Unit, DocumentCategory, SizeSource } from "./index";

export type PresetCropMode =
    | "free"
    | "fixed-ratio"
    | "fixed-size"
    | "perspective";

export interface DocumentPreset {
    id: string;
    name: string;
    category: DocumentCategory;

    // Dimensions
    widthMm?: number;
    heightMm?: number;
    aspectRatio?: number;

    orientation: "portrait" | "landscape";
    sides: "single" | "front-back";

    // Specification Integrity
    sizeSource: SizeSource;
    sourceReference?: string;
    verificationStatus: "verified" | "unverified" | "configurable";

    // Editor Defaults
    defaultDpi: number;
    cropMode: PresetCropMode;
    defaultPaper: "A4" | "A5" | "4x6" | "5x7" | "LETTER" | "LEGAL" | "CUSTOM";

    // Feature Flags
    supportsBatch: boolean;
    supportsFrontBack: boolean;
    supportsPerspectiveCorrection: boolean;

    tags: string[];

    // Optional overrides for existing Engine (to seamlessly map to current Template type)
    layoutAutoFit?: boolean;
}
