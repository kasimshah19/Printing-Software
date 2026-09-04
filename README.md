<div align="center">
  <img src="https://raw.githubusercontent.com/kasimshah19/Printing-Software/main/public/globe.svg" alt="CyberCafe Print Studio Logo" width="120" height="120" />
  <h1>CyberCafe Print Studio 🖨️</h1>
  <p><strong>An Enterprise-Grade, Offline-First Browser Operating System for Print Shops</strong></p>

  <p>
    <img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
    <img src="https://img.shields.io/badge/Hexagonal_Architecture-FF9900?style=for-the-badge&logo=awsorganizations&logoColor=white" alt="Clean Architecture" />
    <img src="https://img.shields.io/badge/IndexedDB-First-4B32C3?style=for-the-badge" alt="Offline First" />
  </p>
</div>

<br/>

## 📊 Project Overview

| Metric | Details |
| :--- | :--- |
| **Project Name** | CyberCafe Print Studio |
| **Live Project Link** | [**https://printing-software.vercel.app**](https://printing-software.vercel.app) |
| **Developer** | [**Kasim Shah**](https://github.com/kasimshah19) |
| **Core Concept** | Replacing desktop print-shop software with an offline-first browser OS system. |
| **Architecture** | Hexagonal Architecture (Ports/Adapters), Domain-Driven Design (DDD). |
| **Key Technologies** | React (Next.js), TypeScript, IndexedDB, Web Workers (OffscreenCanvas). |

---

## 🚨 The Industry Problem: Fragmented & Unsafe Workflows

Modern print shops, cybercafes, documentation centers, and government service kiosks currently suffer from a severely fragmented, chaotic, and technologically outdated workflow. When a customer walks in to get a passport photo taken, an Aadhaar card PVC print, or a multi-page document compressed, the operators are forced to navigate a nightmare of disjointed apps:

1. **Dangerous & Slow File Ingestion Data Leaks:** Customers currently send their private IDs (passports, tax files) to the shopkeeper's WhatsApp Web or via virus-infected USB drives. This breaks privacy laws and clutters the operator's PC with hundreds of messy downloads.
2. **Aggressive Context Switching:** To crop an image, the operator opens Adobe Photoshop. To place that document on an A4 layout, they open MS Word. To compress it, they use slow, ad-ridden third-party websites. This takes 10+ minutes per customer.
3. **Hardware Locking & Single-Threading:** Legacy printing software is deeply tied to Windows Desktop APIs. Processing heavy PDF rasterization locks the main thread, freezing the computer completely. 
4. **Internet Dependency:** Shop pipelines drastically fail during local fiber outages because modern web-apps don't save states offline.

---

## 💡 The Architectural Solution: A Unified Browser Native Pipeline

**CyberCafe Print Studio** is engineered as a unified, purely browser-native operating system designed to directly replace the entire software suite of a print shop using cutting-edge Web Technologies. 

It handles everything from zero-latency ingestion and mathematical cropping, to non-blocking image rotation and layout preparation—all handled securely offline.

### ✨ Revolutionary Technical Capabilities
- **Local P2P File Connectivity (Capability-Aware UI):** Generates a dynamic QR code connected to the shop's local IP network. Customers drop files directly from their phone into the shop's IndexedDB. Our UI features "Graceful Degradation"—if deploying on stateless environments like Vercel, it intelligently traps the edge environment limits and gracefully disables the local-P2P UI seamlessly instead of generating server crashes.
- **Multithreaded Web-Worker Image Engines:** Operations like rotations and format transformations are dispatched to Background JavaScript Threads utilizing `OffscreenCanvas`. The front-end React DOM operates at a flawless 60 FPS while heavy computational rasterization occurs silently in the back.
- **Robust Offline-First Data Persistence (IndexedDB):** Implements an aggressive `Repository` pattern overriding volatile RAM. Asset metadata and raw `Blobs` are stored locally. The shop operates beautifully without internet connectivity.

---

## 🏗️ Technical Mastery: Hexagonal (Clean) Architecture

This project strictly enforces **Domain-Driven Design (DDD)** and the **Ports and Adapters (Hexagonal) Pattern**. This enterprise-grade structural methodology completely isolates business logic and domain entities from volatile UI visual constraints.

> **Why did I architect it this way?** 
> Algorithms for Document OCR or Smart Face Detection shift rapidly. By relying entirely on Interfaces (`Ports`), our team can rapidly hot-swap a naïve mathematical Image Engine for a highly advanced WebAssembly (WASM) OpenCV ML engine without risking a single broken line in the Next.js React UI DOM tree.

### Architecture Data Flow Diagram: `UI ➡️ UseCase ➡️ Port ⬅️ Adapter`

*   **Core Domain (`src/core/domain`):** Purely TypeScript logic. Entities like `JobAsset`. No React, no external libraries. Pure isolation.
*   **Ports/Contracts (`src/core/ports`):** Interfaces such as `ImageProcessingEngine.ts`, `AssetSource.ts`, and `PhotoProcessingEngine.ts`. Dictates exactly what boundaries perform.
*   **Adapters/Infrastructure (`src/core/adapters`):** Native implementation of logic. 
    *   `IDBAssetRepository`: Plugs data-saving domain models seamlessly to the JS IndexedDB API.
    *   `WebWorkerImageEngine`: Plugs non-blocking image logic to browser web workers.

---

## ⚙️ Core Feature Matrices & Modules

| Studio Module | Internal Engine Capability | Objective Served |
| :--- | :--- | :--- |
| 📡 **Connectivity Center** | `LocalQRTransferAdapter`, `FS-HotFolderAdapter` | Seamlessly fetches files locally via dynamic Phone QR or automated Desktop directory monitoring. |
| 📷 **Photo Studio (MVP)** | `BrowserPhotoEngine` -> `WebWorkerImageEngine` | Reads Passport ratios mathematically (35x45mm) and safely crops using isolated Background threads. |
| 🪪 **ID Card Studio** | `BrowserIDCardEngine` -> `IDCardProcessingEngine` | Simultaneously buffers dual-sided (Front/Back) IDs like Aadhaar/Voter Cards utilizing precise CR80 PVC calculations. |
| 📄 **Document Studio** | `BrowserPDFEngine`, `BrowserOCREngine` | Handles real-time parsing, rendering page stubs for PDF visualization, and abstracts raw text (OCR) processing. |

---

## 🚀 Getting Started (Run Local Intranet Services)

> **Important Deployment Note for Recruiters:**
> While the [Live Link](https://printing-software.vercel.app) showcases the high-fidelity UI and browser-native engines (Photo Studio, Document Studio, ID Studio), **Vercel is a stateless edge environment**. Due to the robust Capability-Aware limits built into the application, Local QR Socket bindings will automatically display a *"Local PC Required"* badge on Vercel to protect the integrity of serverless architecture.
> To unleash the **true power of local hardware syncing**, clone this repository and run it locally.

```bash
# 1. Clone this enterprise repository
git clone https://github.com/kasimshah19/Printing-Software.git

# 2. Navigate immediately into the directory
cd Printing-Software

# 3. Quickly install the Node dependencies
npm install

# 4. Fire up the local development Hot Node Server
npm run dev

# 5. Open your local browser to experience the operating system
# Navigation: http://localhost:3000
```

---

<div align="center">
  <h3>Architected and Developed with 💻 by <a href="https://github.com/kasimshah19">Kasim Shah</a></h3>
  <p><i>Ready for Full Stack Enterprise Production</i></p>
</div>
