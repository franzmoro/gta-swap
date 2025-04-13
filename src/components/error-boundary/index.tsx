import { getToastStyle } from '@/hooks/use-toast';
import React, { Component, ReactNode } from 'react';
import { toast } from 'sonner';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null, hasError: false };

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { error, hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);

    // Dismiss all active toasts
    toast.dismiss();

    toast.error('Something went wrong', {
      closeButton: true,
      description: 'There was an error. Please reach out on Telegram for support.',
      duration: 5000,
      style: getToastStyle('error'),
    });
  }

  handleRetry = (): void => {
    // Reset error state to re-render children
    this.setState({ error: null, hasError: false });
  };

  render() {
    // Render children if no error
    return this.props.children;
  }
}

export default ErrorBoundary;
