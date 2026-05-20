"use client";

import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScanFace, Upload, Loader2, AlertCircle, Activity } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ScanResult {
  label: string;
  score: number;
}

export function ScannerModal() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ScanResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setResults(null);
      setError(null);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleScan = async () => {
    if (!file) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append("image", file);
      
      const response = await fetch("/api/identify", {
        method: "POST",
        body: formData,
      });
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze image.");
      }
      
      // data is expected to be an array from HF inference API: [{ label: string, score: number }]
      if (Array.isArray(data)) {
        setResults(data.slice(0, 3)); // Only show top 3 results
      } else {
        throw new Error("Unexpected response format from AI.");
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred during analysis.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // The model labels often look like "Tomato___Bacterial_spot" or "Tomato___healthy"
  const formatLabel = (label: string) => {
    return label.replace(/___/g, " - ").replace(/_/g, " ");
  };

  return (
    <Dialog onOpenChange={(open) => !open && setTimeout(() => { setPreviewUrl(null); setResults(null); setFile(null); setError(null); }, 300)}>
      <DialogTrigger 
        render={
          <Button className="bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-full px-6">
            <ScanFace className="mr-2 h-4 w-4 text-green-400" />
            Launch AI Scanner
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md bg-black/95 border-white/10 text-slate-50 backdrop-blur-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <ScanFace className="mr-2 h-5 w-5 text-green-400" />
            AI Plant & Disease Scanner
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Upload an image of a leaf or plant to identify its species and diagnose potential health issues.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {!previewUrl ? (
            <div 
              className="border-2 border-dashed border-white/20 rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:border-green-500/50 hover:bg-green-500/5 transition-all group"
              onClick={triggerFileInput}
            >
              <div className="h-16 w-16 rounded-full bg-white/5 group-hover:bg-green-500/20 flex items-center justify-center mb-4 transition-colors">
                <Upload className="h-8 w-8 text-slate-400 group-hover:text-green-400 transition-colors" />
              </div>
              <p className="text-base font-medium text-slate-300">Click to upload specimen</p>
              <p className="text-sm text-slate-500 mt-1">Supports JPG, PNG (Max 5MB)</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden h-64 border border-white/10 bg-black/50 flex items-center justify-center group cursor-pointer" onClick={triggerFileInput}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewUrl} alt="Preview" className="max-h-full object-contain group-hover:opacity-50 transition-opacity" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <span className="bg-black/80 px-3 py-1.5 rounded-lg text-sm font-medium border border-white/10">Change Image</span>
                </div>
              </div>
              
              {!results && !loading && (
                <Button 
                  className="w-full bg-green-500 hover:bg-green-600 text-black font-medium py-6 rounded-xl shadow-[0_0_20px_-5px_rgba(34,197,94,0.4)]"
                  onClick={handleScan}
                >
                  <ScanFace className="mr-2 h-5 w-5" /> Analyze Specimen
                </Button>
              )}
              
              {loading && (
                <div className="flex flex-col items-center justify-center py-8 space-y-4 border border-white/10 rounded-2xl bg-white/[0.02]">
                  <div className="relative h-12 w-12 flex items-center justify-center">
                    <Loader2 className="absolute h-12 w-12 text-green-500/20 animate-spin" strokeWidth={3} />
                    <Loader2 className="absolute h-12 w-12 text-green-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-slate-300">Running Deep Learning Analysis...</p>
                    <p className="text-xs text-slate-500 mt-1">Connecting to Hugging Face</p>
                  </div>
                </div>
              )}
              
              {error && (
                <div className="flex items-start space-x-3 p-4 border border-red-500/30 bg-red-500/10 rounded-2xl text-red-400 text-sm">
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">{error}</p>
                </div>
              )}
              
              {results && (
                <MotionDiv className="space-y-4 border border-white/10 rounded-2xl p-4 bg-white/[0.02]">
                  <h4 className="text-sm font-medium text-slate-300 flex items-center border-b border-white/10 pb-3">
                    <Activity className="mr-2 h-4 w-4 text-green-400" /> Diagnosis Results
                  </h4>
                  <div className="space-y-3 pt-1">
                    {results.map((result, idx) => {
                      // Determine color based on confidence score and position
                      const isTop = idx === 0;
                      const colorClass = isTop && result.score > 0.8 
                        ? "text-green-400 bg-green-500" 
                        : "text-blue-400 bg-blue-500";
                        
                      return (
                        <div key={idx} className="bg-black/40 border border-white/5 p-3.5 rounded-xl flex flex-col gap-2.5">
                          <div className="flex justify-between items-center text-sm">
                            <span className={`font-medium truncate mr-2 ${isTop ? 'text-white' : 'text-slate-300'}`} title={formatLabel(result.label)}>
                              {formatLabel(result.label)}
                            </span>
                            <Badge variant="outline" className={`bg-transparent border-white/10 ${colorClass.split(' ')[0]} font-mono`}>
                              {(result.score * 100).toFixed(1)}%
                            </Badge>
                          </div>
                          <Progress value={result.score * 100} className="h-1.5 bg-white/10" indicatorClassName={colorClass.split(' ')[1]} />
                        </div>
                      );
                    })}
                  </div>
                </MotionDiv>
              )}
            </div>
          )}
          
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Simple wrapper to avoid framer-motion client-side errors inside a dialog if needed, 
// though DialogContent is already client-side here.
function MotionDiv({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={className} style={{ animation: "fadeIn 0.5s ease-out" }}>
      {children}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  )
}
