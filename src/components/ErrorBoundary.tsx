import React from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

interface State {
  hasError: boolean;
  error: Error | null;
}

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error("[ErrorBoundary]", error, info);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  reload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return <>{this.props.fallback}</>;
      return (
        <div className="min-h-screen flex items-center justify-center px-6 bg-background">
          <div className="glass-card max-w-sm w-full p-6 text-center space-y-4">
            <div className="mx-auto w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="text-destructive" size={26} />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-foreground">Something went wrong</h2>
              <p className="text-xs text-muted-foreground mt-1">
                We hit an unexpected error. Please reload the page to continue.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={this.reset}
                className="flex-1 py-2.5 rounded-xl bg-muted text-foreground text-sm font-semibold active:scale-95 transition-transform"
              >
                Try again
              </button>
              <button
                onClick={this.reload}
                className="flex-1 py-2.5 rounded-xl gold-gradient gold-glow text-primary-foreground text-sm font-semibold flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
              >
                <RotateCcw size={14} /> Reload
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;