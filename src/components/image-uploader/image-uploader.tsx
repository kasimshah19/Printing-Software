"use client";

import { useCallback, useRef } from "react";
import { Upload, X, Copy } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { useEditorStore } from "@/store";
import { validateImageFile } from "@/lib/image-processing";
import { convertPdfToImages } from "@/lib/utils/pdf";
import { formatFileSize } from "@/lib/utils/units";
import { t } from "@/lib/i18n";
import { useSettingsStore } from "@/store";
import type { UploadedImage } from "@/lib/types";

async function fileToUploadedImage(file: File): Promise<UploadedImage> {
  const url = URL.createObjectURL(file);
  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("load failed"));
    img.src = url;
  });

  return {
    id: uuidv4(),
    filename: file.name,
    width: img.naturalWidth,
    height: img.naturalHeight,
    fileSize: file.size,
    mimeType: file.type,
    createdAt: new Date().toISOString(),
    objectUrl: url,
  };
}

export function ImageUploader({
  inputRef: externalInputRef,
  onFilesAdded,
}: {
  inputRef?: React.RefObject<HTMLInputElement | null>;
  onFilesAdded?: () => void;
}) {
  const internalRef = useRef<HTMLInputElement>(null);
  const inputRef = externalInputRef ?? internalRef;
  const addImage = useEditorStore((s) => s.addImage);
  const removeImage = useEditorStore((s) => s.removeImage);
  const duplicateImage = useEditorStore((s) => s.duplicateImage);
  const selectImage = useEditorStore((s) => s.selectImage);
  const images = useEditorStore((s) => s.images);
  const selectedImageId = useEditorStore((s) => s.selectedImageId);
  const language = useSettingsStore((s) => s.settings.language);

  const processFiles = useCallback(
    async (files: FileList | File[]) => {
      for (let file of Array.from(files)) {
        let filesToProcess: File[] = [file];

        if (file.type === "application/pdf") {
          try {
            filesToProcess = await convertPdfToImages(file);
          } catch (e) {
            alert(t("error.generic", language));
            continue;
          }
        }

        for (const f of filesToProcess) {
          const error = validateImageFile(f);
          if (error === "unsupported") {
            alert(t("error.unsupportedImage", language));
            continue;
          }
          if (error === "tooLarge") {
            alert(t("error.tooLarge", language));
            continue;
          }

          try {
            const image = await fileToUploadedImage(f);
            addImage(image);
            onFilesAdded?.();
          } catch {
            alert(t("error.generic", language));
          }
        }
      }
    },
    [addImage, language, onFilesAdded]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer.files.length) processFiles(e.dataTransfer.files);
    },
    [processFiles]
  );

  const onPaste = useCallback(
    (e: React.ClipboardEvent) => {
      const items = e.clipboardData.items;
      const files: File[] = [];
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) files.push(file);
        }
      }
      if (files.length) processFiles(files);
    },
    [processFiles]
  );

  return (
    <div className="space-y-4" onPaste={onPaste}>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center"
      >
        <Upload className="mb-3 h-10 w-10 text-slate-400" />
        <p className="font-medium text-slate-700">{t("uploader.dragDrop", language)}</p>
        <p className="mt-1 text-sm text-slate-500">{t("uploader.paste", language)}</p>
        <p className="mt-1 text-xs text-slate-400">{t("uploader.supported", language)}</p>
        <Button
          className="mt-4"
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="h-4 w-4" />
          {t("editor.upload", language)}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && processFiles(e.target.files)}
        />
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((img) => (
            <div
              key={img.id}
              className={`group relative overflow-hidden rounded-lg border-2 ${
                selectedImageId === img.id
                  ? "border-blue-500 ring-2 ring-blue-200"
                  : "border-slate-200"
              }`}
            >
              <button
                type="button"
                className="block w-full"
                onClick={() => selectImage(img.id)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.objectUrl}
                  alt={img.filename}
                  className="aspect-square w-full object-cover"
                />
              </button>
              <div className="space-y-1 p-2 text-xs">
                <p className="truncate font-medium">{img.filename}</p>
                <p className="text-slate-500">
                  {img.width}×{img.height}px · {formatFileSize(img.fileSize)}
                </p>
              </div>
              <div className="absolute right-1 top-1 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-7 w-7"
                  onClick={() => duplicateImage(img.id)}
                  title={t("editor.duplicate", language)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
                <Button
                  size="icon"
                  variant="destructive"
                  className="h-7 w-7"
                  onClick={() => removeImage(img.id)}
                  title={t("editor.delete", language)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
