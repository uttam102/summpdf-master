import React from "react";
import BgGradient from "@/components/common/BgGradient";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import SummaryList from "@/components/summaries/SummaryList";

export default function Dashboard() {
    const uploadLimit = 50;

    return (
        <main className="min-h-screen">
            <BgGradient className="from-emerald-200 via-teal-200 to-cyan-200" />
            <div className="container mx-auto flex flex-col gap-4">
                <div className="px-2 py-12 sm:py-24">
                    <div className="flex gap-4 mb-8 justify-between items-center">
                        <div className="flex flex-col gap-2">
                            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-600 to-gray-900 bg-clip-text text-transparent">
                                Your Summaries
                            </h1>
                            <p className="text-gray-600">
                                Transform your PDFs into concise, actionable insights.
                            </p>
                        </div>
                        <Button
                            className="bg-gradient-to-r from-rose-500 to-rose-700 hover:from-rose-600 hover:to-rose-800 hover:scale-105 transition-all duration-300 shadow-lg shadow-rose-200"
                            asChild
                        >
                            <Link to="/upload" className="flex items-center text-white no-underline">
                                <Plus className="w-5 h-5 mr-2" />
                                New summary
                            </Link>
                        </Button>
                    </div>

                    <SummaryList uploadLimit={uploadLimit} />
                </div>
            </div>
        </main>
    );
}
