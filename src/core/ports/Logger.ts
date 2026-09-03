export interface Logger {
    debug(message: string, context?: Record<string, any>): void;
    info(message: string, context?: Record<string, any>): void;
    warn(message: string, context?: Record<string, any>): void;
    error(message: string, error?: Error | unknown, context?: Record<string, any>): void;
}

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogEntry {
    level: LogLevel;
    timestamp: string;
    source: string;
    message: string;
    operation?: string;
    status?: string;
    errorCode?: string;
    durationMs?: number;
    context?: Record<string, any>;
}
