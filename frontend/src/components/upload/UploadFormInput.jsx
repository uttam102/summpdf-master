"use client";

import { CloudUpload, FileText, Loader2, X, Sparkles, Cpu, Zap } from "lucide-react";
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const engines = [
  { id: 'gemini', name: 'Gemini', icon: Sparkles, desc: 'Cloud AI', color: 'text-rose-500', border: 'border-rose-200', bg: 'bg-rose-50' },
  { id: 'ollama', name: 'Ollama', icon: Cpu, desc: 'Local LLM', color: 'text-purple-500', border: 'border-purple-200', bg: 'bg-purple-50' },
  { id: 'extractive', name: 'NLP', icon: Zap, desc: 'Extractive', color: 'text-amber-500', border: 'border-amber-200', bg: 'bg-amber-50' },
];

const styles = [
  { id: 'concise', name: 'Concise', desc: 'Balanced summary' },
  { id: 'detailed', name: 'Detailed', desc: 'In-depth analysis' },
  { id: 'one-liner', name: 'One-Liner', desc: 'Ultra-concise ✨' },
  { id: 'bullet', name: 'Bullets', desc: 'Key points only' },
  { id: 'simple', name: 'Simple', desc: 'Plain language' },
];

function UploadFormInput({
  beforeUpload,
  handleSubmit,
  setIsProcessing,
  setCurrentStep,
  selectedEngine,
  setSelectedEngine,
  selectedStyle,
  setSelectedStyle
}) {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== "application/pdf") {
        toast.error("Please upload a PDF file.");
        return;
      }
      setFile(selectedFile);
    }
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      if (droppedFile.type !== "application/pdf") {
        toast.error("Please upload a PDF file.");
        return;
      }
      setFile(droppedFile);
    }
  }, []);

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file first.");
      return;
    }

    if (beforeUpload && !beforeUpload([file]).length) return;

    const formData = new FormData();
    formData.append("pdf", file);

    try {
      setIsProcessing(true);
      setCurrentStep('uploading');

      const response = await fetch("http://localhost:8081/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: "Backend upload failed" }));
        throw new Error(errData.error || "Backend upload failed");
      }

      const data = await response.json();

      setCurrentStep('extracting');
      await new Promise(r => setTimeout(r, 800));

      setFile(null);
      handleSubmit([{
        url: data.url,
        name: data.name,
      }]);
    } catch (err) {
      console.error("Manual Upload Err:", err);
      toast.error(`Upload failed: ${err.message}`);
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      <div
        className={cn(
          "relative group cursor-pointer p-10 border-2 border-dashed rounded-[2rem] transition-all duration-300 flex flex-col items-center justify-center text-center gap-6 overflow-hidden bg-white/50 backdrop-blur-sm",
          isDragging ? "border-rose-500 bg-rose-50/50 scale-[1.02]" : "border-slate-200 hover:border-rose-400 hover:bg-slate-50/50",
          file && "border-rose-500 bg-rose-50/10"
        )}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => !file && document.getElementById("file-input").click()}
      >
        <input
          id="file-input"
          type="file"
          className="hidden"
          accept="application/pdf"
          onChange={handleFileChange}
        />

        {file ? (
          <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300 w-full font-sans">
            <div className="relative">
              <div className="p-4 bg-rose-500 rounded-2xl shadow-lg">
                <FileText className="text-white w-8 h-8" />
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setFile(null); }}
                className="absolute -top-2 -right-2 p-1 bg-slate-900 text-white rounded-full hover:bg-slate-700"
              >
                <X size={14} />
              </button>
            </div>
            <div className="space-y-1">
              <p className="font-bold text-slate-800 truncate max-w-[200px]">{file.name}</p>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                {(file.size / (1024 * 1024)).toFixed(2)} MB • READY
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="p-5 bg-slate-100 rounded-2xl group-hover:bg-rose-100 transition-colors duration-300">
              <CloudUpload className="w-8 h-8 text-slate-400 group-hover:text-rose-500 transition-colors duration-300" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-800 tracking-tight">Upload your PDF</h3>
              <p className="text-slate-500 text-sm">Drag & drop or click to browse</p>
            </div>
          </>
        )}
      </div>

      {file && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-5 duration-500">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Select AI Engine</span>
            <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter",
              selectedEngine === 'gemini' ? "bg-rose-100 text-rose-600" :
                selectedEngine === 'ollama' ? "bg-purple-100 text-purple-600" : "bg-amber-100 text-amber-600"
            )}>
              {selectedEngine} Active
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {engines.map((eng) => (
              <button
                key={eng.id}
                onClick={() => setSelectedEngine(eng.id)}
                className={cn(
                  "relative flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all duration-300 group/btn",
                  selectedEngine === eng.id
                    ? cn(eng.border, eng.bg, "shadow-md scale-[1.02]")
                    : "border-slate-100 hover:border-slate-200 bg-white shadow-sm"
                )}
              >
                <div className={cn(
                  "p-2 rounded-xl transition-colors duration-300",
                  selectedEngine === eng.id ? "bg-white shadow-sm" : "bg-slate-50 group-hover/btn:bg-slate-100"
                )}>
                  <eng.icon className={cn("w-5 h-5", selectedEngine === eng.id ? eng.color : "text-slate-400")} />
                </div>
                <div className="text-center">
                  <p className={cn("text-[11px] font-black uppercase tracking-tight", selectedEngine === eng.id ? "text-slate-800" : "text-slate-500")}>
                    {eng.name}
                  </p>
                  <p className="text-[9px] text-slate-400 font-medium leading-none">{eng.desc}</p>
                </div>
                {selectedEngine === eng.id && (
                  <div className={cn("absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white", eng.bg.replace('bg-', 'bg-').replace('50', '500'))} />
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between px-1 pt-2">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Summary Style</span>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {styles.map((style) => (
              <button
                key={style.id}
                onClick={() => setSelectedStyle(style.id)}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded-xl border transition-all duration-200",
                  selectedStyle === style.id
                    ? "border-rose-400 bg-rose-50 shadow-sm"
                    : "border-slate-100 hover:border-slate-200 bg-white"
                )}
                title={style.desc}
              >
                <p className={cn("text-[10px] font-bold truncate w-full text-center", selectedStyle === style.id ? "text-rose-600" : "text-slate-600")}>
                  {style.name}
                </p>
              </button>
            ))}
          </div>

          <button
            onClick={handleUpload}
            className="w-full py-4 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 transform active:scale-95 group-hover:shadow-rose-200"
          >
            <Sparkles className="w-4 h-4 group-hover:animate-spin" />
            Generate {engines.find(e => e.id === selectedEngine)?.name} Summary
          </button>
        </div>
      )}
    </div>
  );
}

export default UploadFormInput;
