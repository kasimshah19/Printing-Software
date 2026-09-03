"use client";

import { useState, useRef } from "react";
import { AppHeader } from "@/components/common/app-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { t } from "@/lib/i18n";
import { useSettingsStore } from "@/store";
import {
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Image as ImageIcon,
  FileSignature,
  FileCheck,
  FileOutput,
} from "lucide-react";

type ActiveTool = "compressor" | "signature" | "validator" | "converter";

// ─── Image Compression Engine ──────────────────────────
async function compressToTarget(
  imgUrl: string,
  targetBytes: number
): Promise<{ blob: Blob; quality: number } | null> {
  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject();
    img.src = imgUrl;
  });

  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0);

  let minQ = 0.01;
  let maxQ = 1.0;
  let quality = 0.8;
  let bestBlob: Blob | null = null;
  let iters = 0;

  while (iters < 8) {
    const blob = await new Promise<Blob | null>((res) =>
      canvas.toBlob(res, "image/jpeg", quality)
    );
    if (!blob) break;
    bestBlob = blob;
    if (blob.size > targetBytes) {
      maxQ = quality;
    } else {
      minQ = quality;
      if (targetBytes - blob.size < targetBytes * 0.1) break;
    }
    quality = (minQ + maxQ) / 2;
    iters++;
  }

  return bestBlob ? { blob: bestBlob, quality } : null;
}

// ─── Resize Image ──────────────────────────────────────
async function resizeImage(
  imgUrl: string,
  targetW: number,
  targetH: number,
  format: string
): Promise<Blob | null> {
  const img = new Image();
  await new Promise<void>((res, rej) => {
    img.onload = () => res();
    img.onerror = () => rej();
    img.src = imgUrl;
  });
  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  if (format === "image/jpeg") {
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, targetW, targetH);
  }
  ctx.drawImage(img, 0, 0, targetW, targetH);
  return new Promise<Blob | null>((res) =>
    canvas.toBlob(res, format, 0.92)
  );
}

export default function FileToolsPage() {
  const language = useSettingsStore((s) => s.settings.language);
  const [activeTool, setActiveTool] = useState<ActiveTool>("compressor");

  const tools = [
    { key: "compressor" as const, icon: ImageIcon, label: t("tools.compressor", language) },
    { key: "signature" as const, icon: FileSignature, label: t("tools.signature", language) },
    { key: "validator" as const, icon: FileCheck, label: "File Validator" },
    { key: "converter" as const, icon: FileOutput, label: "Format Converter" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold text-slate-900">
          {t("tools.title", language)}
        </h1>

        <div className="mb-6 flex flex-wrap gap-2">
          {tools.map(({ key, icon: Icon, label }) => (
            <Button
              key={key}
              variant={activeTool === key ? "default" : "outline"}
              onClick={() => setActiveTool(key)}
              className="gap-2"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Button>
          ))}
        </div>

        {activeTool === "compressor" && <CompressorTool />}
        {activeTool === "signature" && <SignatureTool />}
        {activeTool === "validator" && <ValidatorTool />}
        {activeTool === "converter" && <ConverterTool />}
      </main>
    </div>
  );
}

// ─── COMPRESSOR ────────────────────────────────────────
function CompressorTool() {
  const language = useSettingsStore((s) => s.settings.language);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState("");
  const [targetSizeKb, setTargetSizeKb] = useState(50);
  const [compressedUrl, setCompressedUrl] = useState("");
  const [compressedSize, setCompressedSize] = useState(0);
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
    if (!originalFile || !originalUrl) return;
    setIsProcessing(true);
    const result = await compressToTarget(originalUrl, targetSizeKb * 1024);
    if (result) {
      setCompressedSize(result.blob.size);
      if (compressedUrl) URL.revokeObjectURL(compressedUrl);
      setCompressedUrl(URL.createObjectURL(result.blob));
    }
    setIsProcessing(false);
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>{t("tools.compressor", language)}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
          <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="w-full gap-2">
            <Upload className="h-4 w-4" /> Upload Image
          </Button>
          {originalFile && (
            <div className="rounded-lg bg-slate-100 p-3 text-sm space-y-1">
              <p><strong>File:</strong> {originalFile.name}</p>
              <p><strong>{t("tools.originalSize", language)}:</strong> {(originalFile.size / 1024).toFixed(1)} KB</p>
            </div>
          )}
          <div>
            <Label>{t("tools.targetSize", language)}</Label>
            <div className="flex gap-2">
              <Input type="number" value={targetSizeKb} onChange={(e) => setTargetSizeKb(Number(e.target.value) || 10)} min={1} className="w-32" />
              <span className="self-center text-sm text-slate-500">KB</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {[10, 20, 50, 100, 200].map((sz) => (
              <Button key={sz} size="sm" variant={targetSizeKb === sz ? "default" : "outline"} onClick={() => setTargetSizeKb(sz)}>
                {sz} KB
              </Button>
            ))}
          </div>
          <Button onClick={handleCompress} disabled={!originalFile || isProcessing} className="w-full">
            {isProcessing ? t("tools.calculating", language) : "Compress"}
          </Button>
          {compressedUrl && (
            <div className="space-y-3 rounded-xl border border-green-200 bg-green-50 p-4">
              <div className="flex items-center gap-2 text-green-800 font-semibold">
                <CheckCircle2 className="h-5 w-5" /> {t("tools.success", language)}
              </div>
              <div className="aspect-video w-full rounded bg-white p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={compressedUrl} alt="Compressed" className="h-full w-full object-contain" />
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <span className="text-green-700 font-medium">{(compressedSize / 1024).toFixed(1)} KB</span>
                  {originalFile && (
                    <span className="ml-2 text-slate-500">
                      ({(((originalFile.size - compressedSize) / originalFile.size) * 100).toFixed(1)}% smaller)
                    </span>
                  )}
                </div>
                <a href={compressedUrl} download={`compressed-${targetSizeKb}kb.jpg`}>
                  <Button size="sm" className="gap-2"><Download className="h-4 w-4" />{t("tools.download", language)}</Button>
                </a>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      <Card className="bg-blue-50/50 self-start">
        <CardContent className="p-6 space-y-3">
          <h3 className="font-semibold text-blue-800">Quick Guide</h3>
          <ul className="text-sm text-blue-700 space-y-2 list-disc pl-4">
            <li><strong>PAN Card Photo:</strong> Max 50 KB, JPG</li>
            <li><strong>Passport Photo:</strong> Max 200 KB, JPG</li>
            <li><strong>Exam Form:</strong> Varies, typically 20-100 KB</li>
            <li><strong>Signature:</strong> Max 10-20 KB</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── SIGNATURE STUDIO ──────────────────────────────────
function SignatureTool() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [originalUrl, setOriginalUrl] = useState("");
  const [targetW, setTargetW] = useState(300);
  const [targetH, setTargetH] = useState(100);
  const [targetKb, setTargetKb] = useState(20);
  const [outputFormat, setOutputFormat] = useState("image/jpeg");
  const [resultUrl, setResultUrl] = useState("");
  const [resultSize, setResultSize] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    setOriginalUrl(URL.createObjectURL(file));
    setResultUrl("");
  };

  const handleProcess = async () => {
    if (!originalUrl) return;
    setIsProcessing(true);

    // First resize
    const resized = await resizeImage(originalUrl, targetW, targetH, outputFormat);
    if (!resized) { setIsProcessing(false); return; }

    // Then compress to target if JPG
    if (outputFormat === "image/jpeg" && resized.size > targetKb * 1024) {
      const resizedUrl = URL.createObjectURL(resized);
      const result = await compressToTarget(resizedUrl, targetKb * 1024);
      URL.revokeObjectURL(resizedUrl);
      if (result) {
        if (resultUrl) URL.revokeObjectURL(resultUrl);
        setResultUrl(URL.createObjectURL(result.blob));
        setResultSize(result.blob.size);
      }
    } else {
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(URL.createObjectURL(resized));
      setResultSize(resized.size);
    }
    setIsProcessing(false);
  };

  const ext = outputFormat === "image/png" ? "png" : "jpg";

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader><CardTitle>Signature Studio</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
          <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="w-full gap-2">
            <Upload className="h-4 w-4" /> Upload Signature
          </Button>
          {originalUrl && (
            <div className="rounded border border-slate-200 bg-white p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={originalUrl} alt="Original" className="mx-auto max-h-24 object-contain" />
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Width (px)</Label>
              <Input type="number" value={targetW} onChange={(e) => setTargetW(Number(e.target.value))} min={10} />
            </div>
            <div>
              <Label>Height (px)</Label>
              <Input type="number" value={targetH} onChange={(e) => setTargetH(Number(e.target.value))} min={10} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Max File Size (KB)</Label>
              <Input type="number" value={targetKb} onChange={(e) => setTargetKb(Number(e.target.value))} min={1} />
            </div>
            <div>
              <Label>Format</Label>
              <Select value={outputFormat} onChange={(e) => setOutputFormat(e.target.value)}>
                <option value="image/jpeg">JPG</option>
                <option value="image/png">PNG</option>
              </Select>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => { setTargetW(300); setTargetH(100); setTargetKb(20); }}>
              Exam Signature
            </Button>
            <Button size="sm" variant="outline" onClick={() => { setTargetW(200); setTargetH(70); setTargetKb(10); }}>
              PAN Signature
            </Button>
            <Button size="sm" variant="outline" onClick={() => { setTargetW(400); setTargetH(150); setTargetKb(50); }}>
              Large Signature
            </Button>
          </div>
          <Button onClick={handleProcess} disabled={!originalUrl || isProcessing} className="w-full">
            {isProcessing ? "Processing..." : "Process Signature"}
          </Button>
          {resultUrl && (
            <div className="space-y-3 rounded-xl border border-green-200 bg-green-50 p-4">
              <div className="flex items-center gap-2 text-green-800 font-semibold">
                <CheckCircle2 className="h-5 w-5" /> Ready!
              </div>
              <div className="rounded bg-white p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={resultUrl} alt="Processed Signature" className="mx-auto max-h-20 object-contain" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-700 font-medium">{targetW}×{targetH}px · {(resultSize / 1024).toFixed(1)} KB</span>
                <a href={resultUrl} download={`signature.${ext}`}>
                  <Button size="sm" className="gap-2"><Download className="h-4 w-4" /> Download</Button>
                </a>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      <Card className="bg-amber-50/50 self-start">
        <CardContent className="p-6 space-y-3">
          <h3 className="font-semibold text-amber-800">Signature Tips</h3>
          <ul className="text-sm text-amber-700 space-y-2 list-disc pl-4">
            <li>Sign with dark ink on white paper</li>
            <li>Take photo in good lighting</li>
            <li>Most exams need: 300×100px, under 20KB</li>
            <li>Use JPG for smaller file sizes</li>
            <li>Use PNG if transparency is needed</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── FILE VALIDATOR ────────────────────────────────────
function ValidatorTool() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [imageInfo, setImageInfo] = useState<{ w: number; h: number } | null>(null);
  const [reqFormat, setReqFormat] = useState("jpg");
  const [reqMaxKb, setReqMaxKb] = useState(200);
  const [reqMinW, setReqMinW] = useState(200);
  const [reqMinH, setReqMinH] = useState(200);
  const [reqMaxW, setReqMaxW] = useState(5000);
  const [reqMaxH, setReqMaxH] = useState(5000);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    const url = URL.createObjectURL(f);
    const img = new Image();
    img.onload = () => {
      setImageInfo({ w: img.naturalWidth, h: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const checks = file && imageInfo ? [
    {
      label: "Format",
      pass: file.type.includes(reqFormat === "jpg" ? "jpeg" : reqFormat),
      value: file.type.split("/")[1]?.toUpperCase() ?? "?",
    },
    {
      label: "File Size",
      pass: file.size <= reqMaxKb * 1024,
      value: `${(file.size / 1024).toFixed(1)} KB (max ${reqMaxKb} KB)`,
    },
    {
      label: "Min Dimensions",
      pass: imageInfo.w >= reqMinW && imageInfo.h >= reqMinH,
      value: `${imageInfo.w}×${imageInfo.h} (min ${reqMinW}×${reqMinH})`,
    },
    {
      label: "Max Dimensions",
      pass: imageInfo.w <= reqMaxW && imageInfo.h <= reqMaxH,
      value: `${imageInfo.w}×${imageInfo.h} (max ${reqMaxW}×${reqMaxH})`,
    },
  ] : [];

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader><CardTitle>File Validator</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
          <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="w-full gap-2">
            <Upload className="h-4 w-4" /> Upload File to Validate
          </Button>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Required Format</Label>
              <Select value={reqFormat} onChange={(e) => setReqFormat(e.target.value)}>
                <option value="jpg">JPG</option>
                <option value="png">PNG</option>
                <option value="webp">WebP</option>
              </Select>
            </div>
            <div>
              <Label>Max Size (KB)</Label>
              <Input type="number" value={reqMaxKb} onChange={(e) => setReqMaxKb(Number(e.target.value))} />
            </div>
            <div>
              <Label>Min W×H</Label>
              <div className="flex gap-1">
                <Input type="number" value={reqMinW} onChange={(e) => setReqMinW(Number(e.target.value))} className="w-20" />
                <Input type="number" value={reqMinH} onChange={(e) => setReqMinH(Number(e.target.value))} className="w-20" />
              </div>
            </div>
            <div>
              <Label>Max W×H</Label>
              <div className="flex gap-1">
                <Input type="number" value={reqMaxW} onChange={(e) => setReqMaxW(Number(e.target.value))} className="w-20" />
                <Input type="number" value={reqMaxH} onChange={(e) => setReqMaxH(Number(e.target.value))} className="w-20" />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => { setReqFormat("jpg"); setReqMaxKb(200); setReqMinW(200); setReqMinH(200); setReqMaxW(5000); setReqMaxH(5000); }}>
              Passport Photo
            </Button>
            <Button size="sm" variant="outline" onClick={() => { setReqFormat("jpg"); setReqMaxKb(50); setReqMinW(100); setReqMinH(100); setReqMaxW(1000); setReqMaxH(1000); }}>
              Exam Photo
            </Button>
            <Button size="sm" variant="outline" onClick={() => { setReqFormat("jpg"); setReqMaxKb(20); setReqMinW(100); setReqMinH(50); setReqMaxW(500); setReqMaxH(200); }}>
              Signature
            </Button>
          </div>
          {checks.length > 0 && (
            <div className="space-y-2 rounded-xl border p-4">
              {checks.map((c, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    {c.pass ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <AlertTriangle className="h-4 w-4 text-red-500" />}
                    {c.label}
                  </span>
                  <span className={c.pass ? "text-green-700" : "text-red-600 font-medium"}>{c.value}</span>
                </div>
              ))}
              <div className="mt-3 pt-3 border-t text-center">
                {checks.every((c) => c.pass)
                  ? <span className="text-green-700 font-semibold">✓ File meets all requirements</span>
                  : <span className="text-red-600 font-semibold">✗ File does NOT meet requirements</span>
                }
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── FORMAT CONVERTER ──────────────────────────────────
function ConverterTool() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [originalUrl, setOriginalUrl] = useState("");
  const [originalName, setOriginalName] = useState("");
  const [outputFormat, setOutputFormat] = useState("image/png");
  const [resultUrl, setResultUrl] = useState("");
  const [resultSize, setResultSize] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setOriginalName(file.name.split(".")[0]);
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    setOriginalUrl(URL.createObjectURL(file));
    setResultUrl("");
  };

  const handleConvert = async () => {
    if (!originalUrl) return;
    setIsProcessing(true);
    const img = new Image();
    await new Promise<void>((res) => {
      img.onload = () => res();
      img.src = originalUrl;
    });
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) { setIsProcessing(false); return; }

    if (outputFormat === "image/jpeg") {
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(img, 0, 0);

    const blob = await new Promise<Blob | null>((res) =>
      canvas.toBlob(res, outputFormat, 0.92)
    );
    if (blob) {
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(URL.createObjectURL(blob));
      setResultSize(blob.size);
    }
    setIsProcessing(false);
  };

  const extMap: Record<string, string> = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp" };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader><CardTitle>Format Converter</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
          <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="w-full gap-2">
            <Upload className="h-4 w-4" /> Upload Image
          </Button>
          <div>
            <Label>Convert To</Label>
            <Select value={outputFormat} onChange={(e) => setOutputFormat(e.target.value)}>
              <option value="image/png">PNG</option>
              <option value="image/jpeg">JPG</option>
              <option value="image/webp">WebP</option>
            </Select>
          </div>
          <Button onClick={handleConvert} disabled={!originalUrl || isProcessing} className="w-full">
            {isProcessing ? "Converting..." : "Convert"}
          </Button>
          {resultUrl && (
            <div className="space-y-3 rounded-xl border border-green-200 bg-green-50 p-4">
              <div className="flex items-center gap-2 text-green-800 font-semibold">
                <CheckCircle2 className="h-5 w-5" /> Converted!
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-700">{(resultSize / 1024).toFixed(1)} KB · .{extMap[outputFormat]}</span>
                <a href={resultUrl} download={`${originalName}.${extMap[outputFormat]}`}>
                  <Button size="sm" className="gap-2"><Download className="h-4 w-4" /> Download</Button>
                </a>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
