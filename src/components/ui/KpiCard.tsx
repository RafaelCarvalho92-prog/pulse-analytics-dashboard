import type { Kpi } from '../../data/types';
import { cn } from '../../lib/cn';
import { formatDelta, formatKpi, percentChange } from '../../lib/format';
import { Icon } from './Icon';
import { Skeleton } from './States';

function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) return null;
  const w = 96;
  const h = 32;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const points = values
    .map((v, i) => `${(i / (values.length - 1)) * w},${h - 2 - ((v - min) / span) * (h - 4)}`)
    .join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-8 w-24 text-brand-500" aria-hidden="true">
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function KpiCard({ kpi, comparisonLabel }: { kpi: Kpi; comparisonLabel: string }) {
  // Percent KPIs compare in percentage points; everything else as relative change.
  const delta =
    kpi.format === 'percent' ? kpi.value - kpi.previous : percentChange(kpi.value, kpi.previous);
  const isUp = delta >= 0;
  const isGood = kpi.invert ? !isUp : isUp;
  const deltaText =
    kpi.format === 'percent' ? `${delta > 0 ? '+' : ''}${delta.toFixed(2)} pp` : formatDelta(delta);

  return (
    <article className="card flex flex-col gap-3 p-5" aria-label={kpi.label}>
      <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">{kpi.label}</h3>
      <div className="flex items-end justify-between gap-3">
        <p className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
          {formatKpi(kpi)}
        </p>
        <Sparkline values={kpi.spark} />
      </div>
      <p className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
        <span
          className={cn(
            'inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-semibold',
            isGood
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
              : 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300',
          )}
        >
          <Icon name={isUp ? 'arrowUp' : 'arrowDown'} className="h-3 w-3" />
          <span className="sr-only">{isUp ? 'Up' : 'Down'}</span>
          {deltaText}
        </span>
        {comparisonLabel}
      </p>
    </article>
  );
}

export function KpiCardSkeleton() {
  return (
    <div className="card flex flex-col gap-4 p-5">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-7 w-24" />
      <Skeleton className="h-4 w-40" />
    </div>
  );
}
