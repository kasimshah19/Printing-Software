import { NextResponse } from "next/server";
import { QRSessionStore } from "../../../../core/infrastructure/QRSessionStore";

export async function POST(request: Request) {
    try {
        const session = QRSessionStore.createSession();
        // In production, we'd only return the session details needed by the client.
        return NextResponse.json({
            success: true,
            data: {
                id: session.id,
                token: session.token,
                expiresAt: session.expiresAt
            }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: "Failed to create session" }, { status: 500 });
    }
}
