import { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error) { console.error('Frontend error boundary:', error); }
  render() {
    if (!this.state.hasError) return this.props.children;
    return <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4"><section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600"><AlertTriangle className="h-7 w-7" /></div><h1 className="mt-5 text-2xl font-semibold text-slate-900">Something went wrong</h1><p className="mt-2 text-sm leading-6 text-slate-600">We could not display this page safely. Refresh to try again.</p><button type="button" onClick={() => window.location.reload()} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white"><RefreshCw className="h-4 w-4" />Refresh page</button></section></main>;
  }
}
export default ErrorBoundary;
