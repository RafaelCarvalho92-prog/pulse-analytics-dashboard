import { differenceInCalendarMonths, format, parseISO, subDays } from 'date-fns';
import { useMemo, useState } from 'react';
import { PlanBadge, StatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Drawer } from '../../components/ui/Drawer';
import { DATA_AS_OF } from '../../data/generator';
import type { Customer } from '../../data/types';
import { cn } from '../../lib/cn';
import { formatCurrency, formatNumber } from '../../lib/format';
import { createRng } from '../../lib/random';

const fmt = (iso: string | null) => (iso ? format(parseISO(iso), 'MMM d, yyyy') : '-');

const ACTIVITY = [
  'Invited 3 teammates',
  'Exported a revenue report',
  'Connected the Stripe integration',
  'Created a new dashboard',
  'Updated billing details',
  'Opened a support ticket',
  'Shared a report with finance',
  'Enabled SSO',
] as const;

/** Deterministic "recent activity" so the same customer always shows the same feed. */
function activityFor(customer: Customer) {
  const rng = createRng(Number(customer.id.replace(/\D/g, '')) * 7919);
  const last = parseISO(customer.lastActive);
  return Array.from({ length: 4 }, (_, i) => ({
    text: rng.pick(ACTIVITY),
    date: subDays(last, i * rng.int(1, 6)),
  }));
}

export function CustomerDrawer({
  customer,
  onClose,
}: {
  customer: Customer | null;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const activity = useMemo(() => (customer ? activityFor(customer) : []), [customer]);

  if (!customer) return null;

  const paidMonths = customer.paidSince
    ? Math.max(
        1,
        differenceInCalendarMonths(
          parseISO(customer.churnDate ?? DATA_AS_OF),
          parseISO(customer.paidSince),
        ),
      )
    : 0;
  const health = customer.healthScore;
  const healthTone =
    health >= 70 ? 'bg-emerald-500' : health >= 40 ? 'bg-amber-500' : 'bg-rose-500';

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(customer.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard can be unavailable (insecure context) - ignore */
    }
  };

  return (
    <Drawer open title="Customer details" onClose={onClose}>
      <div className="flex items-start gap-4">
        <span
          className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand-100 text-lg font-semibold text-brand-700 dark:bg-brand-500/20 dark:text-brand-200"
          aria-hidden="true"
        >
          {customer.name
            .split(' ')
            .map((w) => w[0])
            .join('')}
        </span>
        <div className="min-w-0">
          <p className="text-lg font-semibold text-slate-900 dark:text-white">{customer.name}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {customer.company} · {customer.industry}
          </p>
          <p className="truncate text-sm text-slate-500 dark:text-slate-400">{customer.email}</p>
          <div className="mt-2 flex items-center gap-3">
            <StatusBadge status={customer.status} />
            <PlanBadge plan={customer.plan} />
          </div>
        </div>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-3">
        {[
          ['MRR', formatCurrency(customer.mrr)],
          ['Seats', formatNumber(customer.seats)],
          ['Lifetime value', formatCurrency(customer.mrr * paidMonths)],
          ['Country', customer.country],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
            <dt className="text-xs text-slate-500 dark:text-slate-400">{label}</dt>
            <dd className="mt-1 font-semibold text-slate-900 dark:text-white">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-6">
        <div className="mb-1 flex justify-between text-sm">
          <span id="health-label" className="font-medium text-slate-700 dark:text-slate-300">
            Health score
          </span>
          <span className="font-semibold text-slate-900 dark:text-white">{health}/100</span>
        </div>
        <div
          className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
          role="meter"
          aria-labelledby="health-label"
          aria-valuenow={health}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className={cn('h-full rounded-full', healthTone)} style={{ width: `${health}%` }} />
        </div>
      </div>

      <h3 className="mt-6 text-sm font-semibold text-slate-900 dark:text-white">Timeline</h3>
      <dl className="mt-2 divide-y divide-slate-100 text-sm dark:divide-slate-800">
        {[
          ['Customer ID', customer.id],
          ['Signed up', fmt(customer.signupDate)],
          ['Paying since', customer.paidSince ? fmt(customer.paidSince) : 'In trial'],
          ['Churned on', fmt(customer.churnDate)],
          ['Last active', fmt(customer.lastActive)],
        ].map(([label, value]) => (
          <div key={label} className="flex justify-between py-2">
            <dt className="text-slate-500 dark:text-slate-400">{label}</dt>
            <dd className="font-medium text-slate-900 dark:text-white">{value}</dd>
          </div>
        ))}
      </dl>

      <h3 className="mt-6 text-sm font-semibold text-slate-900 dark:text-white">Recent activity</h3>
      <ol className="mt-3 space-y-3 border-l border-slate-200 pl-4 dark:border-slate-800">
        {activity.map((a, i) => (
          <li key={i} className="relative text-sm">
            <span
              className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-brand-500"
              aria-hidden="true"
            />
            <p className="text-slate-800 dark:text-slate-200">{a.text}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {format(a.date, 'MMM d, yyyy')}
            </p>
          </li>
        ))}
      </ol>

      <div className="mt-8 flex gap-3">
        <Button variant="secondary" onClick={copyEmail}>
          {copied ? 'Copied!' : 'Copy email'}
        </Button>
        <Button variant="ghost" onClick={onClose}>
          Close
        </Button>
      </div>
      <p className="sr-only" aria-live="polite">
        {copied ? 'Email copied to clipboard' : ''}
      </p>
    </Drawer>
  );
}
