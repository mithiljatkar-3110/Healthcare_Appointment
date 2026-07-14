import { LoaderCircle } from 'lucide-react';

export function LoadingSpinner({ label = 'Loading...' }) { return <div className="flex items-center justify-center gap-2 py-8 text-sm font-medium text-slate-500"><LoaderCircle className="h-5 w-5 animate-spin text-blue-600" />{label}</div>; }
export function PageSkeleton({ cards = 3 }) { return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: cards }).map((_, index) => <div key={index} className="h-44 animate-pulse rounded-2xl border border-slate-100 bg-slate-100" />)}</div>; }
