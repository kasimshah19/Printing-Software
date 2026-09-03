import type {
    JobRepository, AssetRepository, CustomerRepository,
    TemplateRepository, PresetRepository, SettingsRepository, PaginatedResult
} from "../ports/Repositories";
import type { JobAsset } from "../domain/JobAsset";
import {
    saveJob, loadJob, loadAllJobs, loadJobsByStatus, deleteJob,
    saveCustomer, loadCustomer, loadAllCustomers, searchCustomers, deleteCustomer,
    saveUserTemplate, loadUserTemplates, deleteUserTemplate, getAllTemplates,
    loadSettings, saveSettings
} from "@/lib/storage";
import type { PrintJob, Customer, Template, AppSettings } from "@/lib/types";
import type { Preset } from "../domain/PresetRegistry";

// 1. JOB REPO
export class IDBJobRepository implements JobRepository {
    async save(job: PrintJob): Promise<void> {
        await saveJob(job);
    }
    async get(id: string): Promise<PrintJob | undefined> {
        return loadJob(id);
    }
    async delete(id: string): Promise<void> {
        await deleteJob(id);
    }
    async list(opts?: { limit?: number; offset?: number; status?: string }): Promise<PaginatedResult<PrintJob>> {
        let all: PrintJob[];
        if (opts?.status) {
            all = await loadJobsByStatus(opts.status as any); // JobStatus
            all = all.reverse();
        } else {
            all = await loadAllJobs();
        }

        const offset = opts?.offset || 0;
        const limit = opts?.limit || 50;
        const data = all.slice(offset, offset + limit);

        return { data, total: all.length };
    }
    async search(query: string): Promise<PrintJob[]> {
        const jobs = await loadAllJobs();
        const lower = query.toLowerCase();
        return jobs.filter(j =>
            j.customerName.toLowerCase().includes(lower) ||
            j.serviceName.toLowerCase().includes(lower) ||
            String(j.jobNumber).includes(lower)
        );
    }
}

// 2. ASSET REPOSITORY
export class IDBAssetRepository implements AssetRepository {
    // In Phase 2, this is a new collection representing the normalized JobAssets
    // Temporarily stored in memory unless explicitly pushed to IDB. Ideally we add a "jobAssets" objectStore.
    // For now we will mock this or add it dynamically if we were to upgrade the IDB schema.
    private fallbackCache = new Map<string, JobAsset>();

    async save(asset: JobAsset): Promise<void> {
        this.fallbackCache.set(asset.id, asset);
    }
    async get(id: string): Promise<JobAsset | undefined> {
        return this.fallbackCache.get(id);
    }
    async delete(id: string): Promise<void> {
        this.fallbackCache.delete(id);
    }
    async findByJobId(jobId: string): Promise<JobAsset[]> {
        // Find assets belonging to a job (requires a link metadata)
        return Array.from(this.fallbackCache.values()).filter(a => a.metadata?.jobId === jobId);
    }
}

// 3. CUSTOMER REPO
export class IDBCustomerRepository implements CustomerRepository {
    async save(customer: Customer): Promise<void> { await saveCustomer(customer); }
    async get(id: string): Promise<Customer | undefined> { return loadCustomer(id); }
    async delete(id: string): Promise<void> { return deleteCustomer(id); }
    async search(query: string): Promise<Customer[]> { return searchCustomers(query); }
}

// 4. TEMPLATE REPO
export class IDBTemplateRepository implements TemplateRepository {
    async save(template: Template): Promise<void> { await saveUserTemplate(template); }
    async get(id: string): Promise<Template | undefined> {
        return (await getAllTemplates()).find(t => t.id === id);
    }
    async delete(id: string): Promise<void> { await deleteUserTemplate(id); }
    async list(): Promise<Template[]> { return getAllTemplates(); }
}

// 5. PRESET REPO
export class IDBPresetRepository implements PresetRepository {
    // Presets are largely static for now (from PresetRegistry), but could be user-defined
    private memory = new Map<string, Preset>();

    async save(preset: Preset): Promise<void> { this.memory.set(preset.id, preset); }
    async get(id: string): Promise<Preset | undefined> { return this.memory.get(id); }
    async delete(id: string): Promise<void> { this.memory.delete(id); }
    async listByCategory(category: any): Promise<Preset[]> {
        return Array.from(this.memory.values()).filter(p => p.category === category);
    }
}

// 6. SETTINGS REPO
export class IDBSettingsRepository implements SettingsRepository {
    async load(): Promise<AppSettings> { return loadSettings(); }
    async save(settings: Partial<AppSettings>): Promise<void> {
        const current = await loadSettings();
        await saveSettings({ ...current, ...settings });
    }
}
