// This code runs inside a Web Worker.
// It uses OffscreenCanvas for UI-thread non-blocking image transformations.

self.onmessage = async (e: MessageEvent) => {
    const { id, action, blob, options } = e.data;

    try {
        const imageBitmap = await createImageBitmap(blob);
        let resultBlob: Blob;
        let width = imageBitmap.width;
        let height = imageBitmap.height;

        if (action === "resize") {
            // Options: { width, height, maintainAspectRatio, fit }
            let targetW = options.width || width;
            let targetH = options.height || height;

            if (options.maintainAspectRatio) {
                const aspect = width / height;
                if (options.width && !options.height) targetH = targetW / aspect;
                else if (options.height && !options.width) targetW = targetH * aspect;
            }

            const canvas = new OffscreenCanvas(targetW, targetH);
            const ctx = canvas.getContext("2d");
            if (!ctx) throw new Error("Failed to get 2d context");

            if (options.fit === "cover") {
                // cover logic
                const scale = Math.max(targetW / width, targetH / height);
                const x = (targetW / scale - width) / 2;
                const y = (targetH / scale - height) / 2;
                ctx.scale(scale, scale);
                ctx.drawImage(imageBitmap, x, y);
            } else {
                ctx.drawImage(imageBitmap, 0, 0, targetW, targetH);
            }

            resultBlob = await canvas.convertToBlob({ type: blob.type, quality: 1 });
            width = targetW;
            height = targetH;
        }
        else if (action === "crop") {
            const canvas = new OffscreenCanvas(options.width, options.height);
            const ctx = canvas.getContext("2d");
            if (!ctx) throw new Error("Failed to get 2d context");

            ctx.drawImage(
                imageBitmap,
                options.x, options.y, options.width, options.height,
                0, 0, options.width, options.height
            );

            resultBlob = await canvas.convertToBlob({ type: blob.type, quality: 1 });
            width = options.width;
            height = options.height;
        }
        else if (action === "rotate") {
            const rads = (options.degrees * Math.PI) / 180;
            // Calculate bounds rotation
            const sin = Math.abs(Math.sin(rads));
            const cos = Math.abs(Math.cos(rads));
            const newW = Math.floor(width * cos + height * sin);
            const newH = Math.floor(height * cos + width * sin);

            const canvas = new OffscreenCanvas(newW, newH);
            const ctx = canvas.getContext("2d");
            if (!ctx) throw new Error("Failed to get 2d context");

            ctx.translate(newW / 2, newH / 2);
            ctx.rotate(rads);
            ctx.drawImage(imageBitmap, -width / 2, -height / 2);

            resultBlob = await canvas.convertToBlob({ type: blob.type, quality: 1 });
            width = newW;
            height = newH;
        }
        else if (action === "compress" || action === "formatConversion") {
            const canvas = new OffscreenCanvas(width, height);
            const ctx = canvas.getContext("2d");
            if (!ctx) throw new Error("Failed to get 2d context");
            ctx.drawImage(imageBitmap, 0, 0);

            const targetType = action === "formatConversion" ? options.targetMimeType : blob.type;
            const quality = action === "compress" ? options.quality : 1.0;

            resultBlob = await canvas.convertToBlob({ type: targetType, quality });
        }
        else {
            throw new Error("Unknown action type");
        }

        self.postMessage({ id, success: true, blob: resultBlob, width, height, mimeType: resultBlob.type });

    } catch (err: any) {
        self.postMessage({ id, success: false, error: err.message });
    }
};
