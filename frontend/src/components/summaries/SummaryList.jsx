import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import SummaryCard from "./SummaryCard";
import EmptySummaryPage from "./EmptySummaryPage";
import { useUser } from "@clerk/clerk-react";
import { toast } from "sonner";
import { SummaryListSkeleton } from "./SummarySkeleton";

export default function SummaryList({ uploadLimit }) {
    const { user, isLoaded: userLoaded } = useUser();
    const [summaries, setSummaries] = useState([]);
    const [loading, setLoading] = useState(true);

    const GO_BACKEND_URL = "http://localhost:8081";

    useEffect(() => {
        async function fetchSummaries() {
            if (!userLoaded || !user) return;

            try {
                const response = await fetch(`${GO_BACKEND_URL}/api/summaries/${user.id}`);
                if (response.ok) {
                    const data = await response.json();
                    setSummaries(data || []);
                } else {
                    toast.error("Failed to load your summaries");
                }
            } catch (error) {
                console.error("Fetch summaries error:", error);
                toast.error("Go Backend is unreachable");
            } finally {
                setLoading(false);
            }
        }
        fetchSummaries();
    }, [user, userLoaded]);

    if (loading) return <SummaryListSkeleton />;

    return (
        <>
            {summaries.length >= uploadLimit && (
                <div className="mb-6">
                    <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 text-rose-800 shadow-sm">
                        <p className="flex items-center gap-2">
                            <span>You've reached the limit of {uploadLimit} uploads on the Basic plan.</span>
                            <Link
                                to="/#pricing"
                                className="text-rose-800 underline font-semibold underline-offset-4 flex items-center hover:opacity-80"
                            >
                                Upgrade to Pro
                                <ArrowRight className="w-4 h-4 ml-1" />
                            </Link>
                        </p>
                    </div>
                </div>
            )}
            {summaries.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 sm:px-4">
                    {summaries.map((summary) => (
                        <SummaryCard
                            summary={summary}
                            key={summary.id}
                            onDeleted={() => setSummaries(prev => prev.filter(s => s.id !== summary.id))}
                        />
                    ))}
                </div>
            ) : (
                <EmptySummaryPage />
            )}
        </>
    );
}
