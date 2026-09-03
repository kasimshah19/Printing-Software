import { NextResponse } from "next/server";
import { QRSessionStore } from "../../../../../core/infrastructure/QRSessionStore";

export async function GET(request: Request, context: any) {
    try {
        const { sessionId } = context.params;
        const session = QRSessionStore.getSession(sessionId);

        if (!session) {
            return NextResponse.json({ success: false, error: "Session not found" }, { status: 404 });
        }

        // Never return the raw files payload on a simple status check
        const statusData = {
            id: session.id,
            status: session.status,
            uploadedCount: session.uploadedCount,
            totalBytes: session.totalBytes,
            maxFiles: session.maxFiles
        };

        return NextResponse.json({ success: true, data: statusData });
    } catch (error) {
        return NextResponse.json({ success: false, error: "Failed to get session status" }, { status: 500 });
    }
}
