
import React from "react";

export function SummaryCardSkeleton() {
    return (
        <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 animate-pulse">
            <div className="flex justify-between items-start mb-4">
                <div className="h-6 bg-gray-200 rounded-md w-3/4"></div>
                <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
            </div>
            <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
            <div className="mt-6 flex justify-between items-center pt-4 border-t border-gray-50">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>
        </div>
    );
}

export function SummaryListSkeleton() {
    return (
        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 sm:px-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <SummaryCardSkeleton key={i} />
            ))}
        </div>
    );
}
