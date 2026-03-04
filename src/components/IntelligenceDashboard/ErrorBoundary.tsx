import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class DashboardErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Dashboard Error Boundary caught error:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI that always renders
      return (
        this.props.fallback || (
          <div className="glass-card p-8 text-center">
            <div className="text-amber-400 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Dashboard Temporarily Unavailable
            </h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              We encountered an issue loading the Intelligence Dashboard. This
              has been logged and our team is working on it.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleRetry}
                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium"
              >
                Reload Page
              </button>
            </div>
            {/* Show technical details in development */}
            {import.meta.env.DEV && this.state.error && (
              <details className="mt-6 text-left max-w-lg mx-auto">
                <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-400">
                  Technical Details
                </summary>
                <pre className="mt-2 p-4 bg-gray-900 rounded-lg text-xs text-red-400 overflow-auto">
                  {this.state.error.message}
                  {"\n\n"}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        )
      );
    }

    return this.props.children;
  }
}

export default DashboardErrorBoundary;
