import { useState } from 'react';
import { X, Mail, Lock, Globe2, AlertCircle, Loader2, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  onClose: () => void;
}

type Mode = 'signin' | 'signup';

export function AuthModal({ onClose }: AuthModalProps) {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const fn = mode === 'signin' ? signInWithEmail : signUpWithEmail;
    const err = await fn(email, password);

    setLoading(false);
    if (err) {
      setError(err);
    } else if (mode === 'signup') {
      setSuccess(true);
    } else {
      onClose();
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    await signInWithGoogle();
    // redirect handled by Supabase
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-sm animate-slide-up">
        <div className="card border border-white/15 shadow-2xl shadow-black/50">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-white">
                {mode === 'signin' ? 'Welcome back' : 'Create account'}
              </h2>
              <p className="text-xs text-white/40 mt-0.5">
                {mode === 'signin'
                  ? 'Sign in to save & sync your architectures'
                  : 'Save architectures and track history'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white/30 hover:text-white transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {success ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/30
                              flex items-center justify-center mx-auto">
                <Mail className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="font-medium text-white">Check your email</p>
              <p className="text-sm text-white/50">
                We sent a confirmation link to <strong>{email}</strong>
              </p>
              <button onClick={onClose} className="btn-primary w-full mt-4">
                Got it
              </button>
            </div>
          ) : (
            <>
              {/* Google OAuth */}
              <button
                onClick={handleGoogle}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-2.5 rounded-xl
                           bg-white/10 hover:bg-white/15 border border-white/15 hover:border-white/25
                           transition-all duration-150 text-sm font-medium text-white disabled:opacity-50 mb-4"
              >
                <Globe2 className="w-4 h-4" />
                Continue with Google
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-xs text-white/30">or</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              {/* Email form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    required
                    className="input-field pl-9 text-sm"
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                    minLength={6}
                    className="input-field pl-9 text-sm"
                  />
                </div>

                {error && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-red-400">{String(error)}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                  {mode === 'signin' ? 'Sign in' : 'Create account'}
                </button>
              </form>

              <p className="text-center text-xs text-white/30 mt-4">
                {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}{' '}
                <button
                  onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null); }}
                  className="text-accent-purple hover:text-accent-indigo transition-colors"
                >
                  {mode === 'signin' ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
