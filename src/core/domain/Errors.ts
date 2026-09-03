export class ApplicationError extends Error {
    constructor(message: string, public code: string) {
        super(message);
        this.name = this.constructor.name;
    }
}

export class ImportError extends ApplicationError {
    constructor(msg: string) { super(msg, 'IMPORT_ERROR'); }
}

export class UnsupportedFileError extends ApplicationError {
    constructor(msg: string) { super(msg, 'UNSUPPORTED_FILE'); }
}

export class FileTooLargeError extends ApplicationError {
    constructor(msg: string) { super(msg, 'FILE_TOO_LARGE'); }
}

export class ScannerError extends ApplicationError {
    constructor(msg: string) { super(msg, 'SCANNER_ERROR'); }
}

export class QRSessionExpiredError extends ApplicationError {
    constructor(msg: string) { super(msg, 'QR_SESSION_EXPIRED'); }
}

export class HotFolderUnavailableError extends ApplicationError {
    constructor(msg: string) { super(msg, 'HOT_FOLDER_UNAVAILABLE'); }
}

export class CloudAuthenticationError extends ApplicationError {
    constructor(msg: string) { super(msg, 'CLOUD_AUTH_ERROR'); }
}

export class CloudUploadError extends ApplicationError {
    constructor(msg: string) { super(msg, 'CLOUD_UPLOAD_ERROR'); }
}

export class PrintError extends ApplicationError {
    constructor(msg: string) { super(msg, 'PRINT_ERROR'); }
}

export class StorageError extends ApplicationError {
    constructor(msg: string) { super(msg, 'STORAGE_ERROR'); }
}

export class ProcessingError extends ApplicationError {
    constructor(msg: string) { super(msg, 'PROCESSING_ERROR'); }
}
