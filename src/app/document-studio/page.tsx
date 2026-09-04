"use client";

import { useState, useRef, useEffect } from "react";
import { AppHeader } from "@/components/common/app-header";
import { FileUp, FileText, Type, FileArchive, ArrowRightToLine, FileDown, ScanLine } from "lucide-react";
import { LocalFileAssetSource } from "@/core/adapters/browser/LocalFileAssetSource";
import { ImportManager } from "@/core/application/ImportManager";
import type { JobAsset } from "@/core/domain/JobAsset";
import { BrowserPDFEngine } from "@/core/engines/pdf/BrowserPDFEngine";
import { BrowserOCREngine } from "@/core/engines/ocr/BrowserOCREngine";

export default function DocumentStudioPage() {
    const [docAsset, setDocAsset] = useState<JobAsset | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [extractedText, setExtractedText] = useState<string>("");
    const [isProcessing, setIsProcessing] = useState(false);

    const pdfEngineRef = useRef<BrowserPDFEngine | null>(null);
    const ocrEngineRef = useRef<BrowserOCREngine | null>(null);

    useEffect(() => {
        pdfEngineRef.current = new BrowserPDFEngine();
        ocrEngineRef.current = new BrowserOCREngine();
        return () => {
             if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, []);

    const handleImport = async () => {
        const source = new LocalFileAssetSource();
        try {
            const rawAssets = await source.import();
            if (rawAssets.length === 0) return;
            
            const asset = rawAssets[0];
            const jobAsset = await ImportManager.importAsset({
                blob: asset.blob,
                sourceType: "LOCAL_FILE",
                originalName: asset.originalName
            });
            
            setDocAsset(jobAsset);

            // If it's a PDF, rasterize the first page for preview
            if (asset.blob.type === "application/pdf") {
                 setIsProcessing(true);
                 try {
                     const page = await pdfEngineRef.current!.renderPage(jobAsset, 1, 1.0);
                     const url = URL.createObjectURL(page.blob);
                     if (previewUrl) URL.revokeObjectURL(previewUrl);
                     setPreviewUrl(url);
                 } catch(err) {
                     console.error(err);
                 }
                 setIsProcessing(false);
            } else {
                 const url = URL.createObjectURL(asset.blob);
                 if (previewUrl) URL.revokeObjectURL(previewUrl);
                 setPreviewUrl(url);
            }
        } catch(e) {
            console.error("Import failed", e);
        }
    };

    const runOCR = async () => {
        if (!docAsset || !ocrEngineRef.current) return;
        setIsProcessing(true);
        try {
            const result = await ocrEngineRef.current.recognize(docAsset);
            setExtractedText(result.text);
        } catch(err) {
            alert("OCR Failed: " + err);
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
                        <FileText className="w-5 h-5 ml-1 mr-2 text-emerald-600" />
                        Document Studio
                    </h2>
                    
                    <div className="space-y-4">
                         <button 
                             onClick={handleImport}
                             className="w-full flex items-center justify-center p-3 border-2 border-dashed border-emerald-300 hover:border-emerald-500 hover:bg-emerald-50 rounded-lg text-emerald-700 font-medium transition-colors"
                         >
                             <FileUp className="w-5 h-5 mr-2" />
                             {docAsset ? "Replace Document" : "Upload Image or PDF"}
                         </button>

                         {docAsset && (
                             <div className="space-y-2 pt-4 border-t border-slate-100">
                                 <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Processing Tools</h3>
                                 
                                 <button onClick={runOCR} className="w-full flex items-center p-3 bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 text-slate-700 rounded-lg text-sm font-medium transition-colors shadow-sm">
                                     <Type className="w-4 h-4 mr-3 text-emerald-600" /> 
                                     Extract Text (OCR)
                                 </button>
                                 
                                 <button onClick={() => alert("Requires PDF-Lib hook")} className="w-full flex items-center p-3 bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 text-slate-700 rounded-lg text-sm font-medium transition-colors shadow-sm">
                                     <FileArchive className="w-4 h-4 mr-3 text-emerald-600" /> 
                                     Compress PDF
                                 </button>

                                 <button onClick={() => alert("Scanner Bridge hook")} className="w-full flex items-center p-3 bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 text-slate-700 rounded-lg text-sm font-medium transition-colors shadow-sm">
                                     <ScanLine className="w-4 h-4 mr-3 text-emerald-600" /> 
                                     Append from Scanner
                                 </button>
                             </div>
                         )}
                    </div>
                </div>

                {/* Workspace Area */}
                <div className="flex-1 bg-slate-100 p-8 flex gap-6 relative overflow-hidden">
                    {isProcessing && (
                        <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-50 backdrop-blur-sm">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                        </div>
                    )}
                    
                    {!docAsset ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                           <FileDown className="w-20 h-20 mb-6 opacity-20" />
                           <p className="text-xl font-medium text-slate-600">No Document Loaded</p>
                           <p className="max-w-xs text-center mt-2">Upload a scan, image, or PDF to begin document processing and OCR.</p>
                        </div>
                    ) : (
                        <>
                            {/* Document Preview */}
                            <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                                <div className="bg-slate-800 text-slate-300 text-xs px-4 py-2 font-mono flex justify-between">
                                    <span>{docAsset.name}</span>
                                    <span>{docAsset.mimeType} • {(docAsset.sizeBytes / 1024).toFixed(1)} KB</span>
                                </div>
                                <div className="flex-1 p-6 flex justify-center overflow-auto bg-slate-200/50 relative">
                                     <div className="bg-white shadow-md w-full max-w-2xl min-h-[800px] border border-slate-300 p-1 flex items-start justify-center">
                                         {previewUrl && <img src={previewUrl} alt="Document Page" className="max-w-full h-auto object-contain" />}
                                     </div>
                                </div>
                            </div>

                            {/* OCR Results Pane */}
                            {extractedText && (
                                <div className="w-80 flex flex-col bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden shrink-0">
                                    <div className="bg-emerald-600 text-white text-xs px-4 py-2 font-bold uppercase tracking-wider flex justify-between items-center">
                                        OCR Results
                                        <ArrowRightToLine className="w-3 h-3" />
                                    </div>
                                    <div className="flex-1 p-4 overflow-auto">
                                        <textarea 
                                            readOnly 
                                            value={extractedText}
                                            className="w-full h-full resize-none outline-none text-sm text-slate-700 font-mono"
                                        />
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}
