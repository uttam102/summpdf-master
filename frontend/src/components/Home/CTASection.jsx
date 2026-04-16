import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import React from "react";
import { Button } from "../ui/button";

function CTASection() {
  return (
    <section className="bg-rose-50/50 py-12 lg:py-24 border-t border-rose-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center space-y-8 text-center">
          <div className="space-y-4">
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl md:text-5xl text-slate-900 leading-tight">
              Ready to Save Hours of Reading Time?
            </h2>
            <p className="mx-auto max-w-[700px] text-slate-500 md:text-xl font-medium leading-relaxed">
              Transform lengthy documents into clear, actionable insights with
              our AI-powered summarizer. Get started for free today.
            </p>
          </div>
          <div className="flex flex-col min-[400px]:flex-row justify-center w-full">
            <Link
              to="/upload"
              className="no-underline w-full min-[400px]:w-auto group"
            >
              <Button
                size="lg"
                className="w-full min-[400px]:w-auto px-10 py-8 text-lg font-black bg-gradient-to-r from-slate-900 to-rose-600 hover:from-rose-600 hover:to-slate-900 text-white rounded-2xl shadow-2xl shadow-rose-200 transition-all duration-300 active:scale-95 border-0"
              >
                <span className="flex items-center justify-center gap-2">
                  Start Uploading Now{" "}
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CTASection;
