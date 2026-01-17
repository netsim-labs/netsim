import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    this.props.onReset?.();
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          className="min-h-screen bg-[#0b0c0d] flex items-center justify-center p-6"
          role="alert"
          aria-live="assertive"
        >
          <div className="max-w-lg w-full bg-gradient-to-br from-red-900/20 to-black/40 border border-red-500/30 rounded-2xl p-8 shadow-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-red-500/20 rounded-xl">
                <AlertTriangle className="w-8 h-8 text-red-400" aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Something went wrong</h1>
                <p className="text-sm text-zinc-400">An unexpected error has occurred</p>
              </div>
            </div>

            <div className="bg-black/30 border border-zinc-800 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-300 font-mono break-all">
                {this.state.error?.message || 'Unknown error'}
              </p>
              {this.state.errorInfo && (
                <details className="mt-3">
                  <summary className="text-xs text-zinc-500 cursor-pointer hover:text-zinc-300">
                    See technical details
                  </summary>
                  <pre className="mt-2 text-[10px] text-zinc-600 overflow-auto max-h-32">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white py-3 px-4 rounded-xl border border-zinc-700 transition focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <RefreshCcw size={16} aria-hidden="true" />
                <span>Retry</span>
              </button>
              <button
                onClick={this.handleReload}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-3 px-4 rounded-xl border border-blue-500 transition focus-visible:ring-2 focus-visible:ring-blue-400"
              >
                <Home size={16} aria-hidden="true" />
                <span>Reload page</span>
              </button>
            </div>

            <p className="text-center text-xs text-zinc-600 mt-6">
              If the problem persists, contact support
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Functional component for specific component errors
interface ComponentErrorProps {
  message?: string;
  onRetry?: () => void;
}

export function ComponentError({ message = 'Error loading component', onRetry }: ComponentErrorProps) {
  return (
    <div
      className="bg-red-900/10 border border-red-500/30 rounded-xl p-4 text-center"
      role="alert"
    >
      <AlertTriangle className="w-6 h-6 text-red-400 mx-auto mb-2" aria-hidden="true" />
      <p className="text-sm text-red-300 mb-3">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-xs text-zinc-400 hover:text-white underline focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
        >
          Retry
        </button>
      )}
    </div>
  );
}
