import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** When true, renders a full-page fallback; otherwise an inline card. */
  fullPage?: boolean;
  /** i18n helper — optional; falls back to hard-coded Spanish. */
  t?: (key: string) => string;
}

interface State {
  hasError: boolean;
}

/**
 * Catches React render errors (including the DOM insertBefore crash from
 * browser-native page translation) and shows a recoverable fallback instead
 * of a blank white screen.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    const t = this.props.t;
    const heading = t ? t("error.boundary.heading") : "Algo ha fallado.";
    const body = t ? t("error.boundary.body") : "Tu presupuesto está guardado.";
    const btn = t ? t("error.boundary.reload") : "Recargar";

    if (this.props.fullPage) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 text-center">
          <div>
            <p className="text-lg font-semibold mb-2">{heading}</p>
            <p className="text-sm text-muted-foreground mb-4">{body}</p>
            <button
              className="px-4 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-medium"
              onClick={() => window.location.reload()}
            >
              {btn}
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-5 text-center space-y-3">
        <p className="text-sm font-semibold">{heading}</p>
        <p className="text-xs text-muted-foreground">{body}</p>
        <button
          className="px-3 py-1.5 rounded-lg bg-accent text-accent-foreground text-xs font-medium"
          onClick={() => this.setState({ hasError: false })}
        >
          {btn}
        </button>
      </div>
    );
  }
}
