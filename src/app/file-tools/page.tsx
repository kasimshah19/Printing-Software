"use client";

import { useState, useRef } from "react";
import { AppHeader } from "@/components/common/app-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/input";
import { Input } from "@/components/ui/input";
import { t } from "@/lib/i18n";
import { useSettingsStore } from "@/store";
import { Download } from "lucide-react";

export default function FileToolsPage() {
  const language = useSettingsStore((s) => s.settings.language);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string>("");
  const [targetSizeKb, setTargetSizeKb] = useState<number>(50);
  
  const [compressedUrl, setCompressedUrl] = useState<string>("");
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setOriginalFile(file);
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    setOriginalUrl(URL.createObjectURL(file));
    setCompressedUrl("");
  };

  const handleCompress = async () => {
    if (!originalFile) return;
    setIsProcessing(true);
    
    // We do a simple iterative compression strategy
    let minQ = 0.01;
    let maxQ = 1.0;
    let quality = 0.8; // start estimation
    let bestBlob: Blob | null = null;
    let iters = 0;
    
    const targetBytes = targetSizeKb * 1024;
    const img = new Image();
    
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject();
      img.src = originalUrl;
    });

    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setIsProcessing(false);
      return;
    }
    
    // Draw solid white background in case it's a PNG with transparency getting converted to JPG
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    // Iterative binary search for quality
    while (iters < 7) {
      const blob = await new Promise<Blob | null>((res) => {
        canvas.toBlob(res, "image/jpeg", quality);
      });
      
      if (!blob) break;
      
      bestBlob = blob;
      
      if (blob.size > targetBytes) {
        maxQ = quality;
      } else {
        minQ = quality;
        // If we are within 10% below target, accept it immediately
        if (targetBytes - blob.size < targetBytes * 0.1) {
          break;
        }
      }
      quality = (minQ + maxQ) / 2;
      iters++;
    }

    if (bestBlob) {
      setCompressedSize(bestBlob.size);
      if (compressedUrl) URL.revokeObjectURL(compressedUrl);
      setCompressedUrl(URL.createObjectURL(bestBlob));
    }
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">{t("tools.title", language)}</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t("tools.compressor", language)}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
                <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="w-full">
                  Upload Image
                </Button>
              </div>

              {originalFile && (
                <div className="rounded-lg bg-slate-100 p-3 text-sm">
                  <p><strong>Selected:</strong> {originalFile.name}</p>
                  <p>
                    <strong>{t("tools.originalSize", language)}:</strong>{" "}
                    {(originalFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              )}

              <div>
                <Label>{t("tools.targetSize", language)}</Label>
                <div className="flex gap-2">
                  <Input 
                    type="number" 
                    value={targetSizeKb} 
                    onChange={(e) => setTargetSizeKb(Number(e.target.value) || 10)}
                    min={1} 
                    className="w-32"
                  />
                  <Button onClick={handleCompress} disabled={!originalFile || isProcessing}>
                    {isProcessing ? t("tools.calculating", language) : "Compress"}
                  </Button>
                </div>
              </div>

              {compressedUrl && (
                <div className="mt-6 space-y-4 rounded-xl border border-green-200 bg-green-50 p-4">
                  <h3 className="font-semibold text-green-800">{t("tools.success", language)}</h3>
                  <div className="aspect-video w-full rounded bg-slate-200/50 p-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={compressedUrl} alt="Compressed" className="h-full w-full object-contain" />
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-green-700">
                      {t("tools.compressedSize", language)}: {(compressedSize / 1024).toFixed(1)} KB
                    </p>
                    <a href={compressedUrl} download={`compressed-${targetSizeKb}kb.jpg`}>
                      <Button size="sm" className="gap-2">
                        <Download className="h-4 w-4" />
                        {t("tools.download", language)}
                      </Button>
                    </a>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          <div>
            <Card className="bg-blue-50/50">
               <CardContent className="p-6">
                 <h3 className="mb-2 font-semibold text-blue-800">Why use this?</h3>
                 <p className="text-sm text-blue-700">
                    Many government forms (like PAN, Passport, State Exams) require signatures to be exactly under 20KB or 50KB. Upload the signature or photo here, select target size, and the tool will automatically find the best quality setting to hit the target file size precisely!
                 </p>
               </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
