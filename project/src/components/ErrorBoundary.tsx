import { Component, ReactNode } from 'react';

type Props = { children: ReactNode };
type State = { hasError: boolean };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };
  static getDerivedStateFromError(): State { return { hasError: true }; }
  componentDidCatch(error: unknown) { console.error(error); }
  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, fontFamily: 'system-ui, sans-serif', textAlign: 'center' }}>
        <div>
          <h1>Oups, un problème est survenu.</h1>
          <p>Recharge la page pour continuer.</p>
          <button onClick={() => window.location.reload()} style={{ padding: '10px 18px', borderRadius: 10, border: 0, background: '#1f6f4a', color: '#fff', cursor: 'pointer' }}>Recharger</button>
        </div>
      </div>
    );
  }
}
