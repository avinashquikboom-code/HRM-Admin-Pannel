import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full glass-card p-6 sm:p-8 md:p-10 text-center"
          >
            <div className="w-20 h-20 bg-error/10 text-error rounded-sm flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={40} />
            </div>
            
            <h1 className="text-lg font-semibold text-text-primary mb-2">Something went wrong</h1>
            <p className="text-text-secondary mb-8">
              An unexpected error occurred. Don't worry, our team has been notified.
            </p>

            <div className="bg-surface-variant/50 rounded-sm p-4 mb-8 text-left overflow-hidden">
              <p className="text-label font-bold text-muted mb-2">Error Details</p>
              <p className="text-xs font-mono text-error break-words">
                {this.state.error?.message || 'Unknown runtime error'}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button 
                onClick={this.handleReset}
                className="btn-primary w-full py-4 flex items-center justify-center gap-2"
              >
                <RefreshCcw size={18} />
                Try Again
              </button>
              <button 
                onClick={() => window.location.href = '/'}
                className="w-full py-4 bg-surface-variant text-text-primary font-bold rounded-sm hover:opacity-90 transition-all flex items-center justify-center gap-2"
              >
                <Home size={18} />
                Back to Dashboard
              </button>
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
