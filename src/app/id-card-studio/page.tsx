"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { AppHeader } from "@/components/common/app-header";
import { Upload, Maximize, FileBox, Layers, Printer, Wand2 } from "lucide-react";
import type { JobAsset } from "@/core/domain/JobAsset";
import { LocalFileAssetSource } from "@/core/adapters/browser/LocalFileAssetSource";
import { ImportManager } from "@/core/application/ImportManager";
import { BrowserIDCardEngine } from "@/core/engines/id-card/BrowserIDCardEngine";
import { useSearchParams } from "next/navigation";

function IDCardStudioContent() {
    const searchParams = useSearchParams();
    const template = searchParams.get("template") || "generic";
    
    const [frontAsset, setFrontAsset] = useState<JobAsset | null>(null);
    const [backAsset, setBackAsset] = useState<JobAsset | null>(null);
    const [previewUrls, setPreviewUrls] = useState<{ front?: string; back?: string }>({});
    const [isProcessing, setIsProcessing] = useState(false);

    const engineRef = useRef<BrowserIDCardEngine | null>(null);

    useEffect(() => {
        engineRef.current = new BrowserIDCardEngine();
        return () => {
             if (previewUrls.front) URL.revokeObjectURL(previewUrls.front);
             if (previewUrls.back) URL.revokeObjectURL(previewUrls.back);
        };
    }, []);

    const handleImport = async (side: "front" | "back") => {
        const source = new LocalFileAssetSource();
        try {
            const rawAssets = await source.import();
            if (rawAssets.length === 0) return;
            
            const jobAsset = await ImportManager.importAsset({
                blob: rawAssets[0].blob,
                sourceType: "LOCAL_FILE",
                originalName: rawAssets[0].originalName
            });
            
            const newUrl = URL.createObjectURL(rawAssets[0].blob);
            
            setPreviewUrls(prev => ({ ...prev, [side]: newUrl }));
            if (side === "front") setFrontAsset(jobAsset);
            else setBackAsset(jobAsset);
        } catch(e) {
            console.error("Import failed", e);
        }
    };

    const handleSmartCrop = async (side: "front" | "back") => {
        const asset = side === "front" ? frontAsset : backAsset;
        const currentUrl = previewUrls[side];
        
        if (!asset || !engineRef.current || !currentUrl) return;
        setIsProcessing(true);

        try {
            const blobResp = await fetch(currentUrl);
            const blob = await blobResp.blob();
            
            // Standard ID Card ratios: 85.6mm x 54mm (CR80)
            const ratio = 85.6 / 54;
            const processed = await engineRef.current.cropCard(asset, ratio, blob);
            
            if (processed) {
                 const newUrl = URL.createObjectURL(processed.blob);
                 setPreviewUrls(prev => ({ ...prev, [side]: newUrl }));
            }
        } catch (err) {
            alert("Smart crop failed: " + err);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <AppHeader />
            <main className="flex-1 flex overflow-hidden">
                {/* Tools Sidebar */}
                <div className="w-80 bg-white border-r border-slate-200 flex flex-col p-4 shadow-sm z-10">
                    <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
                        <Layers className="w-5 h-5 ml-1 mr-2 text-indigo-600" />
                        ID Card Studio
                    </h2>
                    
                    <div className="space-y-6">
                         <div>
                             <label className="text-sm font-semibold text-slate-600 flex justify-between">
                                 <span>Front Side</span>
                                 <span className="text-xs text-indigo-500 uppercase">{template}</span>
                             </label>
                             <button 
                                 onClick={() => handleImport("front")}
                                 className="mt-2 w-full flex items-center justify-center p-3 border-2 border-dashed border-slate-300 hover:border-indigo-400 hover:bg-indigo-50 rounded-lg text-slate-500 transition-colors"
                             >
                                 <Upload className="w-4 h-4 mr-2" />
                                 {frontAsset ? "Replace Front Image" : "Upload Front"}
                             </button>
                             {frontAsset && (
                                 <button onClick={() => handleSmartCrop("front")} className="mt-2 w-full flex items-center justify-center p-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg text-sm font-medium transition-colors">
                                     <Wand2 className="w-4 h-4 mr-2" /> Auto Perspective Fix
                                 </button>
                             )}
                         </div>

                         <div>
                             <label className="text-sm font-semibold text-slate-600">Back Side (Optional)</label>
                             <button 
                                 onClick={() => handleImport("back")}
                                 className="mt-2 w-full flex items-center justify-center p-3 border-2 border-dashed border-slate-300 hover:border-indigo-400 hover:bg-indigo-50 rounded-lg text-slate-500 transition-colors"
                             >
                                 <Upload className="w-4 h-4 mr-2" />
                                 {backAsset ? "Replace Back Image" : "Upload Back"}
                             </button>
                             {backAsset && (
                                 <button onClick={() => handleSmartCrop("back")} className="mt-2 w-full flex items-center justify-center p-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg text-sm font-medium transition-colors">
                                     <Wand2 className="w-4 h-4 mr-2" /> Auto Perspective Fix
                                 </button>
                             )}
                         </div>
                    </div>
                    
                    <div className="mt-auto pt-6">
                        <button 
                            disabled={!frontAsset}
                            onClick={() => alert("Added to unified Print Layout Engine!")}
                            className="w-full flex items-center justify-center p-3 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white rounded-xl shadow-lg transition-all"
                        >
                            <Printer className="w-4 h-4 mr-2" />
                            Render A4 Sheet
                        </button>
                    </div>
                </div>

                {/* Workspace Area */}
                <div className="flex-1 bg-slate-100 p-8 flex flex-col items-center justify-center relative overflow-y-auto">
                    {isProcessing && (
                        <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-50 backdrop-blur-sm">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        </div>
                    )}
                    
                    {!frontAsset && !backAsset ? (
                        <div className="flex flex-col items-center justify-center text-slate-400">
                           <FileBox className="w-20 h-20 mb-6 opacity-20" />
                           <p className="text-xl font-medium text-slate-600">Configure ID Card</p>
                           <p className="max-w-xs text-center mt-2">Upload the scanned front and back of your ID card to begin edge detection.</p>
                        </div>
                    ) : (
                        <div className="w-full max-w-4xl flex flex-col md:flex-row gap-8 items-center justify-center">
                            {/* Front Render */}
                            <div className="flex flex-col items-center">
                                <h3 className="text-sm font-bold text-slate-500 mb-3 uppercase tracking-wider">Front</h3>
                                <div className="bg-white p-4 shadow-xl rounded-2xl border border-slate-200">
                                    {previewUrls.front ? (
                                        <div className="w-[340px] h-[215px] bg-slate-100 rounded-lg overflow-hidden border border-slate-300 relative group">
                                            <img src={previewUrls.front} alt="Front" className="w-full h-full object-contain" />
                                        </div>
                                    ) : (
                                        <div className="w-[340px] h-[215px] bg-slate-100 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400">
                                            Awaiting Image
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Divider for double sided */}
                            {(previewUrls.front && previewUrls.back) && (
                                <div className="hidden md:block h-32 w-px bg-slate-300"></div>
                            )}

                            {/* Back Render */}
                            {(backAsset || previewUrls.back) && (
                                <div className="flex flex-col items-center">
                                    <h3 className="text-sm font-bold text-slate-500 mb-3 uppercase tracking-wider">Back</h3>
                                    <div className="bg-white p-4 shadow-xl rounded-2xl border border-slate-200">
                                        {previewUrls.back ? (
                                            <div className="w-[340px] h-[215px] bg-slate-100 rounded-lg overflow-hidden border border-slate-300 relative group">
                                                <img src={previewUrls.back} alt="Back" className="w-full h-full object-contain" />
                                            </div>
                                        ) : (
                                            <div className="w-[340px] h-[215px] bg-slate-100 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400">
                                                Awaiting Image
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default function IDCardStudioPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading Studio...</div>}>
            <IDCardStudioContent />
        </Suspense>
    );
}
