import { useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';

interface ErrorToastProps {
  message: string;
  onClose: () => void;
}

export function ErrorToast({ message, onClose }: ErrorToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 6000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-up max-w-sm">
      <div className="flex items-start gap-3 bg-red-950/90 backdrop-blur-xl border border-red-500/40
                      rounded-2xl px-4 py-3.5 shadow-2xl shadow-red-900/30">
        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-red-300">Error</p>
          <p className="text-xs text-red-400/80 mt-0.5 break-words">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="text-red-400/60 hover:text-red-400 transition-colors p-0.5 flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
