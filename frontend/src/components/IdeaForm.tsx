import { useState } from 'react';
import { Wand2, ChevronDown } from 'lucide-react';
import type { GeneratePayload, ProjectType, Scale } from '../types';

const PROJECT_TYPES: ProjectType[] = [
  'SaaS Web App', 'Mobile App', 'API / Backend Service', 'E-commerce',
  'Data Pipeline', 'AI / ML System', 'Real-time App', 'Microservices', 'Monolith',
];

const SCALES: Scale[] = [
  'MVP / Prototype', 'Small (< 1K users)', 'Medium (1K–100K users)',
  'Large (100K–1M users)', 'Enterprise (1M+ users)',
];

const EXAMPLE_IDEAS = [
  'A social app for runners to share routes and compete with friends',
  'An AI-powered code review tool that integrates with GitHub PRs',
  'A multi-tenant SaaS for restaurant inventory management',
  'A real-time collaborative whiteboard for remote teams',
  'A data pipeline that ingests IoT sensor data and detects anomalies',
];

interface IdeaFormProps {
  onGenerate: (payload: GeneratePayload) => void;
  loading: boolean;
  preferredType?: string;
  preferredScale?: string;
}

export function IdeaForm({ onGenerate, loading, preferredType, preferredScale }: IdeaFormProps) {
  const [idea, setIdea] = useState('');
  const [projectType, setProjectType] = useState<ProjectType>(
    (preferredType as ProjectType) || 'SaaS Web App'
  );
  const [scale, setScale] = useState<Scale>(
    (preferredScale as Scale) || 'Medium (1K–100K users)'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea.trim() || loading) return;
    onGenerate({ idea: idea.trim(), projectType, scale });
  };

  const handleExample = () => {
    const random = EXAMPLE_IDEAS[Math.floor(Math.random() * EXAMPLE_IDEAS.length)];
    setIdea(random);
  };

  return (
    <form onSubmit={handleSubmit} className="card space-y-5">
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-white/70" htmlFor="idea-input">
            Describe your project idea
          </label>
          <button type="button" onClick={handleExample}
            className="text-xs text-accent-purple hover:text-accent-indigo transition-colors">
            Random example ✨
          </button>
        </div>
        <textarea
          id="idea-input"
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          placeholder="e.g. A marketplace for freelance designers to showcase portfolios and receive projects from clients worldwide..."
          rows={4}
          maxLength={2000}
          className="input-field resize-none text-sm leading-relaxed"
          disabled={loading}
        />
        <div className="flex justify-end mt-1">
          <span className="text-xs text-white/20">{idea.length}/2000</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-white/70 block mb-2">Project Type</label>
          <div className="relative">
            <select
              value={projectType}
              onChange={(e) => setProjectType(e.target.value as ProjectType)}
              className="input-field appearance-none pr-9 text-sm cursor-pointer"
              disabled={loading}
            >
              {PROJECT_TYPES.map((t) => (
                <option key={t} value={t} className="bg-dark-800">{t}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-white/70 block mb-2">Scale</label>
          <div className="relative">
            <select
              value={scale}
              onChange={(e) => setScale(e.target.value as Scale)}
              className="input-field appearance-none pr-9 text-sm cursor-pointer"
              disabled={loading}
            >
              {SCALES.map((s) => (
                <option key={s} value={s} className="bg-dark-800">{s}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
          </div>
        </div>
      </div>

      <button type="submit" disabled={!idea.trim() || loading}
        className="btn-primary w-full flex items-center justify-center gap-2">
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Generating architecture...
          </>
        ) : (
          <>
            <Wand2 className="w-4 h-4" />
            Generate Architecture
          </>
        )}
      </button>
    </form>
  );
}
