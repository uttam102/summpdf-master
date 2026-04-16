import { Link } from "react-router-dom";
import React from "react";
import { Button } from "../ui/button";
import { Calendar, ChevronLeft, Clock, Sparkles } from "lucide-react";
import { Badge } from "../ui/badge";

function SummaryHeader({
  title,
  createdAt,
  readingTime,
}) {
  // Handle null/undefined values gracefully
  const safeTitle = title || "Untitled Document";
  const safeCreatedAt = createdAt ? new Date(createdAt) : new Date();
  const displayDate = safeCreatedAt.toLocaleDateString("en-us", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex gap-4 mb-6 justify-between items-start">
      <div className="space-y-4 flex-1">
        <div className="flex flex-wrap items-center gap-4">
          <Badge
            variant="secondary"
            className="relative px-4 py-1.5 text-sm font-medium bg-white/80 backdrop-blur-xs rounded-full hover:bg-white/90 transition-all shadow-xs hover:shadow-md border-0"
          >
            <Sparkles className="h-4 w-4 mr-1.5 text-rose-500" />
            AI Summary
          </Badge>
          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
            <Calendar className="h-4 w-4 text-rose-500" />
            {displayDate}
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
            <Clock className="h-4 w-4 text-rose-500" />
            {readingTime} min read
          </div>
        </div>
        <h1 className="text-2xl lg:text-4xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-rose-600 to-orange-600 bg-clip-text text-transparent">
            {safeTitle}
          </span>
        </h1>
      </div>
      <div>
        <Link to="/dashboard" className="no-underline">
          <Button
            variant="ghost"
            size="sm"
            className="group flex items-center gap-1 sm:gap-2 hover:bg-white/80 backdrop-blur-xs rounded-full transition-all duration-200 shadow-sm border border-rose-100/30 bg-rose-50/50 px-3 py-5"
          >
            <ChevronLeft className="h-4 w-4 text-rose-500 transition-transform group-hover:-translate-x-0.5 font-bold" />
            <span className="text-xs sm:text-sm text-slate-600 font-bold">
              Back <span className="hidden sm:inline">to Dashboard</span>
            </span>
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default SummaryHeader;
