import { useState, useCallback, useEffect } from 'react';
import { MapPin, PanelLeft, X, LogIn, LogOut, User } from 'lucide-react';
import { useArchitecture } from './hooks/useArchitecture';
import { useHistory } from './hooks/useHistory';
import { useCloudHistory } from './hooks/useCloudHistory';
import { useAuth } from './context/AuthContext';
import { IdeaForm } from './components/IdeaForm';
import { ArchitectureView } from './components/ArchitectureView';
import { FeedbackBar } from './components/FeedbackBar';
import { HistorySidebar } from './components/HistorySidebar';
import { SkeletonLoader } from './components/SkeletonLoader';
import { ErrorToast } from './components/ErrorToast';
import { AuthModal } from './components/AuthModal';
import { setAuthToken } from './api/client';
import { track, Events } from './utils/analytics';
import type { HistoryEntry } from './types';

export default function App() {
  const { user, session, profile, signOut, isConfigured } = useAuth();
  const { arch, loading, error, feedbacks, generate, refine, loadArch, clearError } = useArchitecture();
  const { history, addToHistory, removeFromHistory, clearHistory } = useHistory();
  const { makePublic, fetchRecentFeedbacks } = useCloudHistory(user?.id);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeHistoryId, setActiveHistoryId] = useState<string | undefined>();
  const [currentArchId, setCurrentArchId] = useState<string | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [prevArch, setPrevArch] = useState(arch);

  // Sync Supabase JWT → API client Authorization header
  useEffect(() => {
    setAuthToken(session?.access_token ?? null);
  }, [session]);

  // Add generated architectures to local history after render.
  useEffect(() => {
    if (!arch || arch === prevArch) {
      return;
    }

    setPrevArch(arch);
    addToHistory(arch);
    // Cloud save happens inside generate/refine via API response _archId
  }, [arch, prevArch, addToHistory]);

  const handleGenerate = useCallback(async (payload: Parameters<typeof generate>[0]) => {
    let enrichedPayload = payload;
    if (user && isConfigured) {
      const pastFeedbacks = await fetchRecentFeedbacks();
      enrichedPayload = { ...payload, pastFeedbacks };
    }
    const result = await generate(enrichedPayload);
    if (result && (result as { _archId?: string })._archId) {
      setCurrentArchId((result as { _archId?: string })._archId!);
    }
    track(Events.ARCHITECTURE_GENERATED, {
      projectType: payload.projectType,
      scale: payload.scale,
      authenticated: !!user,
    });
  }, [generate, user, isConfigured, fetchRecentFeedbacks]);

  const handleRefine = useCallback(async (feedback: string) => {
    await refine(feedback, currentArchId ?? undefined);
    track(Events.ARCHITECTURE_REFINED, { authenticated: !!user });
  }, [refine, currentArchId, user]);

  const handleHistorySelect = useCallback((entry: HistoryEntry) => {
    loadArch(entry.arch);
    setActiveHistoryId(entry.id);
    setSidebarOpen(false);
    setCurrentArchId(null);
  }, [loadArch]);

  const handleShare = useCallback(async (): Promise<string | null> => {
    if (!currentArchId || !isConfigured) return null;
    return makePublic(currentArchId);
  }, [currentArchId, isConfigured, makePublic]);

  return (
    <div className="min-h-screen font-sans">
      {/* ── Header ── */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-dark-900/80 border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-purple to-accent-indigo
                            flex items-center justify-center shadow-lg shadow-purple-900/40">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white tracking-tight">Architecture Mapper</span>
            <span className="hidden sm:block text-xs text-white/30 font-mono ml-1">AI-powered</span>
          </div>

          {/* Right nav */}
          <div className="flex items-center gap-2">
            {/* Auth button */}
            {isConfigured && (
              user ? (
                <div className="flex items-center gap-2">
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg
                                  bg-white/5 border border-white/10 text-xs text-white/60">
                    <User className="w-3.5 h-3.5" />
                    {profile?.display_name || user.email?.split('@')[0]}
                  </div>
                  <button
                    onClick={signOut}
                    className="btn-secondary flex items-center gap-1.5 text-sm"
                    title="Sign out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuth(true)}
                  className="btn-secondary flex items-center gap-1.5 text-sm"
                >
                  <LogIn className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign in</span>
                </button>
              )
            )}

            {/* History toggle */}
            <button
              onClick={() => setSidebarOpen((o) => !o)}
              className="btn-secondary flex items-center gap-2 text-sm"
            >
              {sidebarOpen ? <X className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
              <span className="hidden sm:inline">History</span>
              {history.length > 0 && (
                <span className="badge bg-accent-purple/20 text-accent-purple text-xs px-1.5 py-0.5">
                  {history.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Layout ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex gap-6">
          {/* Sidebar */}
          {sidebarOpen && (
            <aside className="w-72 flex-shrink-0 animate-fade-in">
              <div className="sticky top-[4.5rem] h-[calc(100vh-5.5rem)] overflow-hidden">
                <HistorySidebar
                  history={history}
                  onSelect={handleHistorySelect}
                  onRemove={removeFromHistory}
                  onClear={clearHistory}
                  activeId={activeHistoryId}
                />
              </div>
            </aside>
          )}

          {/* Content */}
          <main className="flex-1 min-w-0 space-y-6">
            {!arch && !loading && (
              <div className="text-center py-10 animate-fade-in">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
                                bg-accent-purple/10 border border-accent-purple/20 text-accent-purple
                                text-xs font-medium mb-4">
                  ✦ Powered by Gemma 3
                </div>
                <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-4">
                  Design your{' '}
                  <span className="text-gradient">architecture</span>
                  <br />in seconds
                </h1>
                <p className="text-white/50 text-lg max-w-lg mx-auto">
                  Describe your project idea and get a comprehensive,
                  production-ready software architecture instantly.
                </p>
                {isConfigured && !user && (
                  <button
                    onClick={() => setShowAuth(true)}
                    className="mt-6 text-sm text-accent-purple hover:text-accent-indigo transition-colors underline underline-offset-4"
                  >
                    Sign in to save your architectures to the cloud →
                  </button>
                )}
              </div>
            )}

            <IdeaForm
              onGenerate={handleGenerate}
              loading={loading}
              preferredType={profile?.preferred_project_type}
              preferredScale={profile?.preferred_scale}
            />

            {loading && <SkeletonLoader />}

            {arch && !loading && (
              <>
                <ArchitectureView
                  arch={arch}
                  onShare={user && isConfigured ? handleShare : undefined}
                />
                <FeedbackBar
                  onRefine={handleRefine}
                  loading={loading}
                  version={arch.version}
                  pastFeedbacks={feedbacks}
                />
              </>
            )}
          </main>
        </div>
      </div>

      {/* Modals & Toasts */}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      {error && <ErrorToast message={error} onClose={clearError} />}
    </div>
  );
}
