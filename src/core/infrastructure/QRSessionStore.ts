export interface QRUploadSession {
    id: string;
    token: string;
    createdAt: string;
    expiresAt: string;
    status: "waiting" | "connected" | "uploading" | "completed" | "expired" | "cancelled";
    uploadedCount: number;
    totalBytes: number;
    maxFiles: number;
    maxBytes: number;
    files: { name: string; size: number; mime: string; dataBase64: string }[];
}

/**
 * In a real Next.js application, this would ideally be cached in Redis or a DB.
 * For this browser-centric / local cybercafe software, a module-level global
 * is sufficient since the local Next.js instance acts as the single web server.
 */
class QRSessionStoreImpl {
    private sessions: Record<string, QRUploadSession> = {};

    createSession(): QRUploadSession {
        const id = crypto.randomUUID();
        const token = crypto.randomUUID();

        // Expires in 15 minutes
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

        const session: QRUploadSession = {
            id,
            token,
            createdAt: new Date().toISOString(),
            expiresAt,
            status: "waiting",
            uploadedCount: 0,
            totalBytes: 0,
            maxFiles: 50,
            maxBytes: 150 * 1024 * 1024, // 150MB
            files: []
        };

        this.sessions[id] = session;
        return session;
    }

    getSession(id: string): QRUploadSession | null {
        const session = this.sessions[id];
        if (!session) return null;

        // Check expiration
        if (new Date() > new Date(session.expiresAt) && session.status !== "completed") {
            session.status = "expired";
        }

        return session;
    }

    updateSession(id: string, updates: Partial<QRUploadSession>) {
        if (this.sessions[id]) {
            this.sessions[id] = { ...this.sessions[id], ...updates };
        }
    }

    addFile(id: string, file: { name: string; size: number; mime: string; dataBase64: string }) {
        const session = this.sessions[id];
        if (session) {
            session.files.push(file);
            session.uploadedCount++;
            session.totalBytes += file.size;
        }
    }

    clearSession(id: string) {
        if (this.sessions[id]) {
            // Clear heavy base64 strings to free memory immediately
            this.sessions[id].files = [];
            delete this.sessions[id];
        }
    }
}

// Ensure global singleton across hot reloads in Next.js development
const globalForQRSession = global as unknown as { QRSessionStore: QRSessionStoreImpl };
export const QRSessionStore = globalForQRSession.QRSessionStore || new QRSessionStoreImpl();
if (process.env.NODE_ENV !== "production") globalForQRSession.QRSessionStore = QRSessionStore;
