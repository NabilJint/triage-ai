"use client";

import { Component, type ReactNode } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

type FeedErrorBoundaryProps = {
  children: ReactNode;
};

type FeedErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

export class FeedErrorBoundary extends Component<
  FeedErrorBoundaryProps,
  FeedErrorBoundaryState
> {
  constructor(props: FeedErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): FeedErrorBoundaryState {
    return { hasError: true, error };
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="size-16 rounded-full bg-error-light flex items-center justify-center mb-4">
            <AlertCircle className="size-8 text-error" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-1">
            Something went wrong
          </h3>
          <p className="text-sm text-text-secondary mb-6 max-w-sm">
            The triage feed encountered an error. Please try again.
          </p>
          <Button onClick={this.handleRetry}>
            <RefreshCw className="size-4 mr-1.5" />
            Try Again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
