import { CheckCircle2, FileText, Sparkles } from "lucide-react";
import React from "react";

function DemoSection() {
  return (
    <section className="relative overflow-hidden py-12 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Background Decorative Blob */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 transform-gpu overflow-hidden blur-3xl opacity-20"
        >
          <div
            style={{
              clipPath:
                "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
            }}
            className="relative left-[calc(50%+3rem)] aspect-1155/678 w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-br from-rose-500 via-teal-500 to-cyan-500 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
          />
        </div>

        <div className="flex flex-col items-center text-center space-y-12">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-rose-50 border border-rose-100 shadow-sm mb-4">
            <Sparkles className="w-8 h-8 text-rose-500 animate-pulse" />
          </div>

          <div className="text-center space-y-4">
            <h3 className="font-black text-3xl lg:text-5xl text-slate-900 max-w-3xl mx-auto tracking-tight leading-tight">
              Watch how SummPDF transforms{" "}
              <span className="bg-gradient-to-r from-rose-500 to-rose-700 bg-clip-text text-transparent">
                complex documents
              </span>{" "}
              into easy-to-read insights!
            </h3>
            <p className="text-slate-500 font-medium max-w-2xl mx-auto">
              Our AI engine distills technical papers, legal contracts, and industry reports
              into punchy, actionable summaries in seconds.
            </p>
          </div>

          <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch pt-8">
            {/* The "Complex" PDF View */}
            <div className="bg-white/40 backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl p-8 relative overflow-hidden group min-h-[400px]">
              <div className="absolute top-0 left-0 w-full h-1 bg-rose-500/20 animate-scan pointer-events-none" />
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <FileText className="w-5 h-5 text-slate-400" />
                </div>
                <span className="text-sm font-bold text-slate-400 uppercase tracking-widest text-[10px]">Complex Document (PDF)</span>
              </div>

              <div className="space-y-4 opacity-40 select-none">
                <div className="h-4 bg-slate-200 rounded-full w-3/4" />
                <div className="h-4 bg-slate-200 rounded-full w-full" />
                <div className="h-4 bg-slate-200 rounded-full w-5/6" />
                <div className="h-4 bg-slate-200 rounded-full w-full" />
                <div className="h-4 bg-slate-200 rounded-full w-4/5" />
                <div className="h-4 bg-slate-200 rounded-full w-full" />
                <div className="h-4 bg-slate-200 rounded-full w-2/3" />
                <div className="h-4 bg-slate-200 rounded-full w-full" />
                <div className="h-4 bg-slate-200 rounded-full w-5/6" />
                <div className="h-4 bg-slate-200 rounded-full w-full" />
              </div>

              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/10 backdrop-blur-[2px]">
                <span className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-xl">Analyzing Structure...</span>
              </div>
            </div>

            {/* The "SummPDF" Insight View */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl shadow-2xl p-8 text-white relative overflow-hidden group border border-white/10 min-h-[400px]">
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-rose-500/20 blur-3xl rounded-full" />

              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-rose-500/20 rounded-lg border border-rose-500/30">
                  <Sparkles className="w-5 h-5 text-rose-400" />
                </div>
                <span className="text-sm font-black text-rose-400 uppercase tracking-widest text-[10px]">SummPDF Insight</span>
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  {[
                    "Core Thesis: The integration of AI in PDF processing reduces manual review time by 85%.",
                    "Key Finding: Natural Language Processing (NLP) enables context-aware summarization.",
                    "Action Item: Automate document triage using SummPDF's structured Go API."
                  ].map((text, i) => (
                    <div key={i} className="flex gap-4 items-start group/item">
                      <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5 group-hover/item:scale-110 transition-transform" />
                      <p className="text-slate-300 font-medium text-sm leading-relaxed group-hover/item:text-white transition-colors text-left">{text}</p>
                    </div>
                  ))}
                </div>

                <div className="pt-6 border-t border-white/10 flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Confidence Score: 98%</span>
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-800 bg-slate-700 flex items-center justify-center text-[10px] font-bold">AI</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default DemoSection;
