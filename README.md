<div align="center">
  <img src="https://img.shields.io/badge/Status-Production_Ready-success?style=for-the-badge" alt="Status" />
  <img src="https://img.shields.io/badge/Stack-Next.js_14-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/Language-TypeScript-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
</div>

<br />

<div align="center">
  <h1>🖨️ CyberCafe Print & Document Studio</h1>
  <p><strong>An Offline-First, Enterprise-Grade Document Processing and Print Layout Engine built for Indian Cybercafés, CSCs (Common Service Centers), and Print Shops.</strong></p>
</div>

---

## 📖 About The Project

In the Indian tech ecosystem, local Cybercafés and Print Shops act as grassroots digital hubs. Operators handle hundreds of highly sensitive documents daily (Aadhaar, PAN, Voter IDs) and struggle with fragmented workflows—hopping between Photoshop, MS Word, online PDF converters, and image compressors to perform simple print & sizing tasks.

**CyberCafe Print & Document Studio** is a unified, single-page web utility that solves this exact problem. It is designed to run entirely locally in the browser, providing advanced canvas-based image cropping, PDF extraction, automated N-up print layout generation, and local business CRM—with zero external server storage, ensuring 100% data privacy and offline capability.

### 🌟 Why This Stands Out (For Recruiters)
This project is not a typical CRUD application. It handles deeply technical front-end challenges:
- **Binary-Search Image Compression:** A custom algorithm iteratively compressing Blobs directly in-browser to hit exact kilobyte targets without server reliance.
- **Advanced Canvas Manipulation:** Implementing perspective geometric cropping, DPI-aware MM to Pixel scaling, and complex N-Up layout grids.
- **Client-Side PDF Engine:** Local execution of `pdfjs-dist` to parse PDFs, render pages to customized canvases, and export to images.
- **Robust Local-First Architecture:** Leveraging `IndexedDB` for CRM, Jobs, and Invoice persistence, ensuring the app functions entirely offline.

---

## ⚡ Core Features

### 🇮🇳 India-Specific Document Preset Engine
- Pre-configured, high-precision dimensional standards for Indian Government Documents (Aadhaar PVC [86x54], Smart Card DL, PAN, Passport Photos [35x45], Postcards).
- Categorized registry with **Verification Badges** (OFFICIAL vs. ISO STANDARD vs. VERIFY) preventing scale errors before printing.

### ✂️ Smart Canvas Editor & Print Layout 
- **Auto-N-Up Engines:** Automatically arranges multiple items (e.g., 8 Passport photos, Front/Back Aadhaar cards) onto standard paper sizes (A4, 4x6, 5x7) maximizing paper efficiency.
- **Perspective Crop:** Geometric corner adjustment to flatten skewed documents photographed from mobile phones.
- **Offline PDF Processing:** User drops a PDF into the editor; the app extracts pages to high-resolution (`300 DPI`) images securely in the browser.

### 🛠️ File Utilities Hub
- **Iterative Compressor:** Squeezes images to exact thresholds (e.g., exact 50KB for examination forms) utilizing binary search algorithms on JPEG quality parameters.
- **Signature Studio:** Resizes and sets correct aspect ratios for digital signatures with 1-click presets.
- **Format Converter & Validator:** Client-side conversion between WEBP, PNG, and JPG.

### 📊 Business CRM & Billing
- **Customer & Job Management:** Store customer histories, jobs, and print statuses using IndexedDB.
- **Analytics Dashboard:** Real-time metrics tracking Revenue, Print Volume, and Job statuses with dynamic CSV data exports.
- **Invoicing System:** Generate, print, and track multi-item invoices natively.

### 🔒 Privacy & Data Retention
- Complete Data autonomy: Configurable retention policies auto-clean local databases.
- JSON-based Backup & Restore functionality allowing operators to safely migrate client data.

### 🌐 Multilingual i18n
- Seamless contextual translation support for **English**, **Hindi (हिंदी)**, and **Marathi (मराठी)** integrated via Zustand global state.

---

## 💻 Tech Stack

| Domain | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | Next.js 14 (App Router) | React application framework with static export targeting |
| **Language** | TypeScript | Strict type-safety across global interfaces and business logic |
| **State Management**| Zustand | Lightweight, un-opinionated global state (Editor, Store, i18n) |
| **Database** | IndexedDB / Dexie | Local browser database for robust, offline-first CRM persistence |
| **Styling** | Tailwind CSS + shadcn/ui | Utility-first CSS and accessible, customizable component library |
| **Core Libraries** | `react-easy-crop`, `pdfjs-dist` | Canvas manipulation, geometric cropping, and client-side PDF parsing |
| **Deployment** | Vercel / Static Build | Can be served offline via localhost, PWA, or natively packaged |

---

## 🚀 Getting Started

### Prerequisites
Make sure you have Node JS and NPM installed.

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/kasimshah19/Printing-Software.git
   cd Printing-Software
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Build for Production**
   ```bash
   npm run build
   ```
   > Note: Ensure `pdf.worker.min.mjs` is correctly linked in the `/public` directory for offline PDF extractions.

---

## 🏛️ Project Architecture / Structure

```text
├── src/
│   ├── app/                 # Next.js App Router (Pages: Editor, Dashboard, File Tools, CRM)
│   ├── components/          # Reusable UI components (Canvas, Modals, Uploader, Print Engine)
│   ├── lib/
│   │   ├── image-processing/# Canvas generation, perspective crop math, compression algorithms
│   │   ├── layout-engine/   # Grid logic mapping physical MM dimensions to pixels & UI spacing
│   │   ├── presets/         # Built-in India Document registry (Aadhaar, PAN, Card Standards)
│   │   ├── storage/         # IndexedDB wrappers (Jobs, Customers, Configs)
│   │   └── utils/           # PDF parsing using local worker, file validation
│   └── store/               # Zustand multi-store (Settings, Editor State, Jobs context)
└── public/                  # Raw assets and offline-local pdf.worker
```

---

<div align="center">
  <p>Built with ❤️ for rapid, privacy-first local document operations.</p>
  <a href="https://github.com/kasimshah19">GitHub Profile</a>
</div>
