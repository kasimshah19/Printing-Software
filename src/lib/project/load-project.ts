import type { EditorProject, UploadedImage } from "@/lib/types";
import { getBuiltInTemplate } from "@/lib/templates/built-in";
import { loadUserTemplates, loadImageBlob } from "@/lib/storage";
import { blobToDataUrl } from "@/lib/image-processing/image-state";
import { useEditorStore } from "@/store";

export async function loadProjectIntoEditor(project: EditorProject): Promise<boolean> {
  const builtIn = getBuiltInTemplate(project.templateId);
  const userTemplates = await loadUserTemplates();
  const template = builtIn ?? userTemplates.find((t) => t.id === project.templateId);
  if (!template) return false;

  const images: UploadedImage[] = [];
  const processedImages: Record<string, string> = {};

  for (const meta of project.images) {
    const blobId = project.imageBlobIds?.[meta.id] ?? meta.id;
    const blob = await loadImageBlob(blobId);
    const objectUrl = blob ? URL.createObjectURL(blob) : "";
    images.push({ ...meta, objectUrl, blobId });
  }

  for (const proc of project.processedImages) {
    const blobId = project.processedBlobIds?.[proc.imageId];
    if (blobId) {
      const blob = await loadImageBlob(blobId);
      if (blob) processedImages[proc.imageId] = await blobToDataUrl(blob);
    } else if (proc.processedBlobUrl) {
      processedImages[proc.imageId] = proc.processedBlobUrl;
    }
  }

  const firstProcessed = project.processedImages[0];

  useEditorStore.setState({
    template,
    paper: project.paperSettings,
    images,
    selectedImageId: images[0]?.id ?? null,
    cropSettings: firstProcessed?.cropSettings ?? useEditorStore.getState().cropSettings,
    adjustments: firstProcessed?.adjustments ?? useEditorStore.getState().adjustments,
    processedImages,
    layoutItems: project.layoutItems ?? [],
    layoutMode: project.layoutMode ?? "auto",
    layout: project.layoutItems?.length
      ? {
          columns: 0,
          rows: 0,
          totalItems: project.layoutItems.length,
          positions: project.layoutItems.map(({ x, y, width, height }) => ({
            x,
            y,
            width,
            height,
          })),
        }
      : null,
    projectName: project.name,
    customerName: project.customerName ?? "",
    currentProjectId: project.id,
    past: [],
    future: [],
    canUndo: false,
    canRedo: false,
  });

  return true;
}
