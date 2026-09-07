import { Component, type ReactNode } from 'react';

interface HeroSceneErrorBoundaryProps {
  fallback: ReactNode;
  children: ReactNode;
}

interface HeroSceneErrorBoundaryState {
  hasError: boolean;
}

/**
 * Guards the WebGL canvas: if context creation or any R3F render throws
 * (unsupported GPU, driver quirk, exhausted context budget), this swaps to
 * the same static fallback used for reduced-motion instead of taking the
 * whole homepage down.
 */
export class HeroSceneErrorBoundary extends Component<
  HeroSceneErrorBoundaryProps,
  HeroSceneErrorBoundaryState
> {
  state: HeroSceneErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): HeroSceneErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    // eslint-disable-next-line no-console
    console.error('HeroScene failed to render; falling back to the static hero background.', error);
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}
