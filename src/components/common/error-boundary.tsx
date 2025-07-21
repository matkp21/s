// src/components/common/error-boundary.tsx
"use client";

import React, { type ErrorInfo, type ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="flex items-center justify-center p-4">
            <Alert variant="destructive" className="max-w-lg">
                <AlertTriangle className="h-5 w-5" />
                <AlertTitle>Something went wrong</AlertTitle>
                <AlertDescription>
                    <p>An unexpected error occurred. Please try refreshing the page.</p>
                    {process.env.NODE_ENV === 'development' && (
                        <pre className="mt-2 whitespace-pre-wrap text-xs">
                           {this.state.error?.message}
                        </pre>
                    )}
                </AlertDescription>
                 <div className="mt-4">
                    <Button onClick={() => window.location.reload()} variant="destructive">
                        Reload Page
                    </Button>
                </div>
            </Alert>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
