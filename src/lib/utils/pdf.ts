import * as pdfjsLib from "pdfjs-dist";

// Set worker path to local file (copied to public/ during build/installation)
// This ensures offline-first capability works without relying on CDN.
if (typeof window !== "undefined") {
    pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
}

/**
 * Converts a PDF File into an array of JPEG Image Files (one per page).
 */
export async function convertPdfToImages(file: File): Promise<File[]> {
    const arrayBuffer = await file.arrayBuffer();
    // We use pdfjsLib.getDocument. Load from Uint8Array to avoid issues with Blob URLs
    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;
    const imageFiles: File[] = [];

    for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        // Scale for high quality (e.g. ~300 DPI equivalent)
        const scale = 3.0;
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) continue;

        // Default white background for transparent PDFs
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        await page.render({ canvasContext: ctx, viewport } as any).promise;

        const blob = await new Promise<Blob | null>((resolve) => {
            canvas.toBlob(resolve, "image/jpeg", 0.95);
        });

        if (blob) {
            const fileName = `${file.name.replace(/\.pdf$/i, "")}_page_${i}.jpg`;
            imageFiles.push(new File([blob], fileName, { type: "image/jpeg" }));
        }
    }

    return imageFiles;
}
