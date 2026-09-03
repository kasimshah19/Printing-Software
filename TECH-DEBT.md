# TECHNICAL DEBT

Based on the Phase 0 Audit, the following architectural violations and tech debt items need to be resolved during the incremental refactoring (Phases 2-25):

1. **Tight Coupling of UI and Storage:**
   - Active: `src/app/settings/page.tsx` directly calls `exportBackup`, `clearAllData`. These should map to `BackupPort` and `AssetStorage`.
   
2. **Business Logic in React State (Zustand):**
   - Active: `useEditorStore` computes layout geometry directly in the store. Layout logic belongs in a pure `LayoutEngine` utility outside the state.

3. **Direct Integration of Specialized SDKs:**
   - Active: `pdf-lib` operations are scattered in `file-tools/page.tsx` and `pdf.ts`. This needs to be abstracted behind the `PDFEngine` port to allow for alternative engines (like WASM variations) without breaking UI.

4. **Hardcoded Presets:**
   - Active: Components often hard-code sizes (like `86x54mm` for ID cards). Must route through `PresetRegistry` (already defined in Phase 1).

5. **Lack of Centralized Error Handling:**
   - Active: `alert("Error downloading...")` and generic `try/catch` scattered globally. Needs to be caught and piped through the `Logger` and translated to `ApplicationError` variants.

6. **Missing Ingestion Pipeline:**
   - Active: File inputs directly convert files to blobl URLs and images. Must be rewritten as `<input> -> AssetSource -> ImportPipeline -> JobAsset`.
