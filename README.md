# CyberCafe Print

Offline-first web application for cybercafés, photo studios, and print shops to quickly crop, layout, and print passport photos, visa photos, and ID cards.

| 🌐 Live Demo | 💻 Source Code |
| :---: | :---: |
| [**printing-software.vercel.app**](https://printing-software.vercel.app) | [**kasimshah19/Printing-Software**](https://github.com/kasimshah19/Printing-Software) |

## MVP Workflow

```
Upload → Select Template → Crop → Auto Layout → Print Preview → Print
```

## Features (Phases 1-3 Complete)

- **Dashboard** with quick actions (Passport Photo, ID Card, A4 Sheet, Custom)
- **Image upload** — drag & drop, file picker, clipboard paste (JPG/PNG/WEBP)
- **Multi-image support** — crop multiple photos, assign different images to layout slots
- **Advanced crop** — fixed ratio / free crop, zoom slider, per-image switcher, rotate/flip
- **Manual layout editor** — drag, resize, duplicate, delete, align, distribute, snap-to-grid, canvas zoom
- **Undo/redo** — layout, crop, and paper changes (Ctrl+Z / Ctrl+Shift+Z)
- **Keyboard shortcuts** — Ctrl+O/S/P, R rotate, C crop, Delete, Esc
- **Project save/load** — layout, processed images, and source blobs in IndexedDB
- **Custom templates** — create, edit, delete with paper size, gaps, and copy count
- **Print preview** — per-slot images, physical mm sizing, browser print stylesheet
- **Batch Processing** — automatically crop and adjust multiple uploaded photos at once
- **Job Queue & Management** — track daily printing jobs (pending, processing, printed, completed)
- **Billing & Invoicing** — generate and print invoices, track daily sales and revenue
- **Localization (i18n)** — full UI translation support for English, Hindi, and Marathi

## Tech Stack

- Next.js 16 · React 19 · TypeScript
- Tailwind CSS 4
- Zustand (state)
- react-easy-crop (cropping)
- IndexedDB via `idb`
- Vitest (unit tests)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm test` | Run unit tests |
| `npm run lint` | ESLint |

## Project Structure

```
src/
├── app/              # Pages: dashboard, editor, print, templates, settings
├── components/       # UI, uploader, crop editor, layout canvas, print preview
├── lib/
│   ├── layout-engine/   # Pure layout calculation (columns, rows, positions)
│   ├── image-processing/# Canvas crop/render pipeline
│   ├── templates/       # Built-in templates & paper sizes
│   ├── storage/         # IndexedDB persistence
│   ├── utils/           # mm/px conversion utilities
│   └── i18n/            # Translation keys
└── store/            # Zustand stores (editor, settings, projects)
```

## Print Instructions

For accurate physical sizing, set your browser print dialog to:

- **Scale:** 100%
- **Margins:** None
- **Headers & Footers:** Off
- **Paper size:** Match the selected size in the app

## Privacy

All image processing happens locally in the browser. Photos are never uploaded to a server.

## Tests

Unit tests cover the layout engine and unit conversion utilities:

```bash
npm test
```

## Roadmap

- **Phase 4:** Optional AI modules (face detection, background removal, perspective correction)
