import { FileText } from "lucide-react";
import React from "react";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";

function EmptySummaryPage() {
  return (
    <div className="text-center py-12">
      <div className="flex flex-col items-center gap-4">
        <div className="bg-rose-50 p-6 rounded-full border border-rose-100 shadow-inner">
          <FileText className="w-16 h-16 text-rose-500" />
        </div>
        <h2 className="text-xl font-black text-slate-900 tracking-tight">
          No summaries yet
        </h2>
        <p className="text-slate-500 max-w-md font-medium">
          Ready to unlock the secrets of your PDFs? Upload your first document to get started.
        </p>
        <Link to="/upload" className="no-underline">
          <Button
            className="mt-6 px-8 py-6 text-white bg-gradient-to-r from-rose-500 to-rose-700 hover:from-rose-600 hover:to-rose-800 rounded-2xl shadow-xl shadow-rose-200"
          >
            Create your first summary
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default EmptySummaryPage;
