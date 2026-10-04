export function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const labels: Record<string, string> = { pending: 'Pending', confirmed: 'Confirmed', completed: 'Completed', cancelled: 'Cancelled' };
  const map: Record<string, string> = {
    pending: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    // Confirmed appointments are shown in green to make them stand out as
    // ready-to-go, distinct from the brand/rose color used elsewhere.
    confirmed: 'bg-green-50 text-green-700 ring-1 ring-green-200',
    completed: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
    cancelled: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
  };
  const dot: Record<string, string> = {
    pending: 'bg-amber-500',
    confirmed: 'bg-green-500',
    completed: 'bg-slate-400',
    cancelled: 'bg-rose-500',
  };
  return (
    <span className={`badge ${map[normalized] ?? map.completed}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot[normalized] ?? dot.completed}`} />
      {labels[normalized] ?? status}
    </span>
  );
}

export function Spinner({ className = '' }: { className?: string }) {
  return (
    <div
      className={`h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-brand-600 ${className}`}
    />
  );
}

export function EmptyState({
  icon: Icon,
  title,
  hint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-400">
        <Icon className="h-6 w-6" />
      </div>
      <p className="text-sm font-semibold text-slate-600">{title}</p>
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
      {message}
    </div>
  );
}
