"use client";

import { useState, useRef, useEffect } from "react";
import { AppHeader } from "@/components/common/app-header";
import { Upload, Crop, Maximize, RotateCw, Save, Check } from "lucide-react";
import { WebWorkerImageEngine } from "@/core/engines/image/WebWorkerImageEngine";
import { BrowserPhotoEngine } from "@/core/engines/photo/BrowserPhotoEngine";
import type { JobAsset } from "@/core/domain/JobAsset";
import { LocalFileAssetSource } from "@/core/adapters/browser/LocalFileAssetSource";
import { ImportManager } from "@/core/application/ImportManager";

export default function PhotoStudioPage() {
    const [assets, setAssets] = useState<JobAsset[]>([]);
    const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
    const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});
    const [isProcessing, setIsProcessing] = useState(false);
    
    // Engines
    const imageEngineRef = useRef<WebWorkerImageEngine | null>(null);
    const photoEngineRef = useRef<BrowserPhotoEngine | null>(null);

    useEffect(() => {
        imageEngineRef.current = new WebWorkerImageEngine();
        photoEngineRef.current = new BrowserPhotoEngine();
        return () => {
             // Cleanup ObjectURLs to prevent memory leaks
             Object.values(previewUrls).forEach(URL.revokeObjectURL);
        };
    }, []);

    const handleImport = async () => {
        const source = new LocalFileAssetSource();
        try {
            const rawAssets = await source.import();
            const newAssets: JobAsset[] = [];
            const newUrls = { ...previewUrls };
            
            for (const item of rawAssets) {
                const jobAsset = await ImportManager.importAsset({
                    blob: item.blob,
                    sourceType: "LOCAL_FILE",
                    originalName: item.originalName
                });
                
                // For preview purposes, we store blob in UI state temporarily
                // In full implementation, we fetch from IndexedDB AssetRepository
                newUrls[jobAsset.id] = URL.createObjectURL(item.blob);
                newAssets.push(jobAsset);
            }
            
            setAssets(prev => [...prev, ...newAssets]);
            setPreviewUrls(newUrls);
            if (newAssets.length > 0 && !selectedAssetId) {
                setSelectedAssetId(newAssets[0].id);
            }
        } catch(e) {
            console.error("Import failed", e);
        }
    };

    const handleAction = async (action: "rotate" | "crop-passport") => {
        if (!selectedAssetId || !imageEngineRef.current || !photoEngineRef.current || !previewUrls[selectedAssetId]) return;
        setIsProcessing(true);

        try {
            const blobResp = await fetch(previewUrls[selectedAssetId]);
            const blob = await blobResp.blob();
            const assetToProcess = assets.find(a => a.id === selectedAssetId)!;
            
            let processed;
            if (action === "rotate") {
                // Background Non-blocking generic rotation
                processed = await (imageEngineRef.current as any).execute("rotate", assetToProcess, { degrees: 90, blob });
            } else if (action === "crop-passport") {
                // Auto face detection & smart crop (35x45mm indian passport std)
                processed = await photoEngineRef.current.autoCrop(assetToProcess, 35, 45, blob);
            }

            if (processed) {
                 const newUrl = URL.createObjectURL(processed.blob);
                 setPreviewUrls(prev => ({ ...prev, [selectedAssetId]: newUrl }));
            }
        } catch (err) {
            alert("Processing failed: " + err);
        } finally {
            setIsProcessing(false);
        }
    };

    const selectedAsset = assets.find(a => a.id === selectedAssetId);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <AppHeader />
            <main className="flex-1 flex overflow-hidden">
                {/* Sidebar */}
                <div className="w-80 bg-white border-r border-slate-200 flex flex-col">
                    <div className="p-4 border-b border-slate-200">
                        <h2 className="text-lg font-bold text-slate-800">Photo Batch</h2>
                        <button 
                            onClick={handleImport}
                            className="mt-3 w-full flex items-center justify-center p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm text-sm"
                        >
                            <Upload className="w-4 h-4 mr-2" />
                            Import Photos
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {assets.length === 0 ? (
                            <div className="text-center text-sm text-slate-400 mt-10">No photos imported</div>
                        ) : (
                            assets.map(asset => (
                                <div 
                                    key={asset.id} 
                                    onClick={() => setSelectedAssetId(asset.id)}
                                    className={`relative p-2 rounded-lg cursor-pointer border-2 transition-all ${selectedAssetId === asset.id ? 'border-blue-500 bg-blue-50' : 'border-transparent hover:bg-slate-100'}`}
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="w-12 h-12 rounded bg-slate-200 overflow-hidden flex-shrink-0">
                                            {previewUrls[asset.id] && (
                                                <img src={previewUrls[asset.id]} alt="thumb" className="w-full h-full object-cover" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-700 truncate">{asset.name}</p>
                                            <p className="text-xs text-slate-500">{(asset.sizeBytes / 1024).toFixed(1)} KB</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Main Editor Area */}
                <div className="flex-1 bg-slate-100 p-8 flex flex-col items-center justify-center relative">
                     {selectedAsset ? (
                          <div className="flex flex-col items-center max-w-2xl w-full">
                               <div className="bg-white p-4 shadow-lg rounded-xl mb-6 relative group overflow-hidden">
                                    {isProcessing && (
                                        <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10 backdrop-blur-sm">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                        </div>
                                    )}
                                    <img 
                                        src={previewUrls[selectedAsset.id]} 
                                        alt="canvas" 
                                        className="max-w-full max-h-[60vh] object-contain rounded border border-slate-100" 
                                    />
                               </div>
                               
                               <div className="flex space-x-4 bg-white p-3 rounded-lg shadow-sm border border-slate-200">
                                    <button 
                                        disabled={isProcessing}
                                        onClick={() => handleAction("crop-passport")}
                                        className="flex flex-col items-center p-3 hover:bg-blue-50 hover:text-blue-600 rounded-lg text-slate-600 disabled:opacity-50"
                                    >
                                        <Crop className="w-5 h-5 mb-1" />
                                        <span className="text-xs font-medium">Passport Crop</span>
                                    </button>
                                    <button 
                                        disabled={isProcessing}
                                        onClick={() => handleAction("rotate")}
                                        className="flex flex-col items-center p-3 hover:bg-blue-50 hover:text-blue-600 rounded-lg text-slate-600 disabled:opacity-50"
                                    >
                                        <RotateCw className="w-5 h-5 mb-1" />
                                        <span className="text-xs font-medium">Rotate 90°</span>
                                    </button>
                                    <div className="w-px bg-slate-200 mx-2"></div>
                                    <button 
                                        disabled={isProcessing}
                                        onClick={() => alert("Added to job!")}
                                        className="flex flex-col items-center p-3 hover:bg-green-50 hover:text-green-600 rounded-lg text-slate-600 disabled:opacity-50"
                                    >
                                        <Check className="w-5 h-5 mb-1" />
                                        <span className="text-xs font-medium">Accept Asset</span>
                                    </button>
                               </div>
                          </div>
                     ) : (
                          <div className="flex flex-col items-center justify-center text-slate-400">
                               <Maximize className="w-16 h-16 mb-4 opacity-20" />
                               <p>Select an image to preview and edit</p>
                          </div>
                     )}
                </div>
            </main>
        </div>
    );
}
