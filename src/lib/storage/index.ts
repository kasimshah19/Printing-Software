import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { AppSettings, EditorProject, PrintJob, Template } from "@/lib/types";
import { BUILT_IN_TEMPLATES } from "@/lib/templates/built-in";

interface PrintShopDB extends DBSchema {
  projects: {
    key: string;
    value: EditorProject;
    indexes: { "by-updated": string };
  };
  templates: {
    key: string;
    value: Template;
  };
  settings: {
    key: string;
    value: AppSettings & { id: string };
  };
  imageBlobs: {
    key: string;
    value: { id: string; blob: Blob };
  };
  jobs: {
    key: string;
    value: PrintJob;
    indexes: { "by-created": string; "by-status": JobStatus };
  };
  invoices: {
    key: string;
    value: import("@/lib/types").Invoice;
    indexes: { "by-created": string };
  };
}

type JobStatus = PrintJob["status"];

const DB_NAME = "cybercafe-print";
const DB_VERSION = 2;

let dbPromise: Promise<IDBPDatabase<PrintShopDB>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<PrintShopDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (!db.objectStoreNames.contains("projects")) {
          const store = db.createObjectStore("projects", { keyPath: "id" });
          store.createIndex("by-updated", "updatedAt");
        }
        if (!db.objectStoreNames.contains("templates")) {
          db.createObjectStore("templates", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("settings")) {
          db.createObjectStore("settings", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("imageBlobs")) {
          db.createObjectStore("imageBlobs", { keyPath: "id" });
        }
        if (oldVersion < 2 && !db.objectStoreNames.contains("jobs")) {
          const jobStore = db.createObjectStore("jobs", { keyPath: "id" });
          jobStore.createIndex("by-created", "createdAt");
          jobStore.createIndex("by-status", "status");
        }
        if (!db.objectStoreNames.contains("invoices")) {
          const invStore = db.createObjectStore("invoices", { keyPath: "id" });
          invStore.createIndex("by-created", "createdAt");
        }
      },
    });
  }
  return dbPromise;
}

const SETTINGS_KEY = "app-settings";

export const DEFAULT_SETTINGS: AppSettings = {
  defaultDpi: 300,
  defaultPaperId: "a4",
  defaultMargins: { top: 5, right: 5, bottom: 5, left: 5 },
  defaultSpacing: { horizontal: 3, vertical: 3 },
  theme: "light",
  language: "en",
  autosave: true,
  recentProjectCount: 10,
  printerName: "",
  nextJobNumber: 1001,
  printInstructions:
    "Set Scale to 100%, Margins to None, disable Headers & Footers, and match the paper size shown.",
};

export async function loadSettings(): Promise<AppSettings> {
  const db = await getDB();
  const stored = await db.get("settings", SETTINGS_KEY);
  if (stored) {
    const { id: _, ...settings } = stored;
    return { ...DEFAULT_SETTINGS, ...settings };
  }
  return DEFAULT_SETTINGS;
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  const db = await getDB();
  await db.put("settings", { ...settings, id: SETTINGS_KEY });
}

export async function loadUserTemplates(): Promise<Template[]> {
  const db = await getDB();
  return db.getAll("templates");
}

export async function saveUserTemplate(template: Template): Promise<void> {
  const db = await getDB();
  await db.put("templates", template);
}

export async function deleteUserTemplate(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("templates", id);
}

export async function getAllTemplates(): Promise<Template[]> {
  const user = await loadUserTemplates();
  return [...BUILT_IN_TEMPLATES, ...user];
}

export async function saveProject(project: EditorProject): Promise<void> {
  const db = await getDB();
  await db.put("projects", project);
}

export async function loadProject(id: string): Promise<EditorProject | undefined> {
  const db = await getDB();
  return db.get("projects", id);
}

export async function loadRecentProjects(limit = 10): Promise<EditorProject[]> {
  const db = await getDB();
  const all = await db.getAllFromIndex("projects", "by-updated");
  return all.reverse().slice(0, limit);
}

export async function deleteProject(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("projects", id);
}

export async function saveImageBlob(id: string, blob: Blob): Promise<void> {
  const db = await getDB();
  await db.put("imageBlobs", { id, blob });
}

export async function loadImageBlob(id: string): Promise<Blob | undefined> {
  const db = await getDB();
  const record = await db.get("imageBlobs", id);
  return record?.blob;
}

export async function saveJob(job: PrintJob): Promise<void> {
  const db = await getDB();
  await db.put("jobs", job);
}

export async function loadJob(id: string): Promise<PrintJob | undefined> {
  const db = await getDB();
  return db.get("jobs", id);
}

export async function loadAllJobs(): Promise<PrintJob[]> {
  const db = await getDB();
  const all = await db.getAllFromIndex("jobs", "by-created");
  return all.reverse();
}

export async function loadJobsByStatus(status: JobStatus): Promise<PrintJob[]> {
  const db = await getDB();
  return db.getAllFromIndex("jobs", "by-status", status);
}

export async function deleteJob(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("jobs", id);
}

export async function getTodayJobStats(): Promise<{
  total: number;
  printed: number;
  pending: number;
}> {
  const jobs = await loadAllJobs();
  const today = new Date().toDateString();
  const todayJobs = jobs.filter((j) => new Date(j.createdAt).toDateString() === today);
  return {
    total: todayJobs.length,
    printed: todayJobs.filter((j) => j.status === "printed" || j.status === "completed").length,
    pending: todayJobs.filter((j) => j.status === "pending" || j.status === "processing").length,
  };
}

export async function clearAllData(): Promise<void> {
  const db = await getDB();
  await db.clear("projects");
  await db.clear("templates");
  await db.clear("imageBlobs");
  await db.clear("jobs");
}

export async function allocateJobNumber(): Promise<number> {
  const settings = await loadSettings();
  const num = settings.nextJobNumber;
  await saveSettings({ ...settings, nextJobNumber: num + 1 });
  return num;
}

export async function saveInvoice(invoice: import("@/lib/types").Invoice): Promise<void> {
  const db = await getDB();
  await db.put("invoices", invoice);
}

export async function loadAllInvoices(): Promise<import("@/lib/types").Invoice[]> {
  const db = await getDB();
  const all = await db.getAllFromIndex("invoices", "by-created");
  return all.reverse();
}

export async function deleteInvoice(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("invoices", id);
}

export async function getTodayInvoiceStats(): Promise<{
  totalSales: number;
  invoicesCount: number;
}> {
  const invoices = await loadAllInvoices();
  const today = new Date().toDateString();
  const todayInvoices = invoices.filter((i) => new Date(i.createdAt).toDateString() === today);
  const totalSales = todayInvoices.reduce((sum, inv) => sum + inv.total, 0);
  return {
    totalSales,
    invoicesCount: todayInvoices.length,
  };
}
