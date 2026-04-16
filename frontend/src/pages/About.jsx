import React from "react";
import BgGradient from "@/components/common/BgGradient";
import { BrainCircuit, Globe, ShieldCheck, Zap, Sparkles, MessageSquare, Users, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function About() {
    const stats = [
        { label: "Documents Parsed", value: "1.2M+" },
        { label: "Active Users", value: "50K+" },
        { label: "Hours Saved", value: "250K+" },
        { label: "AI Accuracy", value: "99.9%" },
    ];

    const features = [
        {
            icon: <Zap className="w-6 h-6 text-rose-500" />,
            title: "Lightning Fast AI",
            description: "Our custom Go backend ensures your PDFs are processed in milliseconds, not minutes.",
        },
        {
            icon: <ShieldCheck className="w-6 h-6 text-rose-500" />,
            title: "Privacy First",
            description: "Your documents are encrypted and processed securely. We never sell your data.",
        },
        {
            icon: <MessageSquare className="w-6 h-6 text-rose-500" />,
            title: "Intelligent Chat",
            description: "Don't just read summaries; converse with your documents to find specific answers.",
        },
        {
            icon: <Users className="w-6 h-6 text-rose-500" />,
            title: "Team working",
            description: "Built for collaboration. Share insights and summaries with your team effortlessly.",
        },
    ];

    return (
        <div className="relative min-h-screen pb-20 overflow-hidden">
            <BgGradient className="from-rose-50 via-white to-orange-50" />

            {/* Hero Section */}
            <div className="container mx-auto px-4 pt-32 relative z-10 max-w-5xl text-center">
                <h2 className="font-black text-xs uppercase tracking-[0.2em] mb-4 text-rose-500">
                    Our Mission
                </h2>
                <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight mb-8">
                    Bridging the gap between <span className="text-rose-500">Information</span> and <span className="text-rose-600">Knowledge</span>.
                </h1>
                <p className="text-xl text-slate-500 font-medium max-w-3xl mx-auto leading-relaxed mb-16">
                    SummPDF was born out of a simple frustration: too many documents, not enough time.
                    We're building the most intuitive AI-powered document intelligence platform to help
                    you master your data in seconds.
                </p>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mb-24">
                    {stats.map((stat, i) => (
                        <div key={i} className="p-6 bg-white/60 backdrop-blur-lg rounded-3xl border border-rose-100 shadow-xl shadow-rose-200/20">
                            <div className="text-3xl md:text-4xl font-black text-slate-900 mb-1">{stat.value}</div>
                            <div className="text-[10px] md:text-sm font-bold text-slate-500 uppercase tracking-widest">{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Narrative Section */}
                <div className="text-left mb-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-6">
                        <h3 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">Why we built SummPDF?</h3>
                        <p className="text-lg text-slate-500 font-medium leading-relaxed">
                            In an era of information overload, the ability to quickly synthesize and
                            understand lengthy documents is a superpower.
                        </p>
                        <p className="text-lg text-slate-500 font-medium leading-relaxed">
                            Whether you're a student preparing for finals, a researcher deep-diving
                            into papers, or a professional analyzing reports, SummPDF provides the
                            tools to extract the essence of any PDF instantly.
                        </p>
                    </div>
                    <div className="relative group">
                        <div className="absolute inset-0 bg-rose-500/20 blur-3xl rounded-full group-hover:scale-110 transition-transform duration-500" />
                        <div className="relative bg-white/80 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-rose-100 shadow-2xl">
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="flex gap-4 items-center">
                                        <CheckCircle2 className="text-rose-500 w-6 h-6 shrink-0" />
                                        <div className="h-4 bg-slate-100 rounded-full w-full" />
                                    </div>
                                ))}
                            </div>
                            <div className="mt-8 pt-8 border-t border-slate-100 flex items-center gap-4">
                                <div className="w-12 h-12 bg-rose-500 rounded-2xl flex items-center justify-center">
                                    <Sparkles className="text-white w-6 h-6" />
                                </div>
                                <div className="font-bold text-slate-900">AI Summary Engine Active</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left mb-24">
                    {features.map((feature, i) => (
                        <div key={feature.title} className="p-8 bg-white/60 backdrop-blur-xl rounded-3xl border border-white/20 shadow-xl group hover:shadow-2xl transition-all">
                            <div className="p-4 bg-rose-500/10 rounded-2xl w-fit mb-6 group-hover:bg-rose-500/20 transition-colors">
                                {feature.icon}
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">{feature.title}</h3>
                            <p className="text-slate-500 font-medium leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>

                {/* CTA Footer */}
                <div className="bg-slate-900 rounded-[3rem] p-12 lg:p-20 text-white relative overflow-hidden shadow-2xl border border-white/10 group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/20 blur-3xl rounded-full" />
                    <div className="relative z-10 flex flex-col items-center">
                        <h2 className="text-2xl lg:text-5xl font-black tracking-tight mb-4">Ready to transform your reading experience?</h2>
                        <p className="text-slate-400 font-medium text-lg mb-12 max-w-2xl">
                            Join thousands of users who are saving time and gaining insights with SummPDF today.
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-6">
                            <Link to="/upload" className="px-10 py-5 bg-rose-500 hover:bg-rose-600 text-white font-black rounded-2xl transition-all transform hover:scale-105 shadow-xl shadow-rose-900/40 no-underline">
                                Start Summarizing
                            </Link>
                            <Link to="/#pricing" className="px-10 py-5 bg-white/10 hover:bg-white/20 text-white font-black rounded-2xl transition-all border border-white/20 no-underline">
                                View Pricing
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
