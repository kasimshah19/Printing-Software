# MODULE MAP

This document maps the existing application structure to the Target Architecture modules.

## 1. Photo Studio & ID Card Studio
- **Current:** `src/app/editor`, `src/components/crop-editor`
- **Target Feature:** `features/photo-studio`, `features/id-card-studio`
- **Underlying Engine:** `ImageProcessingEngine`, `PhotoProcessingEngine` (via Ports)

## 2. Document Studio & File Tools
- **Current:** `src/app/file-tools`, `src/lib/utils/pdf.ts`
- **Target Feature:** `features/document-studio`, `features/file-tools`
- **Underlying Engine:** `PDFEngine`, `DocumentProcessingEngine`

## 3. Print Studio
- **Current:** `src/app/print`, `src/components/layout-editor`, `src/components/print-preview`
- **Target Feature:** `features/print-studio`
- **Underlying Engine:** `PrintPort`, `SmartPacking`, `LayoutEngine`

## 4. Job Management
- **Current:** `src/app/page.tsx` (Recent Jobs), `src/app/jobs/page.tsx`
- **Target Feature:** `features/job-management`
- **Underlying Engine:** `JobRepository`, `EventBus`

## 5. Business Module
- **Current:** `src/app/billing`, `src/app/reports`, `src/app/customers`
- **Target Feature:** `features/business`
- **Underlying Engine:** `BillingRepository`, `ServiceRegistry`

## 6. Connectivity (P3 Features)
- **Current:** Stubs in `src/app/settings/page.tsx`
- **Target Feature:** `features/connectivity`
- **Underlying Engine:** `QRTransferPort`, `ScannerPort`, `HotFolderPort`, `ConnectivityManager`
