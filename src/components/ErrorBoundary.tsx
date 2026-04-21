import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  label?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[Cockpit] ${this.props.label ?? "section"} error:`, error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="cockpit-section-error">
          <span>Failed to load {this.props.label ?? "section"}.</span>
          <button
            className="cockpit-section-error__retry"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
