# ARCHITECTURE MAPPING

## System Overview
CyberCafe Print Studio is transitioning from a traditional React/Next.js layered architecture into a strict **Clean Architecture (Hexagonal Architecture / Ports and Adapters)**. 

### Existing Baseline
- **Framework:** Next.js 16 (App Router)
- **State Management:** Zustand (`useEditorStore`, `useSettingsStore`)
- **Storage:** IndexedDB via `idb` (`src/lib/storage`)
- **Styling:** Tailwind CSS + Radix UI
- **Processing:** `pdf-lib` for documents, native `Canvas API` for images.

### Target Architecture
Our core application will be agnostic of the UI and the underlying browser APIs.
1. **Presentation / UI (`src/app`, `src/components`)** 
   - Responsible for React components, rendering, and hotkeys.
2. **Application / Use Cases (`src/store`, `src/core/application`)**
   - Orchestrates the flows (e.g., Job normalization, Layout engine coordination).
3. **Domain Models (`src/core/domain`)**
   - Pure TypeScript definitions: `JobAsset`, `PresetRegistry`, `ApplicationError`.
4. **Ports (`src/core/ports`)**
   - Interfaces for external systems: `PrintPort`, `ScannerPort`, `AssetStorage`, `EventBus`.
5. **Adapters (`src/lib`)**
   - IndexedDB implementations of `AssetStorage`, Browser implementation of `PrintPort`, Mock adaptations of `Scanner/QR` ports.

## Architecture Boundaries
- **No Direct SDK usage in UI:** Component files (like `file-tools/page.tsx`) should not directly import `pdf-lib`. They should call an `Application` service.
- **Universal Asset Ingestion:** All files enter via an adapter, get validated, and become a normalized `JobAsset`.
