import React from 'react';
import { Loader2, CheckCircle2, Sparkles, Binary, Cpu, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

const steps = [
    { id: 'uploading', label: 'Transferring', icon: Binary },
    { id: 'extracting', label: 'Parsing', icon: Cpu },
    { id: 'summarizing', label: 'Analyzing', icon: Sparkles },
    { id: 'saving', label: 'Finalizing', icon: ShieldCheck },
];

export default function ProcessingStatus({ currentStep, isVisible }) {
    if (!isVisible) return null;

    const activeIndex = steps.findIndex(s => s.id === currentStep);

    return (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[1000] animate-in slide-in-from-bottom-4 duration-500 font-sans">
            <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center gap-6">

                {/* Active Stage Indicator */}
                <div className="flex items-center gap-3">
                    <div className="relative flex items-center justify-center">
                        <Loader2 className="w-5 h-5 text-rose-500 animate-spin" />
                        <div className="absolute inset-0 bg-rose-500/20 blur-md rounded-full animate-pulse" />
                    </div>
                    <span className="text-white font-black text-xs uppercase tracking-[0.2em] whitespace-nowrap animate-pulse">
                        {steps[activeIndex]?.label || 'Processing'}
                    </span>
                </div>

                {/* Separator */}
                <div className="w-[1px] h-4 bg-white/10" />

                {/* Mini Timeline Dots */}
                <div className="flex items-center gap-2">
                    {steps.map((step, idx) => {
                        const isCompleted = idx < activeIndex;
                        const isActive = idx === activeIndex;

                        return (
                            <div key={step.id} className="relative group">
                                <div
                                    className={cn(
                                        "w-2 h-2 rounded-full transition-all duration-500",
                                        isCompleted ? "bg-emerald-500 scale-100" : (isActive ? "bg-rose-500 scale-125 shadow-[0_0_10px_rgba(244,63,94,0.5)]" : "bg-white/20")
                                    )}
                                />

                                {/* Tooltip on Hover */}
                                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-[8px] text-white px-2 py-1 rounded-md uppercase font-bold tracking-widest whitespace-nowrap pointer-events-none">
                                    {step.label}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Success Checkmark for finished phases */}
                {activeIndex === steps.length - 1 && (
                    <div className="ml-2 animate-in zoom-in duration-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </div>
                )}
            </div>
        </div>
    );
}
