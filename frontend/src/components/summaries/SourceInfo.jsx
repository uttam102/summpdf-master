import React from 'react';
import { Button } from '../ui/button';
import { ExternalLink, FileText } from 'lucide-react';
import DownloadSummaryButton from './DownloadSummaryButton';

function SourceInfo({
  fileName,
  originalFileUrl,
  title,
  summaryText,
  createdAt,
}) {
  // Handle null/undefined values
  const safeFileName = fileName || "unknown.pdf";
  const safeOriginalFileUrl = originalFileUrl || "#";
  const safeTitle = title || "Untitled Document";
  const safeSummaryText = summaryText || "No summary available";
  const safeCreatedAt = createdAt || new Date().toISOString();

  return (
    <div className="flex flex-col lg:flex-row items-center justify-between gap-4 text-sm text-muted-foreground font-medium">
      <div className="flex items-center justify-center gap-2">
        <FileText className="w-4 h-4 text-rose-400" />
        <span>Source: {safeFileName}</span>
      </div>
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-3 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-full"
          asChild
        >
          <a href={safeOriginalFileUrl} target="_blank" rel="noopener noreferrer" className="no-underline flex items-center">
            <ExternalLink className="h-4 w-4 mr-1" />
            View original
          </a>
        </Button>
        <DownloadSummaryButton
          title={safeTitle}
          summaryText={safeSummaryText}
          fileName={safeFileName}
          createdAt={safeCreatedAt}
        />
      </div>
    </div>
  );
}

export default SourceInfo;
