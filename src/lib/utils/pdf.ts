import * as pdfjsLib from "pdfjs-dist";

// Set worker path to local file (copied to public/ during build/installation)
// This ensures offline-first capability works without relying on CDN.
if (typeof window !== "undefined") {
    pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
}

/**
 * Converts a PDF File into an array of JPEG Image Files (one per page).
 */
export async function convertPdfToImages(
    file: File,
    options?: { scale?: number; quality?: number }
): Promise<File[]> {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;
    const imageFiles: File[] = [];

    const scale = options?.scale ?? 3.0;
    const quality = options?.quality ?? 0.95;

    for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) continue;

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        await page.render({ canvasContext: ctx, viewport } as any).promise;

        const blob = await new Promise<Blob | null>((resolve) => {
            canvas.toBlob(resolve, "image/jpeg", quality);
        });

        if (blob) {
            const fileName = `${file.name.replace(/\.pdf$/i, "")}_page_${i}.jpg`;
            imageFiles.push(new File([blob], fileName, { type: "image/jpeg" }));
        }
    }

    return imageFiles;
}
