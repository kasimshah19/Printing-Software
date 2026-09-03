import type { JobAsset } from "../domain/JobAsset";
import type { Preset } from "../domain/PresetRegistry";
import type { Customer, Template, AppSettings, PrintJob } from "@/lib/types";

export interface PaginatedResult<T> {
    data: T[];
    total: number;
}

export interface JobRepository {
    save(job: PrintJob): Promise<void>;
    get(id: string): Promise<PrintJob | undefined>;
    delete(id: string): Promise<void>;
    list(opts?: { limit?: number; offset?: number; status?: string }): Promise<PaginatedResult<PrintJob>>;
    search(query: string): Promise<PrintJob[]>;
}

export interface AssetRepository {
    save(asset: JobAsset): Promise<void>;
    get(id: string): Promise<JobAsset | undefined>;
    delete(id: string): Promise<void>;
    findByJobId(jobId: string): Promise<JobAsset[]>;
}

export interface CustomerRepository {
    save(customer: Customer): Promise<void>;
    get(id: string): Promise<Customer | undefined>;
    delete(id: string): Promise<void>;
    search(query: string): Promise<Customer[]>;
}

export interface TemplateRepository {
    save(template: Template): Promise<void>;
    get(id: string): Promise<Template | undefined>;
    delete(id: string): Promise<void>;
    list(): Promise<Template[]>;
}

export interface PresetRepository {
    save(preset: Preset): Promise<void>;
    get(id: string): Promise<Preset | undefined>;
    delete(id: string): Promise<void>;
    listByCategory(category: string): Promise<Preset[]>;
}

export interface SettingsRepository {
    load(): Promise<AppSettings>;
    save(settings: Partial<AppSettings>): Promise<void>;
}
