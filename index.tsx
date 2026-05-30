
import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';

const Admin = lazy(() => import('./AdminPage'));
const MembershipPortal = lazy(() => import('./MembershipPortal'));
const OfflineOffersPortal = lazy(() => import('./OfflineOffersPortal'));
const PublicOffersPage = lazy(() => import('./PublicOffersPage'));
const TransformationsPage = lazy(() => import('./TransformationsPage'));
const LogoutPage = lazy(() => import('./LogoutPage'));

type RouteErrorBoundaryState = {
  error: Error | null;
};

type RouteErrorBoundaryProps = {
  children?: React.ReactNode;
};

class RouteErrorBoundary extends React.Component<RouteErrorBoundaryProps, RouteErrorBoundaryState> {
  declare props: RouteErrorBoundaryProps;
  state: RouteErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): RouteErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error('Route render failed:', error);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-[#0E0E0E] flex items-center justify-center px-4">
          <div className="max-w-2xl w-full glass rounded-3xl p-8 border border-red-500/30">
            <p className="text-red-400 text-xs font-black uppercase tracking-[0.3em] mb-3">Page Error</p>
            <h1 className="text-3xl font-black text-white mb-3">This page failed to load.</h1>
            <p className="text-neutral-300 mb-4">
              The route hit a runtime error instead of rendering normally.
            </p>
            <pre className="whitespace-pre-wrap break-words text-sm text-red-300 bg-black/40 rounded-2xl p-4 border border-white/10">
              {this.state.error.message}
            </pre>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <RouteErrorBoundary>
    <BrowserRouter>
      <Suspense
        fallback={
          <div className="min-h-screen bg-[#0E0E0E] flex items-center justify-center px-4">
            <div className="glass rounded-3xl px-6 py-5 text-center border border-white/10">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-gold mb-2">NOIZE</p>
              <p className="text-sm text-neutral-300">Loading page...</p>
            </div>
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/admin/*" element={<Admin />} />
          <Route path="/offers" element={<PublicOffersPage />} />
          <Route path="/transformations" element={<TransformationsPage />} />
          <Route path="/offline-offers" element={<OfflineOffersPortal />} />
          <Route path="/portal" element={<MembershipPortal />} />
          <Route path="/logout" element={<LogoutPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </RouteErrorBoundary>
);
