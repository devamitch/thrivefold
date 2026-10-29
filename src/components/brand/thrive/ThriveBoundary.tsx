import React from 'react';

/** Wrap any Thrive UI. If rendering throws, the fallback (e.g. the static brand icon) shows instead of a crash. */
export class ThriveBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    if (__DEV__) console.warn('[thrive] render failed', error);
  }
  render() {
    return this.state.failed ? (this.props.fallback ?? null) : this.props.children;
  }
}
