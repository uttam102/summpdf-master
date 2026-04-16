import React from "react";

function SummaryViewer({ summary_text }) {
  // Handle null, undefined, or non-string values gracefully
  if (!summary_text) {
    return (
      <div className="text-red-600 bg-red-50 p-4 rounded-lg border border-red-200">
        <p className="font-medium">⚠️ Error: Summary content not found</p>
        <p className="text-sm mt-2">The summary data may be corrupted or missing. Please try generating the summary again.</p>
      </div>
    );
  }

  // Ensure summary_text is a string
  const textContent = typeof summary_text === 'string'
    ? summary_text
    : JSON.stringify(summary_text, null, 2);

  return (
    <div className="leading-8 whitespace-pre-wrap text-slate-700 text-lg font-medium tracking-tight text-justify">
      {textContent}
    </div>
  );
}

export default SummaryViewer;
