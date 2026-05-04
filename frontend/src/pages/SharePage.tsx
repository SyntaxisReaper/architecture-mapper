import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { useCloudHistory } from '../hooks/useCloudHistory';
import { ArchitectureView } from '../components/ArchitectureView';
import type { Architecture } from '../types';

export function SharePage() {
  const { slug } = useParams<{ slug: string }>();
  const { fetchBySlug } = useCloudHistory(undefined);
  const [arch, setArch] = useState<Architecture | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    fetchBySlug(slug).then((data) => {
      if (data) setArch(data);
      else setNotFound(true);
      setLoading(false);
    });
  }, [slug, fetchBySlug]);

  return (
    <div className="min-h-screen font-sans">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-dark-900/80 border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-purple to-accent-indigo
                            flex items-center justify-center shadow-lg shadow-purple-900/40">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white tracking-tight">Architecture Mapper</span>
          </div>
          <Link
            to="/"
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to App</span>
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="w-8 h-8 text-accent-purple animate-spin" />
            <p className="text-white/40 text-sm">Loading shared architecture…</p>
          </div>
        )}

        {notFound && !loading && (
          <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20
                            flex items-center justify-center">
              <AlertCircle className="w-7 h-7 text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Architecture not found</h2>
            <p className="text-white/40 text-sm max-w-sm">
              This share link may have expired or the architecture has been made private.
            </p>
            <Link to="/" className="btn-primary mt-2">
              Create your own →
            </Link>
          </div>
        )}

        {arch && !loading && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full
                            bg-accent-purple/10 border border-accent-purple/20
                            text-accent-purple text-xs font-medium w-fit">
              🔗 Shared architecture — view only
            </div>
            <ArchitectureView arch={arch} readOnly />
          </div>
        )}
      </div>
    </div>
  );
}
