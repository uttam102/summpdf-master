import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, ChevronLeft, ChevronRight, Clock, BookOpen, Plus, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';

// Custom hook to generate calendar days
const useCalendarDays = (currentMonth) => {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  return eachDayOfInterval({ start: startDate, end: endDate });
};

// Study Session Indicator
const StudySessionDot = ({ type = 'scheduled', count = 1 }) => {
  const getColor = () => {
    switch (type) {
      case 'completed': return 'bg-green-500';
      case 'overdue': return 'bg-red-500';
      default: return 'bg-blue-500';
    }
  };

  if (count === 0) return null;

  return (
    <div className="flex items-center justify-center mt-1">
      <span className={cn('w-2 h-2 rounded-full', getColor())} />
      {count > 1 && (
        <span className="ml-1 text-xs font-medium text-slate-600">+{count - 1}</span>
      )}
    </div>
  );
};

// Calendar Day Cell
const CalendarDay = ({ day, currentMonth, studySessions = {}, onDayClick, selectedDay }) => {
  const isCurrentMonth = isSameMonth(day, currentMonth);
  const isSelected = selectedDay && isSameDay(day, selectedDay);
  const isCurrentDay = isToday(day);
  const dateKey = format(day, 'yyyy-MM-dd');
  const session = studySessions[dateKey];

  return (
    <button
      onClick={() => onDayClick(day)}
      className={cn(
        'p-2 text-left rounded-lg transition-all hover:bg-slate-100',
        !isCurrentMonth && 'text-slate-400',
        isCurrentDay && 'bg-blue-100 text-blue-900 font-semibold',
        isSelected && 'bg-blue-500 text-white hover:bg-blue-600'
      )}
      style={{
        aspectRatio: '1',
      }}
    >
      <div className="flex flex-col h-full">
        <span className={cn(
          'text-sm',
          isCurrentDay && 'text-blue-900',
          isSelected && 'text-white'
        )}>
          {format(day, 'd')}
        </span>
        <StudySessionDot
          type={session?.type}
          count={session?.count}
        />
      </div>
    </button>
  );
};

// Calendar Header
const CalendarHeader = ({ currentMonth, onPrevMonth, onNextMonth, onToday }) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onPrevMonth}
          className="p-2 hover:bg-slate-100"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <button
          onClick={onToday}
          className="px-3 py-1.5 text-sm font-medium text-slate-700 hover:text-gray-900 hover:bg-slate-100 rounded-lg transition-colors"
        >
          Today
        </button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onNextMonth}
          className="p-2 hover:bg-slate-100"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <h2 className="text-lg font-bold text-gray-900">
        {format(currentMonth, 'MMMM yyyy')}
      </h2>
    </div>
  );
};

// Study Session Editor
const StudySessionEditor = ({ selectedDate, studySessions, onSaveSession, summaries = [] }) => {
  const [selectedSummary, setSelectedSummary] = useState('');
  const [sessionTime, setSessionTime] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!selectedSummary || !sessionTime) {
      alert('Please select a summary and time');
      return;
    }

    setSaving(true);
    try {
      await onSaveSession({
        date: format(selectedDate, 'yyyy-MM-dd'),
        summaryId: selectedSummary,
        time: sessionTime,
        note,
      });

      // Reset form
      setSelectedSummary('');
      setSessionTime('');
      setNote('');

      // Show success
      alert('Study session scheduled!');
    } catch (error) {
      alert('Failed to schedule study session');
    } finally {
      setSaving(false);
    }
  };

  const dateKey = format(selectedDate, 'yyyy-MM-dd');
  const existingSessions = studySessions[dateKey]?.sessions || [];

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Plus className="w-5 h-5 text-blue-600" />
          Schedule Study Session
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Selected Date
          </label>
          <div className="px-3 py-2 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-sm font-medium" style={{ color: '#3B82F6' }}>
              {format(selectedDate, 'MMMM d, yyyy')}
            </span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Summary to Study
          </label>
          <select
            value={selectedSummary}
            onChange={(e) => setSelectedSummary(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a summary...</option>
            {summaries.map((summary) => (
              <option key={summary.id} value={summary.id}>
                {summary.title || summary.file_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Study Time
          </label>
          <input
            type="time"
            value={sessionTime}
            onChange={(e) => setSessionTime(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Note (Optional)
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g., Focus on chapter 3 concepts"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Existing Sessions */}
        {existingSessions.length > 0 && (
          <div className="pt-4 border-t border-slate-200">
            <h4 className="text-sm font-semibold text-slate-700 mb-2">
              Existing Sessions
            </h4>
            <div className="space-y-2">
              {existingSessions.map((session, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {session.summaryTitle || 'Study Session'}
                      </p>
                      <p className="text-xs text-slate-600">⏰ {session.time}</p>
                    </div>
                  </div>
                  {session.completed && (
                    <span className="text-green-600 font-bold text-xs">✓</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <Button
          onClick={handleSave}
          disabled={saving || !selectedSummary || !sessionTime}
          className="w-full bg-gradient-to-r from-blue-500 to-green-500 text-white hover:from-blue-600 hover:to-green-600"
        >
          {saving ? 'Scheduling...' : 'Schedule Study Session'}
        </Button>
      </CardContent>
    </Card>
  );
};

// Main Study Calendar Component
export const StudyCalendar = ({
  currentMonth = new Date(),
  studySessions = {},
  onSaveSession,
  summaries = [],
}) => {
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedDay, setSelectedDay] = useState(null);
  const [view, setView] = useState('month');

  const calendarDays = useCalendarDays(selectedMonth);

  const handlePrevMonth = () => {
    setSelectedMonth(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setSelectedMonth(prev => addMonths(prev, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setSelectedMonth(today);
    setSelectedDay(today);
  };

  const handleDayClick = (day) => {
    setSelectedDay(day);
  };

  const saveSession = async (sessionData) => {
    try {
      await onSaveSession?.(sessionData);

      // Update local sessions state
      const dateKey = sessionData.date;
      // Update calendar
    } catch (error) {
      console.error('Failed to save session:', error);
      throw error;
    }
  };

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pt-4">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <CalendarDays className="w-6 h-6 text-blue-600" />
          Study Calendar
        </h2>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setView('week')}
            className={cn(view === 'week' && 'bg-blue-100 text-blue-900')}
          >
            Week
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setView('month')}
            className={cn(view === 'month' && 'bg-blue-100 text-blue-900')}
          >
            Month
          </Button>
        </div>
      </div>

      {/* Main Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>
                <CalendarHeader
                  currentMonth={selectedMonth}
                  onPrevMonth={handlePrevMonth}
                  onNextMonth={handleNextMonth}
                  onToday={handleToday}
                />
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-7 gap-1">
                {weekDays.map((day) => (
                  <div
                    key={day}
                    className="text-center py-2"
                  >
                    <span className="text-xs font-bold text-slate-500 uppercase">
                      {day}
                    </span>
                  </div>
                ))}

                {calendarDays.map((day) => (
                  <CalendarDay
                    key={day.toString()}
                    day={day}
                    currentMonth={selectedMonth}
                    studySessions={studySessions}
                    onDayClick={handleDayClick}
                    selectedDay={selectedDay}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Session Editor */}
        {selectedDay && (
          <div>
            <StudySessionEditor
              selectedDate={selectedDay}
              studySessions={studySessions}
              onSaveSession={saveSession}
              summaries={summaries}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyCalendar;
