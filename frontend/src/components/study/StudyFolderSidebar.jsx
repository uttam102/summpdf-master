import React, { useState } from 'react';
import { Folder, FolderOpen, Plus, FolderPlus, ChevronDown, ChevronRight, Folder as FolderIcon, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Subject colors for folders
const SUBJECT_COLORS = [
  { color: 'bg-blue-500', hex: '#3B82F6', name: 'Blue' },
  { color: 'bg-purple-500', hex: '#A855F7', name: 'Purple' },
  { color: 'bg-pink-500', hex: '#EC4899', name: 'Pink' },
  { color: 'bg-green-500', hex: '#10B981', name: 'Green' },
  { color: 'bg-yellow-500', hex: '#EAB308', name: 'Yellow' },
  { color: 'bg-red-500', hex: '#EF4444', name: 'Red' },
  { color: 'bg-indigo-500', hex: '#6366F1', name: 'Indigo' },
];

// Subject categories with icons
const SUBJECT_CATEGORIES = [
  { name: 'Mathematics', icon: '🧮', color: 'blue' },
  { name: 'Biology', icon: '🧬', color: 'green' },
  { name: 'Chemistry', icon: '🧪', color: 'purple' },
  { name: 'Physics', icon: '⚡', color: 'yellow' },
  { name: 'Computer Science', icon: '💻', color: 'indigo' },
  { name: 'History', icon: '🏛️', color: 'brown' },
  { name: 'Literature', icon: '📚', color: 'pink' },
  { name: 'Languages', icon: '🌐', color: 'green' },
];

// Folder Item Component
const FolderItem = ({ folder, isActive, onClick, summaryCount, depth = 0 }) => {
  const [expanded, setExpanded] = useState(true);

  const handleClick = (e) => {
    e.stopPropagation();
    onClick?.(folder);
  };

  const handleExpand = (e) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  // Get folder color class
  const folderColorClass = folder.color || 'bg-blue-500';

  return (
    <div className="mb-1">
      <div
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer group hover:bg-slate-100 transition-colors',
          isActive && 'bg-blue-50 border-l-4 border-blue-500',
          depth > 0 && 'ml-4'
        )}
        onClick={handleClick}
      >
        {depth > 0 && (
          <button
            onClick={handleExpand}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            {expanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        )}

        {/* Colored folder icon */}
        {isActive ? (
          <FolderOpen className={cn('w-5 h-5 text-blue-600')} />
        ) : (
          <FolderIcon className={cn('w-5 h-5', 'text-slate-500')} />
        )}

        {/* Folder name with colored dot indicator */}
        <span className="flex-1">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'w-2 h-2 rounded-full',
                folderColorClass
              )}
              style={folder.color ? { backgroundColor: folder.color } : {}}
            />
            <span className={cn(
              'text-sm font-medium',
              isActive ? 'text-blue-900' : 'text-slate-700'
            )}>
              {folder.name}
            </span>
          </div>
        </span>

        {/* Summary count badge */}
        {summaryCount > 0 && (
          <span className={cn(
            'px-2 py-0.5 text-xs font-medium rounded-full',
            isActive ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'
          )}>
            {summaryCount}
          </span>
        )}
      </div>

      {/* Optional: show nested items when expanded */}
      {expanded && depth === 0 && folder.children && folder.children.length > 0 && (
        <div className="mt-1">
          {folder.children.map((child) => (
            <FolderItem
              key={child.id}
              folder={child}
              isActive={false}
              onClick={onClick}
              summaryCount={0}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// New Folder Modal
const NewFolderModal = ({ isOpen, onClose, onCreate, subjects = [] }) => {
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [color, setColor] = useState(SUBJECT_COLORS[0].hex);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      await onCreate({
        name: name.trim(),
        subject: subject || undefined,
        color,
      });
      setName('');
      onClose();
    } catch (err) {
      console.error('Failed to create folder:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-auto shadow-2xl">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FolderPlus className="w-5 h-5 text-blue-600" />
          New Folder
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Folder Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Week 1, Chapter 2, Notes"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Subject (Optional)
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">No Subject</option>
              {SUBJECT_CATEGORIES.map((cat) => (
                <option key={cat.name} value={cat.name}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Folder Color
            </label>
            <div className="grid grid-cols-7 gap-2">
              {SUBJECT_COLORS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setColor(c.hex)}
                  className={cn(
                    'w-8 h-8 rounded-full border-2',
                    color === c.hex ? 'border-slate-700' : 'border-transparent',
                    c.color
                  )}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600"
              disabled={loading || !name.trim()}
            >
              {loading ? 'Creating...' : 'Create Folder'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main Folder Sidebar Component
export const StudyFolderSidebar = ({
  folders = [],
  onFolderSelect,
  activeFolderId = null,
  summaryCountsByFolder = {},
  onCreateFolder,
}) => {
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [groupedBySubject, setGroupedBySubject] = useState({});

  // Group folders by subject
  useEffect(() => {
    const grouped = folders.reduce((acc, folder) => {
      const subject = folder.subject || 'Uncategorized';
      if (!acc[subject]) {
        acc[subject] = [];
      }
      acc[subject].push(folder);
      return acc;
    }, {});
    setGroupedBySubject(grouped);
  }, [folders]);

  const handleCreateFolder = async (folderData) => {
    try {
      await onCreateFolder?.(folderData);
      // Refresh folders after creating
      setShowNewFolderModal(false);
    } catch (err) {
      throw err;
    }
  };

  return (
    <div className="h-full bg-white border-r border-slate-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            Subjects
          </h3>
        </div>

        <Button
          onClick={() => setShowNewFolderModal(true)}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 text-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Folder
        </Button>
      </div>

      {/* Folder list */}
      <div className="flex-1 overflow-y-auto p-3">
        {/* All Summaries */}
        <FolderItem
          folder={{
            id: 'all',
            name: 'All Summaries',
            color: '#6B7280',
          }}
          isActive={activeFolderId === 'all'}
          onClick={() => onFolderSelect?.('all')}
          summaryCount={folders.reduce((sum, f) => sum + (summaryCountsByFolder[f.id] || 0), 0)}
        />

        {/* Uncategorized */}
        {groupedBySubject['Uncategorized'] && (
          <div className="pt-4">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-3">
              Uncategorized
            </h4>
            <div className="space-y-1">
              {groupedBySubject['Uncategorized'].map((folder) => (
                <FolderItem
                  key={folder.id}
                  folder={folder}
                  isActive={activeFolderId === folder.id}
                  onClick={() => onFolderSelect?.(folder.id)}
                  summaryCount={summaryCountsByFolder[folder.id] || 0}
                />
              ))}
            </div>
          </div>
        )}

        {/* Group by subject */}
        {Object.entries(groupedBySubject).map(([subject, subjectFolders]) => {
          if (subject === 'Uncategorized') return null;

          return (
            <div key={subject} className="pt-4">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-3">
                {subject}
              </h4>
              <div className="space-y-1">
                {subjectFolders.map((folder) => (
                  <FolderItem
                    key={folder.id}
                    folder={folder}
                    isActive={activeFolderId === folder.id}
                    onClick={() => onFolderSelect?.(folder.id)}
                    summaryCount={summaryCountsByFolder[folder.id] || 0}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* New Folder Modal */}
      <NewFolderModal
        isOpen={showNewFolderModal}
        onClose={() => setShowNewFolderModal(false)}
        onCreate={handleCreateFolder}
      />
    </div>
  );
};

export default StudyFolderSidebar;