"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useEditorStore, useProjectStore } from "@/store";

export interface EditorShortcutHandlers {
  onUpload?: () => void;
  onSave?: () => void;
  onPrint?: () => void;
  onTabChange?: (tab: "upload" | "crop" | "layout") => void;
}

function isInputFocused() {
  const el = document.activeElement;
  if (!el) return false;
  const tag = el.tagName.toLowerCase();
  return tag === "input" || tag === "textarea" || tag === "select" || el.getAttribute("contenteditable") === "true";
}

export function useEditorShortcuts(handlers: EditorShortcutHandlers = {}) {
  const router = useRouter();
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const canUndo = useEditorStore((s) => s.canUndo);
  const canRedo = useEditorStore((s) => s.canRedo);
  const rotateCrop = useEditorStore((s) => s.rotateCrop);
  const deleteSelectedLayoutItem = useEditorStore((s) => s.deleteSelectedLayoutItem);
  const removeImage = useEditorStore((s) => s.removeImage);
  const selectedImageId = useEditorStore((s) => s.selectedImageId);
  const selectedLayoutItemId = useEditorStore((s) => s.selectedLayoutItemId);
  const clearSelection = useEditorStore((s) => s.clearSelection);
  const processedImages = useEditorStore((s) => s.processedImages);
  const hasProcessed = Object.keys(processedImages).length > 0;
  const layout = useEditorStore((s) => s.layout);

  const handleSave = useCallback(async () => {
    if (handlers.onSave) {
      handlers.onSave();
      return;
    }
    const id = await useProjectStore.getState().saveCurrent();
    if (id) alert("Project saved!");
  }, [handlers]);

  const handlePrint = useCallback(() => {
    if (handlers.onPrint) {
      handlers.onPrint();
      return;
    }
    if (hasProcessed && layout) {
      router.push("/print");
    }
  }, [handlers, hasProcessed, layout, router]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isInputFocused()) return;

      const mod = e.ctrlKey || e.metaKey;

      if (mod && e.key.toLowerCase() === "o") {
        e.preventDefault();
        handlers.onUpload?.();
        return;
      }

      if (mod && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleSave();
        return;
      }

      if (mod && e.key.toLowerCase() === "z" && e.shiftKey) {
        e.preventDefault();
        if (canRedo) redo();
        return;
      }

      if (mod && (e.key.toLowerCase() === "z" || e.key.toLowerCase() === "y")) {
        e.preventDefault();
        if (e.key.toLowerCase() === "y" || e.shiftKey) {
          if (canRedo) redo();
        } else if (canUndo) {
          undo();
        }
        return;
      }

      if (mod && e.key.toLowerCase() === "p") {
        e.preventDefault();
        handlePrint();
        return;
      }

      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedLayoutItemId) {
          e.preventDefault();
          deleteSelectedLayoutItem();
        } else if (selectedImageId) {
          e.preventDefault();
          removeImage(selectedImageId);
        }
        return;
      }

      if (e.key.toLowerCase() === "r" && !mod) {
        e.preventDefault();
        rotateCrop();
        return;
      }

      if (e.key.toLowerCase() === "c" && !mod) {
        e.preventDefault();
        handlers.onTabChange?.("crop");
        return;
      }

      if (e.key === "Escape") {
        clearSelection();
        return;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    handlers,
    undo,
    redo,
    canUndo,
    canRedo,
    rotateCrop,
    deleteSelectedLayoutItem,
    removeImage,
    selectedImageId,
    selectedLayoutItemId,
    clearSelection,
    handleSave,
    handlePrint,
  ]);
}

export const SHORTCUT_HINTS = [
  { keys: "Ctrl+O", action: "Upload" },
  { keys: "Ctrl+S", action: "Save" },
  { keys: "Ctrl+Z", action: "Undo" },
  { keys: "Ctrl+Shift+Z", action: "Redo" },
  { keys: "Delete", action: "Delete selected" },
  { keys: "R", action: "Rotate" },
  { keys: "C", action: "Crop mode" },
  { keys: "Ctrl+P", action: "Print" },
  { keys: "Esc", action: "Deselect" },
];
