import { Clock, Trash2, ChevronRight } from 'lucide-react';
import type { HistoryEntry } from '../types';

interface HistorySidebarProps {
  history: HistoryEntry[];
  onSelect: (entry: HistoryEntry) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  activeId?: string;
}

export function HistorySidebar({
  history,
  onSelect,
  onRemove,
  onClear,
  activeId,
}: HistorySidebarProps) {
  if (history.length === 0) {
    return (
      <div className="card h-full flex flex-col items-center justify-center text-center py-12">
        <Clock className="w-8 h-8 text-white/20 mb-3" />
        <p className="text-sm text-white/30">No history yet</p>
        <p className="text-xs text-white/20 mt-1">Generated architectures appear here</p>
      </div>
    );
  }

  return (
    <div className="card h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-accent-purple" />
          <span className="text-sm font-medium text-white/80">History</span>
          <span className="badge bg-white/10 text-white/50 text-xs">{history.length}</span>
        </div>
        <button
          onClick={onClear}
          className="text-xs text-white/30 hover:text-red-400 transition-colors duration-150"
        >
          Clear all
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin space-y-2 pr-1">
        {history.map((entry) => (
          <div
            key={entry.id}
            className={`group relative rounded-xl p-3 cursor-pointer transition-all duration-150
              ${
                activeId === entry.id
                  ? 'bg-accent-purple/20 border border-accent-purple/40'
                  : 'bg-white/5 border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/20'
              }`}
            onClick={() => onSelect(entry)}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">{entry.title}</p>
                <p className="text-xs text-white/40 mt-0.5">
                  {entry.projectType} · {entry.scale}
                </p>
                <p className="text-xs text-white/25 mt-1">
                  {new Date(entry.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(entry.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-500/20
                             text-white/30 hover:text-red-400 transition-all duration-150"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
                <ChevronRight className="w-3 h-3 text-white/20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
