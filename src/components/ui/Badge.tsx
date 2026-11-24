import type { CustomerStatus, Plan } from '../../data/types';
import { PLAN_COLOR_VAR } from './planColors';
import { cn } from '../../lib/cn';

const statusStyles: Record<CustomerStatus, { label: string; className: string; dot: string }> = {
  active: {
    label: 'Active',
    className:
      'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300',
    dot: 'bg-emerald-500',
  },
  trial: {
    label: 'Trial',
    className: 'bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-500/10 dark:text-sky-300',
    dot: 'bg-sky-500',
  },
  past_due: {
    label: 'Past due',
    className:
      'bg-amber-50 text-amber-800 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300',
    dot: 'bg-amber-500',
  },
  churned: {
    label: 'Churned',
    className:
      'bg-slate-100 text-slate-600 ring-slate-500/20 dark:bg-slate-500/10 dark:text-slate-300',
    dot: 'bg-slate-400',
  },
};

export function StatusBadge({ status }: { status: CustomerStatus }) {
  const s = statusStyles[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
        s.className,
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', s.dot)} aria-hidden="true" />
      {s.label}
    </span>
  );
}

export function PlanBadge({ plan }: { plan: Plan }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-slate-700 dark:text-slate-300">
      <span
        className="h-2.5 w-2.5 rounded-sm"
        style={{ background: PLAN_COLOR_VAR[plan] }}
        aria-hidden="true"
      />
      {plan}
    </span>
  );
}
