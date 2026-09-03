import { NextResponse } from "next/server";
import { QRSessionStore } from "../../../../../core/infrastructure/QRSessionStore";

export const maxDuration = 60; // Allow 1 minute for uploads if supported

export async function POST(request: Request, context: any) {
    try {
        const { sessionId } = context.params;
        const session = QRSessionStore.getSession(sessionId);

        if (!session) {
            return NextResponse.json({ success: false, error: "Session not found or expired" }, { status: 404 });
        }

        if (session.status === "expired" || session.status === "cancelled") {
            return NextResponse.json({ success: false, error: `Session is ${session.status}` }, { status: 403 });
        }

        const data = await request.json();
        const { token, files, command } = data; // Expecting { name, size, mime, dataBase64 }

        if (token !== session.token) {
            return NextResponse.json({ success: false, error: "Invalid token" }, { status: 403 });
        }

        if (command === "connect") {
            QRSessionStore.updateSession(sessionId, { status: "connected" });
            return NextResponse.json({ success: true, status: "connected" });
        }

        if (command === "complete") {
            QRSessionStore.updateSession(sessionId, { status: "completed" });
            return NextResponse.json({ success: true, status: "completed" });
        }

        if (files && Array.isArray(files)) {
            if (session.uploadedCount + files.length > session.maxFiles) {
                return NextResponse.json({ success: false, error: "Too many files" }, { status: 400 });
            }

            QRSessionStore.updateSession(sessionId, { status: "uploading" });

            for (const file of files) {
                QRSessionStore.addFile(sessionId, file);
            }
        }

        return NextResponse.json({ success: true, uploadedCount: session.uploadedCount });
    } catch (error) {
        console.error("QR Upload API Error:", error);
        return NextResponse.json({ success: false, error: "Upload failed" }, { status: 500 });
    }
}
