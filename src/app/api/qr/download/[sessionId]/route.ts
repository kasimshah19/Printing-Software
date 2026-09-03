import { NextResponse } from "next/server";
import { QRSessionStore } from "../../../../../core/infrastructure/QRSessionStore";

export async function GET(request: Request, context: any) {
    try {
        const { sessionId } = context.params;
        const session = QRSessionStore.getSession(sessionId);

        if (!session) {
            return NextResponse.json({ success: false, error: "Session not found" }, { status: 404 });
        }

        if (session.status !== "completed") {
            return NextResponse.json({ success: false, error: "Session not completed yet" }, { status: 400 });
        }

        // Clone files and clear store immediately to free server memory
        const files = [...session.files];
        QRSessionStore.clearSession(sessionId);

        return NextResponse.json({ success: true, files });
    } catch (error) {
        return NextResponse.json({ success: false, error: "Download failed" }, { status: 500 });
    }
}
