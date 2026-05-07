import { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(err: unknown): State {
    const message =
      err instanceof Error
        ? err.message
        : typeof err === 'string'
        ? err
        : 'An unexpected rendering error occurred.';
    return { hasError: true, message };
  }

  componentDidCatch(err: unknown, info: { componentStack: string }) {
    console.error('[ErrorBoundary]', err, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, message: '' });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900 px-4">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20
                          flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-xl font-bold text-white">Something went wrong</h1>
          <p className="text-sm text-white/50 break-words">
            {this.state.message || 'An unexpected error occurred. Please try refreshing.'}
          </p>
          <button
            onClick={this.handleReset}
            className="btn-primary inline-flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Try again
          </button>
        </div>
      </div>
    );
  }
}
