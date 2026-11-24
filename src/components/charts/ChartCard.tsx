import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { Skeleton } from '../ui/States';

interface ChartCardProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
  children: ReactNode;
}

/** Card frame for a chart. The figure gets an accessible name from the title. */
export function ChartCard({ title, description, actions, className, children }: ChartCardProps) {
  const id = `chart-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  return (
    <section className={cn('card flex flex-col p-5', className)} aria-labelledby={id}>
      <header className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 id={id} className="font-semibold text-slate-900 dark:text-white">
            {title}
          </h2>
          {description && (
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{description}</p>
          )}
        </div>
        {actions}
      </header>
      <div className="min-h-0 flex-1">{children}</div>
    </section>
  );
}

export function ChartSkeleton({ className = 'h-72' }: { className?: string }) {
  return (
    <div className="card p-5">
      <Skeleton className="mb-2 h-5 w-40" />
      <Skeleton className="mb-6 h-4 w-56" />
      <Skeleton className={className} />
    </div>
  );
}

interface TooltipEntry {
  name?: string | number;
  value?: number | string | (number | string)[];
  color?: string;
  dataKey?: string | number;
}

/** Shared Recharts tooltip: text uses ink tokens, the colored swatch carries series identity. */
export function ChartTooltip({
  active,
  payload,
  label,
  formatter,
}: {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string | number;
  formatter: (value: number) => string;
}) {
  if (!active || !payload?.length) return null;
  const showTotal = payload.length > 2;
  const total = payload.reduce((s, p) => s + (typeof p.value === 'number' ? p.value : 0), 0);
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-lg dark:border-slate-700 dark:bg-slate-900">
      <p className="mb-1 font-medium text-slate-900 dark:text-white">{label}</p>
      <ul className="space-y-0.5">
        {payload.map((p) => (
          <li
            key={String(p.dataKey)}
            className="flex items-center gap-2 text-slate-600 dark:text-slate-300"
          >
            <span
              className="h-2.5 w-2.5 rounded-sm"
              style={{ background: p.color }}
              aria-hidden="true"
            />
            <span>{p.name}</span>
            <span className="ml-auto pl-4 font-medium tabular-nums text-slate-900 dark:text-white">
              {typeof p.value === 'number' ? formatter(p.value) : String(p.value)}
            </span>
          </li>
        ))}
        {showTotal && (
          <li className="mt-1 flex justify-between border-t border-slate-200 pt-1 font-medium text-slate-900 dark:border-slate-700 dark:text-white">
            <span>Total</span>
            <span className="tabular-nums">{formatter(total)}</span>
          </li>
        )}
      </ul>
    </div>
  );
}

/** Legend rendered in HTML (not color alone: every swatch is labelled). */
export function ChartLegend({ items }: { items: { label: string; color: string }[] }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600 dark:text-slate-300">
      {items.map((i) => (
        <li key={i.label} className="flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 rounded-sm"
            style={{ background: i.color }}
            aria-hidden="true"
          />
          {i.label}
        </li>
      ))}
    </ul>
  );
}
