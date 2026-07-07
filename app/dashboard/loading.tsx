import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="w-full min-h-[50vh] flex flex-col items-center justify-center gap-3">
      <div className="relative flex items-center justify-center">
        {/* Outer subtle ring */}
        <div className="w-10 h-10 rounded-full border-2 border-slate-100 border-t-brand-600 animate-spin absolute" />
        {/* Inner brand accent pulsing icon */}
        <Loader2 className="w-5 h-5 text-brand-650 animate-pulse" />
      </div>
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest animate-pulse mt-1">
        Loading...
      </p>
    </div>
  );
}
