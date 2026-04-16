import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Trophy, Target, TrendingUp, BookOpen, Clock, Flame, Award, CheckCircle, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

// Circular Progress SVG Component
const CircularProgress = ({ percentage, size = 120, strokeWidth = 8, color = '#3B82F6' }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-gray-900">{percentage}%</span>
        <span className="text-xs text-slate-500">Complete</span>
      </div>
    </div>
  );
};

// Linear Progress Bar
const LinearProgress = ({ value, color = 'bg-blue-500', height = 'h-3' }) => {
  return (
    <div className="w-full bg-slate-200 rounded-full overflow-hidden">
      <div
        className={cn('rounded-full transition-all duration-700 ease-out', color, height)}
        style={{ width: `${value}%` }}
      />
    </div>
  );
};

// Study Streak Component
const StudyStreak = ({ days }) => {
  const getFlameColor = () => {
    if (days >= 30) return 'text-orange-500';
    if (days >= 14) return 'text-yellow-500';
    if (days >= 7) return 'text-blue-500';
    return 'text-slate-400';
  };

  return (
    <div className="text-center">
      <Flame className={cn('w-12 h-12 mx-auto mb-2', getFlameColor())} />
      <div className="flex items-baseline justify-center gap-1">
        <span className="text-3xl font-bold text-gray-900">{days}</span>
        <span className="text-sm text-slate-600">days</span>
      </div>
      <p className="text-xs text-slate-500 mt-1">Study Streak</p>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon: Icon, value, label, color, trend = null }) => {
  const getColorClasses = () => {
    switch (color) {
      case 'blue':
        return 'bg-blue-100 text-blue-600';
      case 'green':
        return 'bg-green-100 text-green-600';
      case 'purple':
        return 'bg-purple-100 text-purple-600';
      case 'yellow':
        return 'bg-yellow-100 text-yellow-600';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-slate-600">{label}</p>
          </div>
          <div className={cn('p-2 rounded-lg', getColorClasses())}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
        {trend && (
          <div className="flex items-center gap-1 mt-2 text-xs">
            <TrendingUp className="w-3 h-3 text-green-500" />
            <span className="text-green-600">{trend}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Visual Study Stats Overview
export const StudyStatsOverview = ({ stats }) => {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Trophy className="w-6 h-6 text-yellow-500" />
        Study Progress
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={BookOpen}
          value={stats.totalSummaries || 0}
          label="Total Summaries"
          color="blue"
        />
        <StatCard
          icon={CheckCircle}
          value={stats.completedSummaries || 0}
          label="Completed"
          color="green"
          trend="+12% this week"
        />
        <StatCard
          icon={Target}
          value={stats.reviewingSummaries || 0}
          label="In Review"
          color="purple"
        />
        <StatCard
          icon={Clock}
          value={stats.totalReviews || 0}
          label="Total Reviews"
          color="yellow"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Overall Progress Circle */}
        <Card className="text-center hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Overall Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <CircularProgress
                percentage={Math.round(stats.avgProgress || 0)}
                color="#3B82F6"
              />
            </div>
            <p className="text-sm text-slate-600">
              {Math.round(stats.avgProgress || 0)}% of material mastered
            </p>
          </CardContent>
        </Card>

        {/* Study Streak */}
        <Card className="text-center hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Study Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <StudyStreak days={stats.currentStreak || 0} />
          </CardContent>
        </Card>

        {/* Achievement Milestone */}
        <Card className="text-center hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Next Milestone</CardTitle>
          </CardHeader>
          <CardContent>
            <Award className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900 mb-1">
              {stats.completedSummaries >= 10 ? '🏆 Expert' : stats.completedSummaries >= 5 ? '🥇 Pro' : '🥉 Beginner'}
            </p>
            <p className="text-xs text-slate-600">
              {stats.completedSummaries >= 10
                ? 'Keep it up!'
                : stats.completedSummaries >= 5
                  ? `${10 - stats.completedSummaries} more to reach Expert`
                  : `${5 - stats.completedSummaries} more to reach Pro`}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Progress Tracker for Individual Summary
export const SummaryProgressTracker = ({ summary }) => {
  const [progress, setProgress] = useState(summary.progressPercent || 0);

  const handleProgressChange = (newProgress) => {
    setProgress(newProgress);
    // Update in backend
    // updateStudyStatus(summary.id, summary.studyStatus, newProgress);
  };

  const getStatusIcon = () => {
    switch (summary.studyStatus) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'in_progress':
        return <Circle className="w-5 h-5 text-yellow-500" />;
      case 'reviewing':
        return <BookOpen className="w-5 h-5 text-blue-600" />;
      default:
        return <Circle className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            {getStatusIcon()}
            Study Progress
          </CardTitle>
          <span className={cn(
            'px-2 py-1 text-xs font-medium rounded-full',
            summary.studyStatus === 'completed' && 'bg-green-100 text-green-800',
            summary.studyStatus === 'in_progress' && 'bg-yellow-100 text-yellow-800',
            summary.studyStatus === 'reviewing' && 'bg-blue-100 text-blue-800',
            !summary.studyStatus && 'bg-slate-100 text-slate-600'
          )}>
            {summary.studyStatus?.replace('_', ' ') || 'Not Started'}
          </span>
        </div>
      </CardHeader>

      <CardContent>
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">Material Completion</span>
            <span className="text-sm font-bold text-gray-900">{progress}%</span>
          </div>
          <LinearProgress value={progress} color="bg-gradient-to-r from-blue-500 to-green-500" />
        </div>

        {/* Study Actions */}
        <div className="flex gap-2">
          <select
            value={progress}
            onChange={(e) => handleProgressChange(Number(e.target.value))}
            className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="0">Not Started</option>
            <option value="25">Just Started (25%)</option>
            <option value="50">Halfway (50%)</option>
            <option value="75">Almost Done (75%)</option>
            <option value="100">Completed (100%)</option>
          </select>

          <Button
            className="bg-gradient-to-r from-blue-500 to-green-500 text-white hover:from-blue-600 hover:to-green-600"
            onClick={() => {
              if (progress >= 100) {
                toast.success('🎉 Summary completed!');
              } else {
                toast.info('Keep going! Your progress is saved.');
              }
            }}
          >
            Update
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Dashboard Progress Grid
export const DashboardProgressGrid = ({ folders = [] }) => {
  const subjectIcons = {
    'Biology': '🧬',
    'Mathematics': '🧮',
    'Chemistry': '🧪',
    'Physics': '⚡',
    'Computer Science': '💻',
    'History': '🏛️',
    'Literature': '📚',
    'Languages': '🌐',
  };

  return (
    <div className="mt-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Subject Progress</h3>

      {folders.length === 0 ? (
        <Card className="text-center p-8">
          <Target className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="text-lg font-medium text-slate-600 mb-2">No Subject Progress Yet</h4>
          <p className="text-slate-500">Create folders and organize your summaries to track progress by subject.</p>
          <Button className="mt-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white">
            Create Your First Folder
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {folders.map((folder) => {
            const subjectIcon = subjectIcons[folder.subject] || '📁';
            const progress = folder.avgProgress || 0;
            const summaryCount = folder.summaryCount || 0;

            return (
              <Card key={folder.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{subjectIcon}</span>
                      <div>
                        <h4 className="font-semibold text-gray-900">{folder.subject}</h4>
                        <p className="text-sm text-slate-600">{folder.name}</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded-full">
                      {summaryCount} {summaryCount === 1 ? 'summary' : 'summaries'}
                    </span>
                  </div>

                  <div className="mb-2">
                    <LinearProgress value={progress} color="bg-gradient-to-r from-blue-500 to-purple-500" />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">Progress</span>
                    <span className="text-sm font-bold text-gray-900">{progress}%</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default {
  StudyStatsOverview,
  SummaryProgressTracker,
  DashboardProgressGrid,
  CircularProgress,
  LinearProgress,
};
