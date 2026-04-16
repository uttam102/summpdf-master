import { FileText, Globe, Briefcase, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import React from "react";

function Footer() {
  return (
    <footer className="relative mt-24">
      <div className="container mx-auto px-4 -mb-20 relative z-10">
        <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 rounded-3xl p-8 lg:p-12 shadow-2xl border border-white/10 relative overflow-hidden group">
          <div className="absolute inset-0 bg-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-2xl text-center md:text-left">
              <h3 className="text-3xl md:text-4xl font-black text-white leading-tight">
                Empower Your Knowledge
              </h3>
              <p className="text-slate-400 text-lg leading-relaxed font-medium">
                SummPDF isn't just a tool, it's your personal AI bridge to
                understanding complex information. Save hours, extract insights,
                and master your documents in seconds.
              </p>
            </div>
            <div className="shrink-0">
              <Link
                to="/upload"
                className="inline-flex items-center justify-center px-10 py-5 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl shadow-rose-900/40 no-underline"
              >
                Start Uploading Now
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-950 pt-32 pb-12 border-t border-white/5">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div className="space-y-6">
              <Link to="/" className="flex items-center gap-3 no-underline">
                <div className="p-2 bg-rose-500/10 rounded-xl border border-rose-500/20">
                  <FileText className="w-8 h-8 text-rose-500" />
                </div>
                <span className="text-2xl font-black text-white tracking-tight">
                  SummPDF
                </span>
              </Link>
              <p className="text-slate-500 leading-relaxed font-medium">
                The leading AI-powered PDF summarization platform. Turning
                lengthy documents into actionable insights since 2024.
              </p>
              <div className="flex gap-4">
                <a href="https://github.com/AKASH-KALSARIYA" className="p-2 bg-white/5 rounded-lg hover:bg-rose-500/10 text-gray-400 hover:text-rose-500 transition-colors">
                  <Globe size={20} />
                </a>
                <a href="https://www.linkedin.com/in/akash-kalsariya-9725822a2/" className="p-2 bg-white/5 rounded-lg hover:bg-rose-500/10 text-gray-400 hover:text-rose-500 transition-colors">
                  <Briefcase size={20} />
                </a>
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="text-white font-black uppercase tracking-widest text-xs">Product</h4>
              <ul className="space-y-4 list-none p-0">
                <li><Link to="/upload" className="text-slate-500 hover:text-rose-400 transition-colors no-underline font-medium">PDF Summarizer</Link></li>
                <li><Link to="/dashboard" className="text-slate-500 hover:text-rose-400 transition-colors no-underline font-medium">User Dashboard</Link></li>
                <li><Link to="/pricing" className="text-slate-500 hover:text-rose-400 transition-colors no-underline font-medium">Pricing Plans</Link></li>
                <li><Link to="#" className="text-slate-500 hover:text-rose-400 transition-colors no-underline font-medium">AI Features</Link></li>
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="text-white font-black uppercase tracking-widest text-xs">Company</h4>
              <ul className="space-y-4 list-none p-0">
                <li><Link to="/about" className="text-slate-500 hover:text-rose-400 transition-colors no-underline font-medium">About Us</Link></li>
                <li><Link to="/about#mission" className="text-slate-500 hover:text-rose-400 transition-colors no-underline font-medium">Our Mission</Link></li>
                <li><a href="mailto:contact@summpdf.ai" className="text-slate-500 hover:text-rose-400 transition-colors no-underline font-medium">Contact Support</a></li>
                <li><Link to="#" className="text-slate-500 hover:text-rose-400 transition-colors no-underline font-medium">Blog</Link></li>
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="text-white font-black uppercase tracking-widest text-xs">Legal & Trust</h4>
              <ul className="space-y-4 list-none p-0">
                <li><Link to="#" className="text-slate-500 hover:text-rose-400 transition-colors no-underline font-medium">Privacy Policy</Link></li>
                <li><Link to="#" className="text-slate-500 hover:text-rose-400 transition-colors no-underline font-medium">Terms of Service</Link></li>
                <li><Link to="#" className="text-slate-500 hover:text-rose-400 transition-colors no-underline font-medium">Cookie Policy</Link></li>
                <li><Link to="#" className="text-slate-500 hover:text-rose-400 transition-colors no-underline font-medium">GDPR Compliance</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-slate-500 font-medium">
            <p>© {new Date().getFullYear()} SummPDF Inc. All rights reserved.</p>
            <div className="flex items-center gap-2">
              <Mail size={16} className="text-rose-500" />
              <span>contact@summpdf.ai</span>
            </div>
            <p className="flex items-center gap-1">
              Made with <span className="text-rose-600">❤</span> for knowledge seekers
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
