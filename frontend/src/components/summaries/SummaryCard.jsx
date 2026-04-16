import React from "react";
import { Card } from "../ui/card";
import DeleteButton from "./DeleteButton";
import { FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import ChatWithPDF from "./ChatWithPDF";

const CardHeader = ({
  fileUrl,
  title,
  createdAt,
}) => {
  return (
    <div className="flex items-start gap-2 sm:gap-4">
      <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-rose-400 mt-1" />
      <div className="flex-1 min-w-0">
        <h3 className="text-base xl:text-lg font-semibold text-gray-900 truncate w-4/5">
          {title || "PDF Summary"}
        </h3>
        <p className="text-sm text-gray-500">
          {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  return (
    <span
      className={cn(
        "px-3 py-1 text-xs rounded-full inline-block",
        status === "completed"
          ? "bg-green-100 text-green-800"
          : "bg-yellow-100 text-yellow-800"
      )}
    >
      {status}
    </span>
  );
};

function SummaryCard({ summary, onDeleted }) {
  return (
    <div>
      <Card className="relative h-full border-rose-100 shadow-sm overflow-hidden">
        <div className="absolute top-4 right-4 z-10">
          <DeleteButton summaryId={summary.id} onDeleted={onDeleted} />
        </div>
        <div className="p-4 sm:p-6">
          <div className="flex flex-col gap-3 sm:gap-4">
            <Link to={`/summaries/${summary.id}`} className="group p-0 no-underline">
              <CardHeader
                fileUrl={summary.original_file_url}
                title={summary.title}
                createdAt={summary.created_at}
              />
              <p className="text-gray-600 line-clamp-2 text-sm sm:text-base pl-2 group-hover:text-rose-600 transition-colors mt-2">
                {summary.summary_text}
              </p>
            </Link>

            <div className="flex flex-wrap gap-2 items-center mt-2 sm:mt-4">
              <StatusBadge status={summary.status} />
              <div className="ml-auto flex items-center gap-2">
                <ChatWithPDF
                  pdfUrl={summary.original_file_url}
                  fileName={summary.file_name}
                />
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default SummaryCard;
