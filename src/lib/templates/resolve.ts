import { getBuiltInTemplate } from "@/lib/templates/built-in";
import type { Template } from "@/lib/types";

export function resolveTemplate(id: string, userTemplates: Template[] = []): Template | undefined {
  return getBuiltInTemplate(id) ?? userTemplates.find((t) => t.id === id);
}
