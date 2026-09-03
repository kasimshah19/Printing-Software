import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import type {
  AppSettings,
  CropSettings,
  ImageAdjustments,
  LayoutItem,
  LayoutMode,
  LayoutResult,
  PaperSettings,
  ProcessedImage,
  Rotation,
  Template,
  UploadedImage,
  CropMode,
} from "@/lib/types";
import { calculateLayout } from "@/lib/layout-engine";
import { getDefaultAdjustments, getDefaultCropSettings } from "@/lib/image-processing";
import { applyOrientation, getPaperSize } from "@/lib/templates/paper-sizes";
import { getBuiltInTemplate } from "@/lib/templates/built-in";
import { toMillimeters } from "@/lib/utils/units";
import { DEFAULT_SETTINGS, loadProject as loadProjectFromDb } from "@/lib/storage";
import { clampLayoutItem } from "@/lib/layout-engine/clamp";
import {
  getDefaultImageState,
  type ImageEditorState,
} from "@/lib/image-processing/image-state";
import { loadProjectIntoEditor } from "@/lib/project/load-project";
import {
  createSnapshot,
  MAX_HISTORY,
  snapshotsEqual,
  type EditorSnapshot,
} from "@/lib/history";

function buildInitialPaper(template: Template | null): PaperSettings {
  const paperId = template?.paperSettings?.id ?? "a4";
  const base = getPaperSize(paperId);
  const orientation = template?.paperSettings?.orientation ?? base.orientation;
  return applyOrientation({ ...base, orientation });
}

function positionsToItems(
  positions: LayoutResult["positions"],
  imageId?: string | null
): LayoutItem[] {
  return positions.map((pos) => ({ id: uuidv4(), imageId: imageId ?? undefined, ...pos }));
}

export function getProcessedUrl(
  processedImages: Record<string, string>,
  imageId?: string | null,
  fallbackId?: string | null
): string | null {
  if (imageId && processedImages[imageId]) return processedImages[imageId];
  if (fallbackId && processedImages[fallbackId]) return processedImages[fallbackId];
  const values = Object.values(processedImages);
  return values[0] ?? null;
}

function itemsToLayoutResult(items: LayoutItem[]): LayoutResult {
  if (items.length === 0) {
    return { columns: 0, rows: 0, totalItems: 0, positions: [] };
  }
  const widths = new Set(items.map((i) => i.x));
  const heights = new Set(items.map((i) => i.y));
  return {
    columns: widths.size,
    rows: heights.size,
    totalItems: items.length,
    positions: items.map(({ x, y, width, height }) => ({ x, y, width, height })),
  };
}

function snap(value: number, gridSize: number, enabled: boolean): number {
  if (!enabled || gridSize <= 0) return value;
  return Math.round(value / gridSize) * gridSize;
}

interface EditorState {
  template: Template | null;
  paper: PaperSettings;
  images: UploadedImage[];
  selectedImageId: string | null;
  cropSettings: CropSettings;
  adjustments: ImageAdjustments;
  processedImages: Record<string, string>;
  imageStates: Record<string, ImageEditorState>;
  cropMode: CropMode;
  layout: LayoutResult | null;
  layoutItems: LayoutItem[];
  layoutMode: LayoutMode;
  selectedLayoutItemId: string | null;
  snapToGrid: boolean;
  gridSize: number;
  projectName: string;
  customerName: string;
  currentProjectId: string | null;
  isProcessing: boolean;
  past: EditorSnapshot[];
  future: EditorSnapshot[];
  canUndo: boolean;
  canRedo: boolean;

  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
  setTemplate: (template: Template) => void;
  setPaper: (paper: PaperSettings) => void;
  addImage: (image: UploadedImage) => void;
  removeImage: (id: string) => void;
  duplicateImage: (id: string) => void;
  selectImage: (id: string) => void;
  setCropSettings: (settings: Partial<CropSettings>) => void;
  setAdjustments: (adjustments: Partial<ImageAdjustments>) => void;
  setProcessedImage: (imageId: string, url: string) => void;
  setCropMode: (mode: CropMode) => void;
  assignLayoutItemImage: (itemId: string, imageId: string) => void;
  loadProjectById: (id: string) => Promise<boolean>;
  setLayout: (layout: LayoutResult | null) => void;
  setLayoutItems: (items: LayoutItem[]) => void;
  setLayoutMode: (mode: LayoutMode) => void;
  selectLayoutItem: (id: string | null) => void;
  clearSelection: () => void;
  updateLayoutItem: (id: string, updates: Partial<LayoutItem>) => void;
  deleteLayoutItem: (id: string) => void;
  deleteSelectedLayoutItem: () => void;
  duplicateLayoutItem: (id: string) => void;
  duplicateSelectedLayoutItem: () => void;
  addLayoutItem: () => void;
  alignLayoutItems: (axis: "left" | "center" | "right" | "top" | "middle" | "bottom") => void;
  distributeLayoutItems: (axis: "horizontal" | "vertical") => void;
  setSnapToGrid: (enabled: boolean) => void;
  setGridSize: (size: number) => void;
  setProjectInfo: (name: string, customer?: string) => void;
  setIsProcessing: (value: boolean) => void;
  resetAdjustments: () => void;
  resetCrop: () => void;
  rotateCrop: () => void;
  computeLayout: () => LayoutResult | null;
  initFromTemplateId: (templateId: string) => void;
  getProcessedImage: () => ProcessedImage | null;
  reset: () => void;
}

function getHistorySlice(state: EditorState): EditorSnapshot {
  return createSnapshot({
    layoutItems: state.layoutItems,
    layoutMode: state.layoutMode,
    cropSettings: state.cropSettings,
    adjustments: state.adjustments,
    paper: state.paper,
    selectedLayoutItemId: state.selectedLayoutItemId,
    processedImages: state.processedImages,
    cropMode: state.cropMode,
  });
}

function applySnapshot(snapshot: EditorSnapshot): Partial<EditorState> {
  const layout = itemsToLayoutResult(snapshot.layoutItems);
  return {
    layoutItems: snapshot.layoutItems,
    layoutMode: snapshot.layoutMode,
    cropSettings: snapshot.cropSettings,
    adjustments: snapshot.adjustments,
    paper: snapshot.paper,
    selectedLayoutItemId: snapshot.selectedLayoutItemId,
    processedImages: snapshot.processedImages,
    cropMode: snapshot.cropMode,
    layout,
  };
}

export const useEditorStore = create<EditorState>((set, get) => ({
  template: null,
  paper: buildInitialPaper(null),
  images: [],
  selectedImageId: null,
  cropSettings: getDefaultCropSettings(35 / 45),
  adjustments: getDefaultAdjustments(),
  processedImages: {},
  imageStates: {},
  cropMode: "fixed",
  layout: null,
  layoutItems: [],
  layoutMode: "auto",
  selectedLayoutItemId: null,
  snapToGrid: true,
  gridSize: 1,
  projectName: "Untitled Project",
  customerName: "",
  currentProjectId: null,
  isProcessing: false,
  past: [],
  future: [],
  canUndo: false,
  canRedo: false,

  pushHistory: () => {
    const snapshot = getHistorySlice(get());
    set((state) => {
      const last = state.past[state.past.length - 1];
      if (last && snapshotsEqual(last, snapshot)) return state;
      const past = [...state.past, snapshot].slice(-MAX_HISTORY);
      return { past, future: [], canUndo: past.length > 0, canRedo: false };
    });
  },

  undo: () => {
    const state = get();
    if (state.past.length === 0) return;
    const current = getHistorySlice(state);
    const past = [...state.past];
    const snapshot = past.pop()!;
    set({
      past,
      future: [current, ...state.future].slice(0, MAX_HISTORY),
      ...applySnapshot(snapshot),
      canUndo: past.length > 0,
      canRedo: true,
    });
  },

  redo: () => {
    const state = get();
    if (state.future.length === 0) return;
    const current = getHistorySlice(state);
    const future = [...state.future];
    const snapshot = future.shift()!;
    set({
      past: [...state.past, current].slice(-MAX_HISTORY),
      future,
      ...applySnapshot(snapshot),
      canUndo: true,
      canRedo: future.length > 0,
    });
  },

  setTemplate: (template) => {
    get().pushHistory();
    const paper = buildInitialPaper(template);
    set({
      template,
      paper,
      cropSettings: getDefaultCropSettings(template.aspectRatio),
      layout: null,
      layoutItems: [],
      processedImages: {},
      layoutMode: "auto",
    });
  },

  setPaper: (paper) => {
    get().pushHistory();
    set({ paper, layout: null, layoutItems: [] });
  },

  addImage: (image) =>
    set((state) => ({
      images: [...state.images, image],
      selectedImageId: state.selectedImageId ?? image.id,
    })),

  removeImage: (id) => {
    get().pushHistory();
    set((state) => {
      const image = state.images.find((i) => i.id === id);
      if (image) URL.revokeObjectURL(image.objectUrl);
      const images = state.images.filter((i) => i.id !== id);
      const processedImages = { ...state.processedImages };
      delete processedImages[id];
      const imageStates = { ...state.imageStates };
      delete imageStates[id];
      return {
        images,
        imageStates,
        processedImages,
        selectedImageId:
          state.selectedImageId === id ? images[0]?.id ?? null : state.selectedImageId,
        layout: null,
        layoutItems: state.layoutItems.map((item) =>
          item.imageId === id ? { ...item, imageId: undefined } : item
        ),
      };
    });
  },

  duplicateImage: (id) =>
    set((state) => {
      const source = state.images.find((i) => i.id === id);
      if (!source) return state;
      const copy: UploadedImage = {
        ...source,
        id: uuidv4(),
        filename: `${source.filename} (copy)`,
        createdAt: new Date().toISOString(),
        objectUrl: source.objectUrl,
      };
      return { images: [...state.images, copy] };
    }),

  selectImage: (id) => {
    const state = get();
    if (state.selectedImageId) {
      set({
        imageStates: {
          ...state.imageStates,
          [state.selectedImageId]: {
            cropSettings: state.cropSettings,
            adjustments: state.adjustments,
          },
        },
      });
    }
    const saved = get().imageStates[id];
    const template = get().template;
    set({
      selectedImageId: id,
      cropSettings: saved?.cropSettings ?? getDefaultCropSettings(template?.aspectRatio ?? 35 / 45),
      adjustments: saved?.adjustments ?? getDefaultAdjustments(),
    });
  },

  setCropSettings: (settings) =>
    set((state) => ({
      cropSettings: { ...state.cropSettings, ...settings },
    })),

  setAdjustments: (adjustments) =>
    set((state) => ({
      adjustments: { ...state.adjustments, ...adjustments },
    })),

  setProcessedImage: (imageId, url) =>
    set((state) => ({
      processedImages: { ...state.processedImages, [imageId]: url },
    })),

  setCropMode: (mode) => set({ cropMode: mode }),

  assignLayoutItemImage: (itemId, imageId) => {
    get().pushHistory();
    set((state) => ({
      layoutItems: state.layoutItems.map((item) =>
        item.id === itemId ? { ...item, imageId } : item
      ),
      layoutMode: "manual",
    }));
  },

  loadProjectById: async (id) => {
    const project = await loadProjectFromDb(id);
    if (!project) return false;
    return loadProjectIntoEditor(project);
  },

  setLayout: (layout) =>
    set({
      layout,
      layoutItems: layout ? positionsToItems(layout.positions) : [],
    }),

  setLayoutItems: (items) => {
    set({
      layoutItems: items,
      layout: itemsToLayoutResult(items),
      layoutMode: "manual",
    });
  },

  setLayoutMode: (mode) => set({ layoutMode: mode }),

  selectLayoutItem: (id) => set({ selectedLayoutItemId: id }),

  clearSelection: () => set({ selectedLayoutItemId: null }),

  updateLayoutItem: (id, updates) => {
    const { snapToGrid, gridSize, paper, template } = get();
    set((state) => {
      const items = state.layoutItems.map((item) => {
        if (item.id !== id) return item;
        let next = { ...item, ...updates };
        if (updates.x !== undefined) next.x = snap(updates.x, gridSize, snapToGrid);
        if (updates.y !== undefined) next.y = snap(updates.y, gridSize, snapToGrid);
        if (updates.width !== undefined)
          next.width = Math.max(5, snap(updates.width, gridSize, snapToGrid));
        if (updates.height !== undefined)
          next.height = Math.max(5, snap(updates.height, gridSize, snapToGrid));
        next = clampLayoutItem(next, paper, true, template?.aspectRatio);
        return next;
      });
      return { layoutItems: items, layout: itemsToLayoutResult(items), layoutMode: "manual" };
    });
  },

  deleteLayoutItem: (id) => {
    get().pushHistory();
    set((state) => {
      const items = state.layoutItems.filter((i) => i.id !== id);
      return {
        layoutItems: items,
        layout: itemsToLayoutResult(items),
        selectedLayoutItemId:
          state.selectedLayoutItemId === id ? null : state.selectedLayoutItemId,
        layoutMode: "manual",
      };
    });
  },

  deleteSelectedLayoutItem: () => {
    const { selectedLayoutItemId } = get();
    if (selectedLayoutItemId) get().deleteLayoutItem(selectedLayoutItemId);
  },

  duplicateLayoutItem: (id) => {
    get().pushHistory();
    set((state) => {
      const source = state.layoutItems.find((i) => i.id === id);
      if (!source) return state;
      const copy: LayoutItem = {
        ...source,
        id: uuidv4(),
        x: source.x + 3,
        y: source.y + 3,
      };
      const items = [...state.layoutItems, copy];
      return {
        layoutItems: items,
        layout: itemsToLayoutResult(items),
        selectedLayoutItemId: copy.id,
        layoutMode: "manual",
      };
    });
  },

  duplicateSelectedLayoutItem: () => {
    const { selectedLayoutItemId } = get();
    if (selectedLayoutItemId) get().duplicateLayoutItem(selectedLayoutItemId);
  },

  addLayoutItem: () => {
    const { template, paper, selectedImageId } = get();
    if (!template) return;
    get().pushHistory();
    const itemWidth = toMillimeters(template.width, template.unit);
    const itemHeight = toMillimeters(template.height, template.unit);
    const newItem: LayoutItem = clampLayoutItem(
      {
        id: uuidv4(),
        x: paper.margins.left,
        y: paper.margins.top,
        width: itemWidth,
        height: itemHeight,
        imageId: selectedImageId ?? undefined,
      },
      paper,
      true,
      template.aspectRatio
    );
    set((state) => {
      const items = [...state.layoutItems, newItem];
      return {
        layoutItems: items,
        layout: itemsToLayoutResult(items),
        selectedLayoutItemId: newItem.id,
        layoutMode: "manual",
      };
    });
  },

  alignLayoutItems: (axis) => {
    const { selectedLayoutItemId, layoutItems } = get();
    if (!selectedLayoutItemId || layoutItems.length === 0) return;
    get().pushHistory();

    const selected = layoutItems.find((i) => i.id === selectedLayoutItemId);
    if (!selected) return;

    set((state) => {
      const items = state.layoutItems.map((item) => {
        switch (axis) {
          case "left":
            return { ...item, x: selected.x };
          case "center":
            return {
              ...item,
              x: selected.x + selected.width / 2 - item.width / 2,
            };
          case "right":
            return { ...item, x: selected.x + selected.width - item.width };
          case "top":
            return { ...item, y: selected.y };
          case "middle":
            return {
              ...item,
              y: selected.y + selected.height / 2 - item.height / 2,
            };
          case "bottom":
            return { ...item, y: selected.y + selected.height - item.height };
          default:
            return item;
        }
      });
      return { layoutItems: items, layout: itemsToLayoutResult(items), layoutMode: "manual" };
    });
  },

  distributeLayoutItems: (axis) => {
    const { layoutItems } = get();
    if (layoutItems.length < 3) return;
    get().pushHistory();

    set((state) => {
      const sorted = [...state.layoutItems].sort((a, b) =>
        axis === "horizontal" ? a.x - b.x : a.y - b.y
      );
      const first = sorted[0];
      const last = sorted[sorted.length - 1];
      const totalSpan =
        axis === "horizontal"
          ? last.x + last.width - first.x
          : last.y + last.height - first.y;
      const totalSize = sorted.reduce(
        (sum, item) => sum + (axis === "horizontal" ? item.width : item.height),
        0
      );
      const gap = (totalSpan - totalSize) / (sorted.length - 1);
      let cursor = axis === "horizontal" ? first.x : first.y;

      const positionMap = new Map<string, Partial<LayoutItem>>();
      for (const item of sorted) {
        positionMap.set(item.id, axis === "horizontal" ? { x: cursor } : { y: cursor });
        cursor += (axis === "horizontal" ? item.width : item.height) + gap;
      }

      const items = state.layoutItems.map((item) => ({
        ...item,
        ...positionMap.get(item.id),
      }));
      return { layoutItems: items, layout: itemsToLayoutResult(items), layoutMode: "manual" };
    });
  },

  setSnapToGrid: (enabled) => set({ snapToGrid: enabled }),
  setGridSize: (size) => set({ gridSize: Math.max(0.5, size) }),

  setProjectInfo: (name, customer) =>
    set({ projectName: name, customerName: customer ?? "" }),

  setIsProcessing: (value) => set({ isProcessing: value }),

  resetAdjustments: () => set({ adjustments: getDefaultAdjustments() }),

  resetCrop: () => {
    const { template } = get();
    set({
      cropSettings: getDefaultCropSettings(template?.aspectRatio ?? 35 / 45),
    });
  },

  rotateCrop: () => {
    const { cropSettings } = get();
    const next = ((cropSettings.rotation + 90) % 360) as Rotation;
    get().pushHistory();
    set({ cropSettings: { ...cropSettings, rotation: next } });
  },

  computeLayout: () => {
    const { template, paper, selectedImageId } = get();
    if (!template) return null;

    const oriented = applyOrientation(paper);
    const paperWidth = toMillimeters(oriented.width, oriented.unit);
    const paperHeight = toMillimeters(oriented.height, oriented.unit);
    const itemWidth = toMillimeters(template.width, template.unit);
    const itemHeight = toMillimeters(template.height, template.unit);

    const maxCopies =
      template.layoutSettings.copies === "auto"
        ? undefined
        : template.layoutSettings.copies;

    const result = calculateLayout({
      paperWidth,
      paperHeight,
      itemWidth,
      itemHeight,
      marginTop: paper.margins.top,
      marginRight: paper.margins.right,
      marginBottom: paper.margins.bottom,
      marginLeft: paper.margins.left,
      horizontalGap: template.layoutSettings.horizontalGap,
      verticalGap: template.layoutSettings.verticalGap,
      maxCopies,
    });

    const items = positionsToItems(result.positions, selectedImageId);
    get().pushHistory();
    set({ layout: result, layoutItems: items, layoutMode: "auto", selectedLayoutItemId: null });
    return result;
  },

  initFromTemplateId: (templateId) => {
    const template = getBuiltInTemplate(templateId);
    if (template) get().setTemplate(template);
  },

  getProcessedImage: () => {
    const { selectedImageId, cropSettings, adjustments, processedImages } = get();
    if (!selectedImageId) return null;
    return {
      imageId: selectedImageId,
      cropSettings,
      adjustments,
      processedBlobUrl: processedImages[selectedImageId],
    };
  },

  reset: () =>
    set((state) => {
      state.images.forEach((img) => URL.revokeObjectURL(img.objectUrl));
      return {
        template: null,
        paper: buildInitialPaper(null),
        images: [],
        selectedImageId: null,
        cropSettings: getDefaultCropSettings(35 / 45),
        adjustments: getDefaultAdjustments(),
        processedImages: {},
        imageStates: {},
        cropMode: "fixed",
        layout: null,
        layoutItems: [],
        layoutMode: "auto",
        selectedLayoutItemId: null,
        currentProjectId: null,
        projectName: "Untitled Project",
        customerName: "",
        isProcessing: false,
        past: [],
        future: [],
        canUndo: false,
        canRedo: false,
      };
    }),
}));

interface SettingsState {
  settings: AppSettings;
  loaded: boolean;
  setSettings: (settings: Partial<AppSettings>) => void;
  loadFromStorage: () => Promise<void>;
  saveToStorage: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  loaded: false,

  setSettings: (partial) =>
    set((state) => ({ settings: { ...state.settings, ...partial } })),

  loadFromStorage: async () => {
    const { loadSettings } = await import("@/lib/storage");
    const settings = await loadSettings();
    set({ settings, loaded: true });
  },

  saveToStorage: async () => {
    const { saveSettings } = await import("@/lib/storage");
    await saveSettings(get().settings);
  },
}));

interface ProjectState {
  recentProjects: import("@/lib/types").EditorProject[];
  loadRecent: () => Promise<void>;
  saveCurrent: () => Promise<string | null>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  recentProjects: [],

  loadRecent: async () => {
    const { loadRecentProjects } = await import("@/lib/storage");
    const recent = await loadRecentProjects();
    set({ recentProjects: recent });
  },

  saveCurrent: async () => {
    const editor = useEditorStore.getState();
    if (!editor.template || editor.images.length === 0) return null;

    const { saveProject, saveImageBlob } = await import("@/lib/storage");
    const { dataUrlToBlob } = await import("@/lib/image-processing/image-state");

    const id = editor.currentProjectId ?? (await import("uuid")).v4();
    const now = new Date().toISOString();
    const existing = editor.currentProjectId
      ? await loadProjectFromDb(editor.currentProjectId)
      : undefined;
    const imageBlobIds: Record<string, string> = {};
    const processedBlobIds: Record<string, string> = {};

    for (const image of editor.images) {
      const blobId = image.blobId ?? image.id;
      imageBlobIds[image.id] = blobId;
      try {
        const response = await fetch(image.objectUrl);
        const blob = await response.blob();
        await saveImageBlob(blobId, blob);
      } catch {
        /* skip failed blob save */
      }
    }

    const processedImagesList = Object.entries(editor.processedImages).map(
      ([imageId, dataUrl]) => {
        const blobId = `processed-${imageId}`;
        processedBlobIds[imageId] = blobId;
        return {
          imageId,
          cropSettings: editor.imageStates[imageId]?.cropSettings ?? editor.cropSettings,
          adjustments: editor.imageStates[imageId]?.adjustments ?? editor.adjustments,
          processedBlobUrl: dataUrl,
        };
      }
    );

    for (const [imageId, dataUrl] of Object.entries(editor.processedImages)) {
      const blobId = processedBlobIds[imageId];
      await saveImageBlob(blobId, dataUrlToBlob(dataUrl));
    }

    const project = {
      id,
      name: editor.projectName,
      customerName: editor.customerName,
      templateId: editor.template.id,
      paperSettings: editor.paper,
      layoutSettings: editor.template.layoutSettings,
      layoutItems: editor.layoutItems,
      layoutMode: editor.layoutMode,
      images: editor.images.map(({ objectUrl: _, ...meta }) => meta),
      processedImages: processedImagesList,
      imageBlobIds,
      processedBlobIds,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };

    await saveProject(project);
    useEditorStore.setState({ currentProjectId: id });
    await get().loadRecent();
    return id;
  },
}));
