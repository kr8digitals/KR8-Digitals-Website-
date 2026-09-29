import React, { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("KR8 Digitals ErrorBoundary caught an exception:", error, errorInfo);
  }

  handleReload = () => {
    try {
      window.location.href = "/";
    } catch {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#0d0118] px-6 text-center text-white">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-pink text-3xl shadow-xl">
            ⚡
          </div>
          <h1 className="mt-4 font-display text-2xl font-bold">KR8 Digitals</h1>
          <p className="mt-2 max-w-md text-sm text-[#cabfe0] leading-relaxed">
            The application encountered a display refresh state. Tap below to resume your session.
          </p>
          <button
            onClick={this.handleReload}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-pink px-6 py-2.5 text-xs font-bold text-white shadow-xl hover:scale-105 active:scale-95 transition-all"
          >
            <span>↻</span>
            <span>Reload KR8 Digitals</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
