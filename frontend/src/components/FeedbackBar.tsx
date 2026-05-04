import { useState } from 'react';
import { Send, Sparkles } from 'lucide-react';

interface FeedbackBarProps {
  onRefine: (feedback: string) => void;
  loading: boolean;
  version: number;
  pastFeedbacks: string[];
}

const QUICK_SUGGESTIONS = [
  'Add more security measures',
  'Optimize for cost reduction',
  'Scale to handle more traffic',
  'Add a caching layer',
  'Include monitoring & observability',
  'Suggest a microservices split',
];

export function FeedbackBar({ onRefine, loading, version, pastFeedbacks }: FeedbackBarProps) {
  const [feedback, setFeedback] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim() || loading) return;
    onRefine(feedback.trim());
    setFeedback('');
  };

  const handleSuggestion = (s: string) => {
    if (loading) return;
    onRefine(s);
  };

  return (
    <div className="card animate-fade-in space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent-purple" />
          <span className="text-sm font-medium text-white/80">Refine Architecture</span>
        </div>
        <span className="badge priority-medium text-xs">v{version}</span>
      </div>

      {/* Quick Suggestions */}
      <div className="flex flex-wrap gap-2">
        {QUICK_SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => handleSuggestion(s)}
            disabled={loading}
            className="text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-accent-purple/20 hover:text-accent-purple
                       border border-white/10 hover:border-accent-purple/40 transition-all duration-150
                       text-white/60 disabled:opacity-40"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Past feedbacks preview */}
      {pastFeedbacks.length > 0 && (
        <div className="text-xs text-white/30 italic">
          {pastFeedbacks.length} refinement{pastFeedbacks.length > 1 ? 's' : ''} applied
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="text"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="e.g. Add WebSockets for real-time, switch DB to MongoDB..."
          className="input-field text-sm flex-1"
          disabled={loading}
          maxLength={500}
        />
        <button
          type="submit"
          disabled={!feedback.trim() || loading}
          className="btn-primary flex items-center gap-2 px-4 py-2.5 text-sm"
        >
          <Send className="w-4 h-4" />
          Refine
        </button>
      </form>
    </div>
  );
}
