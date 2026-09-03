import type { FeatureFlags } from "@/lib/types";

/**
 * Central feature flags configuration.
 * Controls which modules/features are enabled in the application.
 * Set experimental features to false until they are production-ready.
 */
export const FEATURE_FLAGS: FeatureFlags = {
    // Stage 2 - Smart Processing
    faceDetection: true,
    backgroundRemoval: true,

    // Stage 3 - Document Studio (future)
    ocr: false,

    // Stage 7 - Connectivity (future)
    qrUpload: false,
    hotFolder: false,

    // Stage 8 - Cloud (future)
    cloudBackup: false,

    // Active Modules
    customerManagement: true,
    advancedBilling: true,
    printerProfiles: true,
    reports: true,
};

/**
 * Check if a feature is enabled.
 */
export function isFeatureEnabled(flag: keyof FeatureFlags): boolean {
    return FEATURE_FLAGS[flag] ?? false;
}
