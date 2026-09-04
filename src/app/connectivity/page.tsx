"use client";

import { useState, useRef, useEffect } from "react";
import { AppHeader } from "@/components/common/app-header";
import { Smartphone, ScanLine, FolderDown, Cloud, X, RefreshCw } from "lucide-react";
import { ConnectivityCard, type CapabilityStatus } from "@/app/connectivity/connectivity-card";
import { LocalQRTransferAdapter } from "@/core/adapters/browser/LocalQRTransferAdapter";
import { HotFolderAdapter } from "@/core/adapters/browser/FileSystemHotFolderAdapter";
import { QRCodeSVG } from "qrcode.react";

export default function ConnectivityCenterPage() {
  const [modal, setModal] = useState<"none" | "qr" | "hotfolder">("none");
  
  // QR State
  const [qrState, setQrState] = useState<{ id: string, joinUrl: string, token: string } | null>(null);
  const [qrStatus, setQrStatus] = useState<"waiting" | "connected" | "completed">("waiting");
  const [qrPollCount, setQrPollCount] = useState(0);

  // Hot Folder State
  const [folderCount, setFolderCount] = useState(0);

  useEffect(() => {
    // Basic sync
    HotFolderAdapter.listFolders().then(f => setFolderCount(f.length));
  }, []);

  const openQRModal = async () => {
    setModal("qr");
    try {
      const session = await LocalQRTransferAdapter.createSession();
      setQrState(session);
      setQrStatus("waiting");
      setQrPollCount(0);
    } catch(err) {
      alert("Failed to start QR Session");
      setModal("none");
    }
  };

  // Poll QR Status
  useEffect(() => {
    if (modal !== "qr" || !qrState || qrStatus === "completed") return;

    const interval = setInterval(async () => {
       try {
           const { status, count } = await LocalQRTransferAdapter.pollStatus(qrState.id);
           if (status === "connected" || status === "uploading") {
               setQrStatus("connected");
               setQrPollCount(count);
           } else if (status === "completed") {
               setQrStatus("completed");
               // Pull down all files
               const assets = await LocalQRTransferAdapter.retrieveAssets(qrState.id);
               alert(`Successfully pulled ${assets.length} items from phone into Job Pipeline!`);
               setModal("none");
           } else if (status === "error") {
               setQrStatus("error" as any);
               setModal("none");
               console.warn("QR Session lost or expired");
           }
       } catch (e) {
           console.error("Polling error", e);
           setModal("none");
       }
    }, 2000);

    return () => clearInterval(interval);
  }, [modal, qrState, qrStatus]);

  const handleSetupHotFolder = async () => {
    if (!("showDirectoryPicker" in window)) {
        alert("Your browser does not support the File System Access API.");
        return;
    }

    try {
        // @ts-ignore
        const handle = await window.showDirectoryPicker({ mode: "read" });
        const folderId = `hf-${Date.now()}`;
        
        await HotFolderAdapter.registerFolder({
            id: folderId,
            path: handle.name,
            allowedExtensions: ["jpg", "jpeg", "png", "pdf"],
            debounceMs: 2000
        });
        
        await HotFolderAdapter.attachDirectoryHandle(folderId, handle);
        await HotFolderAdapter.start();
        setFolderCount(prev => prev + 1);
        alert(`Now monitoring: ${handle.name}`);
        
    } catch(err) {
        console.error("Hot folder pick rejected", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 relative">
      <AppHeader />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Connectivity Center</h1>
          <p className="mt-1 text-slate-600">Manage device integrations and external inputs</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          <ConnectivityCard
            title="Phone QR"
            icon={<Smartphone className="h-5 w-5 text-blue-600" />}
            status="available"
            statusLabel="Ready"
            description="Receive photos from phone via local QR scan."
            actionLabel="Generate QR"
            onAction={openQRModal}
          />
          
          <ConnectivityCard
            title="Scanner"
            icon={<ScanLine className="h-5 w-5 text-indigo-600" />}
            status="unsupported"
            statusLabel="Native integration required"
            description="Scan documents directly. Requires desktop bridge for TWAIN access."
            actionLabel="Setup"
            onAction={() => alert("Scanner Bridge Setup Instructions...")}
          />
          
          <ConnectivityCard
            title="Hot Folder"
            icon={<FolderDown className="h-5 w-5 text-orange-600" />}
            status="available"
            statusLabel={folderCount > 0 ? "Monitoring" : "Ready"}
            description="Automatically ingest files dropped into a designated folder."
            metric={folderCount > 0 ? `${folderCount} folder(s) active` : ""}
            actionLabel="Add Folder"
            onAction={handleSetupHotFolder}
          />

          <ConnectivityCard
            title="Cloud Backup"
            icon={<Cloud className="h-5 w-5 text-slate-600" />}
            status="not-configured"
            statusLabel="Not Configured"
            description="Securely sync application data to cloud storage."
            actionLabel="Setup"
            onAction={() => alert("Cloud Setup")}
          />
        </div>
      </main>

      {/* QR MODAL */}
      {modal === "qr" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
           <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full relative">
              <button 
                onClick={() => setModal("none")} 
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
              >
                 <X className="w-5 h-5" />
              </button>
              
              <div className="text-center">
                 <h2 className="text-xl font-bold text-slate-800 mb-1">Send Files from Phone</h2>
                 <p className="text-sm text-slate-500 mb-6">Scan QR code using mobile camera</p>
                 
                 <div className="mx-auto w-48 h-48 bg-slate-100 flex items-center justify-center rounded-lg border border-slate-200 mb-6 relative overflow-hidden p-2">
                    {qrState ? (
                        <QRCodeSVG value={qrState.joinUrl} size={175} />
                    ) : (
                        <RefreshCw className="w-8 h-8 text-slate-400 animate-spin" />
                    )}
                 </div>

                 <div className="bg-slate-50 rounded-lg py-3 border border-slate-100 mb-2 font-mono text-sm shadow-inner">
                    {qrStatus === "waiting" && <span className="text-slate-500">Waiting for phone...</span>}
                    {qrStatus === "connected" && <span className="text-blue-600 font-medium">Downloading: {qrPollCount} files received</span>}
                 </div>
              </div>
           </div>
        </div>
      )}

    </div>
  );
}
