"use client";

import { useEffect, useState, use } from "react";
import { Upload, XCircle, CheckCircle2, Loader2 } from "lucide-react";

export default function MobileUploadPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params);
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<"connecting" | "ready" | "uploading" | "success" | "error">("connecting");
  const [errorMessage, setErrorMessage] = useState("");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // get token from URL query string
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get("token");
    if (!urlToken) {
      setStatus("error");
      setErrorMessage("Invalid QR code. Missing token.");
      return;
    }
    setToken(urlToken);

    // Tell the PC we connected
    fetch(`/api/qr/upload/${sessionId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: urlToken, command: "connect" })
    }).then(res => {
      if (res.ok) setStatus("ready");
      else { setStatus("error"); setErrorMessage("Session expired or invalid."); }
    }).catch(() => {
      setStatus("error");
      setErrorMessage("Network error connecting to PC.");
    });
  }, [sessionId]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length || !token) return;
    setStatus("uploading");
    
    try {
      const filesArr = Array.from(e.target.files);
      const processedFiles = [];
      
      for (let i = 0; i < filesArr.length; i++) {
        const f = filesArr[i];
        
        // Convert to base64
        const base64 = await new Promise<string>((resolve, reject) => {
           const reader = new FileReader();
           reader.onload = () => {
              const result = reader.result as string;
              // strip data:image/png;base64,
              const b64Data = result.split(',')[1];
              resolve(b64Data);
           };
           reader.onerror = reject;
           reader.readAsDataURL(f);
        });

        processedFiles.push({
           name: f.name,
           size: f.size,
           mime: f.type,
           dataBase64: base64
        });
        
        setProgress(Math.round(((i + 0.5) / filesArr.length) * 100));
      }

      // Send to API
      const res = await fetch(`/api/qr/upload/${sessionId}`, {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ token, files: processedFiles })
      });

      if (!res.ok) throw new Error("Upload failed");
      
      setProgress(100);
      
      // Tell PC we are complete
      await fetch(`/api/qr/upload/${sessionId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, command: "complete" })
      });

      setStatus("success");
    } catch (err) {
      console.error(err);
      setStatus("error");
      setErrorMessage("Failed to upload files. File might be too large.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6 fontFamily-sans">
       <div className="w-full max-w-sm bg-slate-800 rounded-2xl p-8 shadow-2xl border border-slate-700 select-none">
          
          <div className="text-center mb-8">
            <h1 className="text-xl font-bold tracking-tight text-white mb-2">CyberCafe Print Studio</h1>
            <p className="text-sm text-slate-400">Send files to PC</p>
          </div>

          {status === "connecting" && (
             <div className="flex flex-col items-center justify-center py-10 opacity-70">
                <Loader2 className="h-8 w-8 animate-spin mb-4 text-blue-400" />
                <p className="text-sm">Connecting to PC...</p>
             </div>
          )}

          {status === "error" && (
             <div className="flex flex-col items-center justify-center py-6 text-red-400 text-center">
                <XCircle className="h-12 w-12 mb-4 opacity-80" />
                <p className="text-sm font-medium">{errorMessage}</p>
             </div>
          )}

          {status === "success" && (
             <div className="flex flex-col items-center justify-center py-8 text-green-400 text-center">
                <CheckCircle2 className="h-14 w-14 mb-4" />
                <h2 className="text-lg font-semibold text-white mb-1">Transfer Complete!</h2>
                <p className="text-sm text-slate-400">You can now view the files on the PC.</p>
             </div>
          )}

          {status === "uploading" && (
             <div className="py-8">
                <div className="flex justify-between items-center mb-2">
                   <span className="text-sm font-medium">Uploading...</span>
                   <span className="text-sm">{progress}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2.5">
                   <div className="bg-blue-500 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                </div>
             </div>
          )}

          {status === "ready" && (
             <div className="space-y-4">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-600 hover:border-slate-500 hover:bg-slate-700/50 rounded-xl cursor-pointer transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-3 text-slate-400" />
                    <p className="mb-2 text-sm font-semibold text-slate-300">Select Files or Photos</p>
                    <p className="text-xs text-slate-500">Max 50 files</p>
                  </div>
                  <input type="file" className="hidden" multiple accept="image/*,.pdf" onChange={handleFileChange} />
                </label>
             </div>
          )}

       </div>
    </div>
  );
}
