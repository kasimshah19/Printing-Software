export * from "./presets";
export type Unit = "mm" | "cm" | "in";

export type PaperOrientation = "portrait" | "landscape";

export type TemplateCategory = "id-card" | "photo" | "layout";

export type Rotation = 0 | 90 | 180 | 270;

export interface Dimensions {
  width: number;
  height: number;
  unit: Unit;
}

export interface Margins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface PaperSettings {
  id: string;
  name: string;
  width: number;
  height: number;
  unit: Unit;
  orientation: PaperOrientation;
  margins: Margins;
}

export interface CropSettings {
  aspectRatio: number | null;
  width: number | null;
  height: number | null;
  unit: Unit;
  rotation: Rotation;
  flipHorizontal: boolean;
  flipVertical: boolean;
  zoom: number;
  cropArea: CropArea | null;
}

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface LayoutSettings {
  horizontalGap: number;
  verticalGap: number;
  copies: number | "auto";
}

export type DocumentCategory =
  | "government_identity"
  | "government_document"
  | "financial"
  | "education"
  | "employment"
  | "healthcare"
  | "transport"
  | "postal"
  | "membership"
  | "photo"
  | "photo_sheet"
  | "layout"
  | "custom"
  | "id-card"; // keep legacy compatibility

export type SizeSource =
  | "OFFICIAL"
  | "ISO_STANDARD"
  | "STANDARD_DERIVED"
  | "COMMON_PRINT_FORMAT"
  | "CUSTOM"
  | "VERIFY_BEFORE_USE"
  | "HISTORICAL";

export interface Template {
  id: string;
  name: string;
  category: TemplateCategory | DocumentCategory;
  width: number;
  height: number;
  unit: Unit;
  aspectRatio: number;
  cropSettings: Partial<CropSettings>;
  paperSettings: Partial<PaperSettings>;
  layoutSettings: LayoutSettings;
  isBuiltIn: boolean;
  createdAt: string;
  updatedAt: string;
  // Specifications from Master Spec
  sizeSource?: SizeSource;
  verificationStatus?: "verified" | "unverified" | "configurable";
  sourceReference?: string;
  sides?: "single" | "front-back";
  tags?: string[];
}

export interface LayoutInput {
  paperWidth: number;
  paperHeight: number;
  itemWidth: number;
  itemHeight: number;
  marginTop: number;
  marginRight: number;
  marginBottom: number;
  marginLeft: number;
  horizontalGap: number;
  verticalGap: number;
  rotation?: Rotation;
  maxCopies?: number;
}

export interface LayoutPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface LayoutItem extends LayoutPosition {
  id: string;
  imageId?: string;
  rotation?: Rotation;
}

export type CropMode = "fixed" | "free";

export type LayoutMode = "auto" | "manual";

export interface LayoutResult {
  columns: number;
  rows: number;
  totalItems: number;
  positions: LayoutPosition[];
}

export interface ImageAdjustments {
  brightness: number;
  contrast: number;
  saturation: number;
  grayscale: boolean;
}

export interface UploadedImageMeta {
  id: string;
  filename: string;
  width: number;
  height: number;
  fileSize: number;
  mimeType: string;
  createdAt: string;
}

export interface UploadedImage extends UploadedImageMeta {
  objectUrl: string;
  blobId?: string;
}

export interface ProcessedImage {
  imageId: string;
  cropSettings: CropSettings;
  adjustments: ImageAdjustments;
  processedBlobUrl?: string;
}

export interface EditorProject {
  id: string;
  name: string;
  customerName?: string;
  templateId: string;
  paperSettings: PaperSettings;
  layoutSettings: LayoutSettings;
  layoutItems?: LayoutItem[];
  layoutMode?: LayoutMode;
  images: UploadedImageMeta[];
  processedImages: ProcessedImage[];
  imageBlobIds?: Record<string, string>;
  processedBlobIds?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface AppSettings {
  defaultDpi: number;
  defaultPaperId: string;
  defaultMargins: Margins;
  defaultSpacing: { horizontal: number; vertical: number };
  theme: "light" | "dark" | "system";
  language: "en" | "hi" | "mr";
  autosave: boolean;
  recentProjectCount: number;
  printInstructions: string;
  printerName: string;
  nextJobNumber: number;
  nextInvoiceNumber: number;
  businessName: string;
  businessAddress: string;
  businessPhone: string;
  taxRate: number;
  dataRetentionDays: number;
}

export type JobStatus = "pending" | "processing" | "ready" | "printing" | "printed" | "completed" | "cancelled" | "failed";

export interface PrintJob {
  id: string;
  jobNumber: number;
  customerId?: string;
  customerName: string;
  serviceName: string;
  templateId: string;
  projectId?: string;
  copies: number;
  pages: number;
  status: JobStatus;
  printerProfileId?: string;
  notes?: string;
  price?: number;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  id: string;
  service: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId?: string;
  customerName: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paid: boolean;
  paymentMethod?: string;
  createdAt: string;
  updatedAt: string;
}

export * from "./presets";

// --- Customer Management ---

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  jobIds: string[];
  totalSpent: number;
  visitCount: number;
  createdAt: string;
  lastVisit: string;
}

// --- Printer Profile ---

export interface PrinterProfile {
  id: string;
  name: string;
  paperSizeId: string;
  defaultDpi: number;
  colorMode: "color" | "bw" | "grayscale";
  margins: Margins;
  scale: number;
  orientation: PaperOrientation;
  calibration?: CalibrationProfile;
  isDefault: boolean;
  createdAt: string;
}

export interface CalibrationProfile {
  xOffset: number;
  yOffset: number;
  scaleX: number;
  scaleY: number;
}

// --- Quick Presets ---

export interface QuickPreset {
  id: string;
  name: string;
  icon: string;
  templateId: string;
  paperId: string;
  copies: number | "auto";
  printerProfileId?: string;
  isFavorite: boolean;
  sortOrder: number;
  createdAt: string;
}

// --- Feature Flags ---

export interface FeatureFlags {
  faceDetection: boolean;
  backgroundRemoval: boolean;
  ocr: boolean;
  qrUpload: boolean;
  hotFolder: boolean;
  cloudBackup: boolean;
  customerManagement: boolean;
  advancedBilling: boolean;
  printerProfiles: boolean;
  reports: boolean;
}

// --- Backup / Restore ---

export interface BackupData {
  version: string;
  exportedAt: string;
  templates: Template[];
  settings: AppSettings;
  customers: Customer[];
  printerProfiles: PrinterProfile[];
  presets: QuickPreset[];
  jobs?: PrintJob[];
  invoices?: Invoice[];
}

// --- Service Catalog for Billing ---

export interface ServiceItem {
  id: string;
  name: string;
  category: string;
  unit: string;
  price: number;
  taxable: boolean;
  active: boolean;
}
