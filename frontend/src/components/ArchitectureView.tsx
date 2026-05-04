import { useState } from 'react';
import { Download, FileText, Share2, AlertTriangle, TrendingUp, DollarSign, FileDown, Check, Loader2 } from 'lucide-react';
import type { Architecture } from '../types';
import { LayerCard } from './LayerCard';
import { exportToMarkdown, exportToJSON } from '../utils/export';
import { exportToPDF } from '../utils/exportPDF';
import { track, Events } from '../utils/analytics';

interface ArchitectureViewProps {
  arch: Architecture;
  onShare?: () => Promise<string | null>;
  readOnly?: boolean;
}

const PRIORITY_CLASS = {
  high: 'priority-high',
  medium: 'priority-medium',
  low: 'priority-low',
} as const;

export function ArchitectureView({ arch, onShare, readOnly = false }: ArchitectureViewProps) {
  const [pdfLoading, setPdfLoading] = useState(false);
  const [shareState, setShareState] = useState<'idle' | 'loading' | 'copied'>('idle');

  const handlePDF = async () => {
    setPdfLoading(true);
    try {
      await exportToPDF(arch);
      track(Events.EXPORT_PDF, { title: arch.title });
    } finally {
      setPdfLoading(false);
    }
  };

  const handleShare = async () => {
    if (shareState !== 'idle') return;
    setShareState('loading');

    let shareUrl = window.location.href;
    if (onShare) {
      const slug = await onShare();
      if (slug) shareUrl = `${window.location.origin}/arch/${slug}`;
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareState('copied');
      track(Events.SHARE_LINK_COPIED, { title: arch.title });
      setTimeout(() => setShareState('idle'), 2500);
    } catch {
      setShareState('idle');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header card */}
      <div className="card glow-purple">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-white">{arch.title}</h1>
              <span className="badge bg-accent-purple/20 text-accent-purple border border-accent-purple/30">
                v{arch.version}
              </span>
            </div>
            <p className="text-sm text-white/60 leading-relaxed max-w-2xl">{arch.summary}</p>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className="badge bg-white/10 text-white/60">📂 {arch.projectType}</span>
              <span className="badge bg-white/10 text-white/60">📈 {arch.scale}</span>
            </div>
          </div>

          {!readOnly && (
            <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
              <button
                onClick={() => { exportToMarkdown(arch); track(Events.EXPORT_MARKDOWN, { title: arch.title }); }}
                className="btn-secondary flex items-center gap-1.5 text-sm"
                title="Export as Markdown"
              >
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">MD</span>
              </button>
              <button
                onClick={() => { exportToJSON(arch); track(Events.EXPORT_JSON, { title: arch.title }); }}
                className="btn-secondary flex items-center gap-1.5 text-sm"
                title="Export as JSON"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">JSON</span>
              </button>
              <button
                onClick={handlePDF}
                disabled={pdfLoading}
                className="btn-secondary flex items-center gap-1.5 text-sm"
                title="Export as PDF"
              >
                {pdfLoading
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <FileDown className="w-4 h-4" />
                }
                <span className="hidden sm:inline">PDF</span>
              </button>
              <button
                onClick={handleShare}
                className="btn-secondary flex items-center gap-1.5 text-sm"
                title="Copy share link"
              >
                {shareState === 'loading' && <Loader2 className="w-4 h-4 animate-spin" />}
                {shareState === 'copied' && <Check className="w-4 h-4 text-emerald-400" />}
                {shareState === 'idle' && <Share2 className="w-4 h-4" />}
                <span className="hidden sm:inline">
                  {shareState === 'copied' ? 'Copied!' : 'Share'}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Layers Grid */}
      <section>
        <h2 className="text-lg font-semibold text-white/80 mb-4">Architecture Layers</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {arch.layers.map((layer, i) => (
            <LayerCard key={layer.id} layer={layer} index={i} />
          ))}
        </div>
      </section>

      {/* Tech Stack */}
      <section className="card">
        <h2 className="text-lg font-semibold text-white/80 mb-4">Tech Stack</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {arch.techStack.map((item) => (
            <div
              key={`${item.category}-${item.name}`}
              className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/[0.08]"
            >
              <div className="flex-1 min-w-0">
                <span className="text-xs text-white/30 uppercase tracking-wider">{item.category}</span>
                <p className="text-sm font-semibold text-white mt-0.5">{item.name}</p>
                <p className="text-xs text-white/50 mt-1">{item.reason}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Improvements + Cost + Risks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Improvements */}
        <div className="card lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-accent-cyan" />
            <h2 className="text-lg font-semibold text-white/80">Improvements</h2>
          </div>
          <div className="space-y-3">
            {arch.improvements.map((imp, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/[0.08]">
                <span className={`badge flex-shrink-0 mt-0.5 ${PRIORITY_CLASS[imp.priority]}`}>
                  {imp.priority}
                </span>
                <div>
                  <p className="text-sm font-medium text-white">{imp.title}</p>
                  <p className="text-xs text-white/50 mt-1">{imp.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cost + Risks */}
        <div className="space-y-4">
          <div className="card">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <h2 className="text-base font-semibold text-white/80">Cost Estimate</h2>
            </div>
            <div className="text-center py-3">
              <p className="text-xs text-white/30 uppercase tracking-wider">{arch.costEstimate.tier}</p>
              <p className="text-2xl font-bold text-white mt-1">
                ${arch.costEstimate.monthlyMin}
                <span className="text-white/40 text-lg"> – </span>
                ${arch.costEstimate.monthlyMax}
              </p>
              <p className="text-xs text-white/30 mt-0.5">per month</p>
            </div>
            <p className="text-xs text-white/50 text-center border-t border-white/[0.08] pt-3 mt-2">
              {arch.costEstimate.notes}
            </p>
          </div>

          <div className="card">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h2 className="text-base font-semibold text-white/80">Risks</h2>
            </div>
            <div className="space-y-2">
              {arch.risks.map((risk, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-white/5 border border-white/[0.08]">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`badge text-xs ${PRIORITY_CLASS[risk.severity]}`}>{risk.severity}</span>
                    <p className="text-xs font-medium text-white">{risk.title}</p>
                  </div>
                  <p className="text-xs text-white/40">{risk.mitigation}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
