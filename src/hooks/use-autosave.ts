"use client";

import { useEffect, useRef } from "react";
import { useEditorStore, useProjectStore, useSettingsStore } from "@/store";

const AUTOSAVE_MS = 30000;

export function useAutosave() {
  const autosave = useSettingsStore((s) => s.settings.autosave);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!autosave) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(async () => {
      const editor = useEditorStore.getState();
      if (!editor.template || editor.images.length === 0) return;
      if (Object.keys(editor.processedImages).length === 0) return;
      await useProjectStore.getState().saveCurrent();
    }, AUTOSAVE_MS);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [autosave]);
}
