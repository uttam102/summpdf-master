import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BgGradient from "@/components/common/BgGradient";
import SummaryHeader from "@/components/summaries/SummaryHeader";
import SourceInfo from "@/components/summaries/SourceInfo";
import { FileText, MessageSquare, Loader2, BookOpen, Target, Calendar } from "lucide-react";
import SummaryViewer from "@/components/summaries/SummaryViewer";
import ChatWithPDF from "@/components/summaries/ChatWithPDF";
import { toast } from "sonner";
import { QAGenerator, QADisplay } from "@/components/study/QAGenerator";
import { SummaryProgressTracker } from "@/components/study/ProgressTracker";

export default function SummaryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);

  const [qaPairs, setQAPairs] = useState([]);
  const GO_BACKEND_URL = "http://localhost:8081";

  useEffect(() => {
    async function fetchSummary() {
      if (!id) {
        setError("Invalid summary ID");
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(`${GO_BACKEND_URL}/api/summaries/item/${id}`);
        if (response.ok) {
          const data = await response.json();
          if (!data || !data.id) {
            throw new Error("Invalid summary data received from server");
          }
          setSummary(data);
          setQAPairs(data.qa_pairs || []);
          setError(null);
        } else {
          const errorText = await response.text();
          console.error("API Error:", errorText);
          setError(`Summary not found (Error: ${response.status})`);
          toast.error("Summary not found");
        }
      } catch (error) {
        console.error("Fetch summary detail error:", error);
        setError("Failed to load summary. Please check if the Go backend is running.");
        toast.error("Go Backend is unreachable");
      } finally {
        setLoading(false);
      }
    }
    fetchSummary();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-rose-50/20">
        <Loader2 className="w-10 h-10 animate-spin text-rose-500 mb-4" />
        <p className="text-slate-500 font-medium animate-pulse">Loading your deep summary...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-rose-50/20">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md text-center">
          <div className="bg-red-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Error Loading Summary</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!summary) return null;

  const readingTime = Math.ceil((summary.word_count || 0) / 200) || 1;

  return (
    <div className="relative min-h-screen pb-20">
      <BgGradient className="from-rose-400 via-rose-300 to-orange-200" />

      <div className="container mx-auto px-4 pt-24 max-w-5xl flex flex-col gap-8">
        <div className="bg-white/40 backdrop-blur-md rounded-3xl p-6 border border-white/50">
          <SummaryHeader
            title={summary.title}
            createdAt={summary.created_at}
            readingTime={readingTime}
          />
        </div>

        {summary.file_name && (
          <div className="bg-white/60 backdrop-blur-md rounded-2xl p-4 border border-rose-100/50">
            <SourceInfo
              fileName={summary.file_name}
              originalFileUrl={summary.original_file_url}
              title={summary.title}
              summaryText={summary.summary_text}
              createdAt={summary.created_at}
            />
          </div>
        )}

        <div className="relative">
          <div className="relative p-8 lg:p-12 bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-rose-100/30 transition-all duration-500 hover:shadow-rose-200/50">
            {/* Word Count Badge */}
            <div className="absolute top-6 right-8 flex items-center gap-2 text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
              <FileText className="h-3.5 w-3.5 text-rose-400" />
              {(summary.word_count || 0).toLocaleString()} WORDS
            </div>

            <div className="prose prose-rose max-w-none">
              <SummaryViewer summary_text={summary.summary_text} />
            </div>

            {/* Study Features Section */}
            <div className="mt-8 space-y-6">
              <SummaryProgressTracker summary={summary} />
              <QAGenerator
                summaryId={summary.id}
                onQAGenerated={(newPairs) => setQAPairs(newPairs)}
              />
              <QADisplay qaPairs={qaPairs || []} />
            </div>
            {/* AI Chat Interaction Section */}
            <div className="mt-16 pt-12 border-t border-rose-100/50 flex flex-col items-center text-center">
              <div className="bg-rose-50 p-4 rounded-3xl mb-6 shadow-inner">
                <MessageSquare className="w-10 h-10 text-rose-500" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Deep Dive with AI Chat</h3>
              <p className="text-slate-500 max-w-md mb-8 font-medium">
                Still have questions? Our Go-powered analyzer can answer specific
                detail-oriented queries about this document in real-time.
              </p>
              <ChatWithPDF
                pdfUrl={summary.original_file_url || ""}
                fileName={summary.file_name || "Document"}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
