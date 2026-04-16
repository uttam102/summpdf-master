import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import React from "react";

function HeroSection() {
  return (
    <section
      className="relative mx-auto flex flex-col z-0 items-center justify-center py-16 sm:py-20 lg:pb-28 transition-all animate-in lg:px-12 max-w-7xl"
    >
      <div className="">
        <div
          className="relative p-[1px] overflow-hidden rounded-full bg-gradient-to-r from-rose-200 via-rose-500 to-rose-800 animate-gradient-x group"
        >
          <Badge
            variant={"secondary"}
            className="relative px-6 py-2 text-base font-medium bg-white rounded-full group-hover:bg-gray-50 transition-colors duration-200 border-0"
          >
            <Sparkles className="h-6 w-6 mr-2 text-rose-600 animate-pulse" />
            <p className="text-base text-rose-600 m-0 font-bold">Powered by AI</p>
          </Badge>
        </div>
      </div>
      <h1 className="font-black py-8 text-center text-slate-900 tracking-tight leading-tight">
        Transform PDFs into{" "}
        <span className="relative inline-block">
          <span className="relative z-10 px-2 italic">concise</span>
          <span
            className="absolute inset-x-0 bottom-1 h-3 bg-rose-200/50 -rotate-2 rounded-lg transform -skew-y-1"
            aria-hidden="true"
          ></span>
        </span>{" "}
        summaries
      </h1>
      <p className="text-lg sm:text-xl lg:text-2xl text-center px-4 lg:px-0 lg:max-w-4xl text-slate-500 font-medium leading-relaxed">
        Get a beautiful summary reel of your document in seconds.
        Save hours of reading with our advanced AI analysis.
      </p>
      <div>
        <Link to="/#pricing" className="no-underline">
          <Button
            className="text-white mt-10 text-base sm:text-lg lg:text-xl rounded-2xl px-10 sm:px-12 lg:px-16 py-8 bg-gradient-to-r from-slate-900 to-rose-600 hover:from-rose-600 hover:to-slate-900 font-black shadow-2xl shadow-rose-200 transition-all duration-300 active:scale-95 group"
          >
            <span className="flex gap-2 items-center">
              Try SummPDF Free
              <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </span>
          </Button>
        </Link>
      </div>
    </section>
  );
}

export default HeroSection;
