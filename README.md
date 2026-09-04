<div align="center">
  <img src="https://raw.githubusercontent.com/kasimshah19/Printing-Software/main/public/globe.svg" alt="CyberCafe Print Studio Logo" width="120" height="120" />
  <h1>CyberCafe Print Studio 🖨️</h1>
  <p><strong>An Enterprise-Grade, Offline-First Browser Operating System for Print Shops</strong></p>

  <p>
    <img src="https://img.shields.io/badge/Next.js-14-000000?style=for-the-badge&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
    <img src="https://img.shields.io/badge/Clean_Architecture-FF9900?style=for-the-badge&logo=awsorganizations&logoColor=white" alt="Clean Architecture" />
    <img src="https://img.shields.io/badge/IndexedDB-First-4B32C3?style=for-the-badge" alt="Offline First" />
  </p>
</div>

<hr />

## 🚨 The Problem: The Fragmented Print Shop Ecosystem

Modern print shops, cybercafes, and documentation centers suffer from a severely fragmented, chaotic workflow. When a customer walks in to get a passport photo, an Aadhaar card PVC print, or a document scan, operators are forced to juggle multiple disjointed applications:

1. **Dangerous File Ingestion:** Relying on WhatsApp Web or unencrypted USB drives to receive customer files exposes networks to malware and violates customer privacy.
2. **Context Switching:** Operators switch between Photoshop (for photo cropping), MS Word (for ID card formatting), and proprietary PDF tools (for document merging), wasting immense time per customer.
3. **Hardware Locking:** Legacy printing software is deeply tied to Windows Desktop APIs, making it impossible to scale horizontally or operate from modern lightweight clients (Chromebooks, Macs).
4. **UI Thread Blocking:** Heavy image processing typically locks up the browser/system, causing frustrating UX during batch processing.

---

## 💡 The Solution: A Unified Browser-Native Core

**CyberCafe Print Studio** is an architectural marvel designed to replace the entire software suite of a print shop using purely modern Web Technologies. 

It acts as a unified OS running entirely in the browser, offering a highly secure, offline-first pipeline that ingests customer files, mathematically crops and aligns photos, fixes perspectives on ID cards, and generates print-ready A4 packing sheets—all without a single piece of external software.

### ✨ Key Technical Highlights
- **Zero-Latency Ingestion:** Allows customers to directly drop files from their mobile phones via Local Network QR Codes, completely bypassing WhatsApp/Emails.
- **Web-Worker Image Engine:** Leverages isolated Background JS Threads (`OffscreenCanvas`) for heavy geometrical cropping and rotation. The main UI thread never drops a frame.
- **Stateless Capability UI:** Gracefully degrades functionality. If deployed to Vercel (stateless edge), it accurately disables Intranet-only features with intelligent UI feedback rather than blindly throwing crashes.
- **Offline-First Persistence:** Backed entirely by `IndexedDB`, meaning the shop keeps running even if the internet goes down.

---

## 🏗️ Architectural Mastery: Hexagonal (Clean) Architecture

This project is not just a UI; it is a meticulously crafted Domain-Driven Design (DDD) system. It strictly enforces the **Ports and Adapters (Hexagonal)** pattern to guarantee that business logic is completely isolated from UI and Infrastructure frameworks.

> **Why did I build it this way?** Because algorithms for Document OCR or Face Detection change constantly. By relying on interfaces (Ports), I can hot-swap a naive math-based Image Engine for a WebAssembly (WASM) OpenCV engine in the future without altering a single line of React UI code.

### The Flow: `UI ➡️ UseCase ➡️ Port ⬅️ Adapter`

*   **Core Domain:** Entities like `JobAsset`, `PrintJob`, and `Customer` live purely in Typescript logic, oblivious to React.
*   **Ports (Interfaces):** Contracts like `ImageProcessingEngine.ts`, `AssetSource.ts`, and `Repositories.ts` dictate *what* the system can do.
*   **Adapters (Infrastructure):** 
    *   `IDBAssetRepository` maps Data saving to the browser's IndexedDB.
    *   `WebWorkerImageEngine` implements non-blocking pixel manipulation.
    *   `LocalFileAssetSource` handles File System Access APIs.

---

## ⚙️ Technology Stack

| Capability | Technology | Justification for Selection |
| :--- | :--- | :--- |
| **Framework** | Next.js 14 (App Router) | High-performance routing, built-in layout trees, and server/client hydration boundary control. |
| **Language** | TypeScript | Strict static typing for complex data pipelines ensuring 0 runtime `undefined` faults. |
| **Styling** | Tailwind CSS + Lucide | Utility-first architecture allowing lightning-fast, highly consistent premium UI builds. |
| **State & Storage** | IndexedDB via `idb` | Secure, local, offline-first persistence eliminating reliance on SQL databases for local shop queues. |
| **Multithreading** | Web Workers | Heavy tasks (Rotation, PDF Rasterization) shifted off the main UI thread to guarantee 60FPS UI. |

---

## 🚀 Core Studio Modules

### 1. 📡 Connectivity Center
Replaces USBs and WhatsApp. Customers scan a dynamically generated local IP QR Code to securely transmit files directly into the shop's IndexedDB instance over the local Intranet.

### 2. 📷 Photo Studio (Auto-Crop Engine)
Replaces manual Photoshop cropping. Automatically calculates Passport Standard aspect ratios (35x45mm) and proxies non-destructive resizing to the Background WebWorker thread.

### 3. 🪪 ID Card Studio (Perspective Warp)
A dual-sided engine explicitly designed for Aadhaar, PAN, and Voter IDs. Upload front and back scans independently to stitch them into a precise CR80 PVC Card layout.

### 4. 📄 Document Studio (OCR & Formatting)
Brings built-in PDF Rasterization parsing and Optical Character Recognition (OCR) stubs seamlessly into the browser, replacing bloated third-party PDF splitting tools.

---

## 💻 Getting Started (Local Development)

To witness the full potential of the Local Intranet features (like the Phone QR Sync), run the project locally:

```bash
# 1. Clone the repository
git clone https://github.com/kasimshah19/Printing-Software.git

# 2. Navigate into the directory
cd Printing-Software

# 3. Install dependencies
npm install

# 4. Start the local server
npm run dev

# 5. Open http://localhost:3000 in your browser
```

> **Note on Cloud Demployments (e.g., Vercel):**
> If you view the live Vercel deployment, stateful Intranet features (like Phone QR Upload) will automatically display a "Local PC Required" badge, showcasing the app's capability-aware graceful degradation to handle serverless boundaries!

---

<div align="center">
  <p>Architected and Developed with 💻 by <b>Kasim Shah</b>.</p>
  <p>Ready for Enterprise Production.</p>
</div>
