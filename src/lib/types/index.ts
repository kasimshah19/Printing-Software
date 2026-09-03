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

export interface Template {
  id: string;
  name: string;
  category: TemplateCategory;
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
}

export type JobStatus = "pending" | "processing" | "printed" | "completed" | "cancelled";

export interface PrintJob {
  id: string;
  jobNumber: number;
  customerName: string;
  serviceName: string;
  templateId: string;
  projectId?: string;
  copies: number;
  status: JobStatus;
  notes?: string;
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
  customerName: string;
  items: InvoiceItem[];
  subtotal: number;
  total: number;
  paid: boolean;
  createdAt: string;
  updatedAt: string;
}
