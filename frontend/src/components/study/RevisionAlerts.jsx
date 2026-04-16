import React, { useState, useEffect, useRef } from 'react';
import { Bell, Clock, Calendar, BookOpen, ChevronRight, X, Zap, Flame, Award, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { getReviewQueue, markAsReviewed } from '@/lib/study';
import { toast } from 'sonner';

// Individual Revision Item
const RevisionItem = ({ summary, onReviewed }) => {
  const [reviewing, setReviewing] = useState(false);

  const calculateDaysOverdue = (reviewDate) => {
    if (!reviewDate) return 0;
    const today = new Date();
    const dueDate = new Date(reviewDate);
    const daysDiff = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
    return Math.max(0, daysDiff);
  };

  const getUrgencyColor = (dueDate) => {
    const daysOverdue = calculateDaysOverdue(dueDate);
    if (daysOverdue > 2) return 'border-red-400 bg-red-50 hover:bg-red-100';
    if (daysOverdue > 0) return 'border-orange-400 bg-orange-50 hover:bg-orange-100';
    return 'border-blue-400 bg-blue-50 hover:bg-blue-100';
  };

  const getTimeRemaining = (dueDate) => {
    const daysOverdue = calculateDaysOverdue(dueDate);
    if (daysOverdue > 2) return `${daysOverdue} days overdue!`;
    if (daysOverdue > 0) return `${daysOverdue} days overdue`;
    return 'Due today';
  };

  const handleReview = async () => {
    setReviewing(true);
    try {
      // Default understanding = 3 (understood reasonably well)
      const understanding = 3;
      await markAsReviewed(summary.id, understanding);

      toast.success(`Reviewed: ${summary.title || 'Summary'}`);
      onReviewed?.(summary.id);
    } catch (error) {
      toast.error('Failed to mark as reviewed');
      console.error('Review error:', error);
    } finally {
      setReviewing(false);
    }
  };

  return (
    <div
      className={cn(
        "p-4 mb-3 rounded-xl border-2 transition-all cursor-pointer hover:shadow-md",
        getUrgencyColor(summary.next_review_date)
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <BookOpen className="w-6 h-6 text-current" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <h4 className="text-sm font-semibold text-gray-900 truncate flex-1">
              {summary.title || 'Untitled Summary'}
            </h4>
            <span className="flex-shrink-0 ml-2">
              {/* Urgency indicator */}
              {calculateDaysOverdue(summary.next_review_date) > 2 ? (
                <Flame className="w-4 h-4 text-red-500" />
              ) : calculateDaysOverdue(summary.next_review_date) > 0 ? (
                <AlertCircle className="w-4 h-4 text-orange-500" />
              ) : (
                <Clock className="w-4 h-4 text-blue-500" />
              )}
            </span>
          </div>

          <p className="text-xs text-slate-600 mb-3">
            {summary.subject || 'Uncategorized'} • {summary.word_count || 0} words
          </p>

          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">
              📅 {getTimeRemaining(summary.next_review_date)}
            </span>

            <Button
              size="sm"
              onClick={handleReview}
              disabled={reviewing}
              className="bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600 text-xs px-3 py-1 h-7"
            >
              {reviewing ? (
                <>
                  <span className="animate-pulse">Reviewing...</span>
                </>
              ) : (
                'Mark as Reviewed ✓'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Empty State for Review Queue
const EmptyReviewState = () => {
  return (
    <div className="text-center py-8 px-4">
      <Award className="w-16 h-16 text-green-500 mx-auto mb-3" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        All Caught Up! 🎉
      </h3>
      <p className="text-slate-600 mb-4 max-w-xs mx-auto">
        You've reviewed all your summaries. Come back tomorrow for more!
      </p>
      <Button
        className="bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600"
        onClick={() => window.location.href = '/study'}
      >
        Start New Study Session
      </Button>
    </div>
  );
};

// Bell Icon with Badge
export const RevisionAlertsBell = ({ userId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [reviewQueue, setReviewQueue] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasNew, setHasNew] = useState(false);
  const dropdownRef = useRef(null);
  const bellRef = useRef(null);

  // Load review queue
  useEffect(() => {
    if (!userId) return;

    loadReviewQueue();

    // Check every 30 minutes
    const interval = setInterval(loadReviewQueue, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, [userId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        bellRef.current &&
        !bellRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadReviewQueue = async () => {
    setLoading(true);
    try {
      const data = await getReviewQueue(userId);
      const queue = data.summaries || [];
      setReviewQueue(queue);
      setHasNew(queue.length > 0 && !isOpen);
    } catch (error) {
      console.error('Failed to load review queue:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBellClick = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setHasNew(false); // Mark as viewed when opening
    }
  };

  const handleReviewed = (summaryId) => {
    setReviewQueue(prev => prev.filter(item => item.id !== summaryId));
    loadReviewQueue();
  };

  const urgentCount = reviewQueue.filter(item => {
    const today = new Date();
    const daysDiff = Math.floor((today - new Date(item.next_review_date)) / (1000 * 60 * 60 * 24));
    return daysDiff > 2;
  }).length;

  return (
    <div className="relative" ref={bellRef}>
      <button
        onClick={handleBellClick}
        className="relative p-2 rounded-full hover:bg-slate-100 transition-colors"
      >
        <Bell
          className={cn(
            'w-6 h-6 transition-colors',
            urgentCount > 0 ? 'text-red-500 animate-wiggle' : 'text-slate-600',
            hasNew && 'text-blue-600'
          )}
        />

        {/* Badge */}
        {reviewQueue.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-lg animate-pulse">
            {reviewQueue.length}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-0 mt-2 w-96 max-h-[600px] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50"
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                Review Queue
              </h3>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-slate-600">
                  {reviewQueue.length} due
                </span>
                {urgentCount > 0 && (
                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-full">
                    {urgentCount} urgent
                  </span>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-full hover:bg-slate-200 transition-colors"
                >
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="max-h-[500px] overflow-y-auto p-4">
            {loading ? (
              <div className="py-8 text-center">
                <div className="animate-pulse text-slate-500">Loading...</div>
              </div>
            ) : reviewQueue.length === 0 ? (
              <EmptyReviewState />
            ) : (
              <div>
                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-sm font-medium text-blue-900 mb-1">⏰ Time to Review!</p>
                  <p className="text-xs text-blue-700">
                    Review these summaries to strengthen your memory using spaced repetition.
                  </p>
                </div>

                {reviewQueue.map((summary) => (
                  <RevisionItem
                    key={summary.id}
                    summary={summary}
                    onReviewed={handleReviewed}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-slate-100 bg-slate-50">
            <Button
              className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600"
              onClick={() => window.location.href = '/study'}
            >
              Open Study Hub
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// Mobile-First Alert Banner
export const RevisionAlertBanner = ({ userId }) => {
  const [reviewCount, setReviewCount] = useState(0);

  useEffect(() => {
    if (!userId) return;

    const loadAlerts = async () => {
      try {
        const data = await getReviewQueue(userId);
        setReviewCount(data.count || 0);
      } catch (error) {
        console.error('Failed to load alerts:', error);
      }
    };

    loadAlerts();
    const interval = setInterval(loadAlerts, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [userId]);

  if (reviewCount === 0) return null;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-500 p-4 mb-6 rounded-r-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="w-5 h-5 text-blue-600" />
          <div>
            <p className="font-semibold text-blue-900">
              {reviewCount} {reviewCount === 1 ? 'summary' : 'summaries'} ready for review
            </p>
            <p className="text-sm text-blue-700">
              Strengthen your memory with spaced repetition
            </p>
          </div>
        </div>
        <Button
          size="sm"
          className="bg-blue-600 text-white hover:bg-blue-700"
          onClick={() => window.location.href = '/study'}
        >
          Review Now
        </Button>
      </div>
    </div>
  );
};

// Notification Toast for Upcoming Reviews
export const showReviewReminder = (summary) => {
  toast.custom((t) => (
    <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-4 max-w-sm">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-blue-100 rounded-full">
          <Clock className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 mb-1">
            Time to Review {summary.title || 'Summary'}
          </h4>
          <p className="text-sm text-slate-600 mb-3">
            It's been a while since you reviewed this. Spaced repetition helps you remember better!
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              className="bg-blue-600 text-white hover:bg-blue-700 flex-1"
              onClick={async () => {
                toast.dismiss(t.id);
                // Navigate to summary
                window.location.href = `/summaries/${summary.id}`;
              }}
            >
              Review Now
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => toast.dismiss(t.id)}
            >
              Later
            </Button>
          </div>
        </div>
      </div>
    </div>
  ), {
    duration: 8000,
    position: 'top-right',
  });
};

export default {
  RevisionAlertsBell,
  RevisionAlertBanner,
  showReviewReminder,
  EmptyReviewState,
};
