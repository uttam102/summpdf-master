import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, Sparkles, Brain, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { generateQAPairs } from '@/lib/study';
import { toast } from 'sonner';

// Single Q&A Card Component
const QACard = ({ qa, index }) => {
  const [expanded, setExpanded] = useState(false);

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-800 border-green-200';
    if (confidence >= 0.5) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  return (
    <Card className="mb-4 border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
      <CardHeader className="pb-3 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Brain className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold text-slate-500">Q{index + 1}</span>
                <span className={cn(
                  "px-2 py-0.5 text-xs font-medium rounded-full border",
                  getConfidenceColor(qa.confidence || 0)
                )}>
                  {((qa.confidence || 0) * 100).toFixed(0)}%
                </span>
              </div>
              <p className="text-gray-900 font-medium">{qa.question}</p>
            </div>
          </div>
          <div className="flex-shrink-0">
            {expanded ? (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronRight className="w-5 h-5 text-slate-400" />
            )}
          </div>
        </div>
      </CardHeader>

      {expanded && qa.answer && (
        <CardContent className="border-t border-slate-100 pt-3">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <p className="text-sm text-slate-700 leading-relaxed">{qa.answer}</p>
          </div>
          <div className="flex gap-2 mt-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-green-600 hover:bg-green-50"
              onClick={() => toast.success('Marked as helpful!')}
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Helpful
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:bg-red-50"
              onClick={() => toast.error('Q&A marked as incorrect')}
            >
              <XCircle className="w-4 h-4 mr-1" />
              Incorrect
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

// Q&A Generator Button with Loading States
export const QAGenerator = ({ summaryId, onQAGenerated }) => {
  const [generating, setGenerating] = useState(false);
  const [count, setCount] = useState(5);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const result = await generateQAPairs(summaryId, count);

      if (result.qa_pairs && result.qa_pairs.length > 0) {
        toast.success(`Generated ${result.count} Q&A pairs!`);
        onQAGenerated?.(result.qa_pairs);
      } else {
        toast.warning('No Q&A pairs generated. Try again with different settings.');
      }
    } catch (error) {
      console.error('Q&A generation error:', error);
      toast.error(error.message || 'Failed to generate Q&A');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Q&A Generator</h3>
          <p className="text-sm text-slate-600">AI-powered questions for better retention</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-600">Questions:</label>
          <select
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={generating}
          >
            <option value={3}>3</option>
            <option value={5}>5</option>
            <option value={8}>8</option>
            <option value={10}>10</option>
          </select>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={generating}
          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 disabled:opacity-50"
        >
          {generating ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Q&A
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

// Full Q&A Display Component (to be used in SummaryDetail page)
export const QADisplay = ({ qaPairs = [] }) => {
  if (!qaPairs || qaPairs.length === 0) {
    return (
      <div className="text-center py-12">
        <Brain className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-600 mb-2">No Q&A Generated</h3>
        <p className="text-slate-500 max-w-md mx-auto">Generate AI-powered questions to test your understanding</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-2">
          <Brain className="w-6 h-6 text-blue-500" />
          Practice Questions
          <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            {qaPairs.length} questions
          </span>
        </h3>
        <p className="text-slate-600">Test your knowledge with these AI-generated questions</p>
      </div>

      {qaPairs.map((qa, index) => (
        <QACard key={index} qa={qa} index={index} />
      ))}
    </div>
  );
};

export default QADisplay;