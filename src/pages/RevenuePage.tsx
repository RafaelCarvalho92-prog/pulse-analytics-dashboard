import { format, parseISO } from 'date-fns';
import { useState } from 'react';
import { ChartCard, ChartSkeleton } from '../components/charts/ChartCard';
import { NewVsChurnedChart, RevenueAreaChart } from '../components/charts/charts';
import { PageHeader } from '../components/layout/PageHeader';
import { PlanBadge } from '../components/ui/Badge';
import { PLAN_COLOR_VAR } from '../components/ui/planColors';
import { KpiCard, KpiCardSkeleton } from '../components/ui/KpiCard';
import { Segmented } from '../components/ui/Segmented';
import { ErrorState, LoadingRegion } from '../components/ui/States';
import { api } from '../data/api';
import type { DateRange } from '../data/types';
import { useAsync } from '../hooks/useAsync';
import { cn } from '../lib/cn';
import { formatCurrency, formatPercent } from '../lib/format';

const RANGES = [
  { value: '7d', label: '7d' },
  { value: '30d', label: '30d' },
  { value: '90d', label: '90d' },
  { value: '12m', label: '12m' },
] as const satisfies readonly { value: DateRange; label: string }[];

const RANGE_TEXT: Record<DateRange, string> = {
  '7d': 'previous 7 days',
  '30d': 'previous 30 days',
  '90d': 'previous 90 days',
  '12m': 'previous 12 months',
};

const GRANULARITY_TEXT = { day: 'Daily', week: 'Weekly', month: 'Monthly' } as const;

export default function RevenuePage() {
  const [range, setRange] = useState<DateRange>('30d');
  const { status, data, error, retry } = useAsync(() => api.getRevenue(range), [range]);
  const refreshing = status === 'loading' && !!data;

  const planTotal = data ? data.revenueByPlan.reduce((s, p) => s + p.revenue, 0) : 0;

  return (
    <>
      <PageHeader
        title="Revenue"
        description={
          data
            ? `${format(parseISO(data.from), 'MMM d, yyyy')} - ${format(parseISO(data.to), 'MMM d, yyyy')}`
            : 'Revenue, expansion and churn over time'
        }
        actions={
          <Segmented label="Date range" value={range} options={RANGES} onChange={setRange} />
        }
      />

      {status === 'error' ? (
        <ErrorState message={error.message} onRetry={retry} />
      ) : !data ? (
        <LoadingRegion label="Loading revenue">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => (
              <KpiCardSkeleton key={i} />
            ))}
          </div>
          <div className="mt-4">
            <ChartSkeleton />
          </div>
        </LoadingRegion>
      ) : (
        <div
          className={cn('space-y-4 transition-opacity', refreshing && 'opacity-60')}
          aria-busy={refreshing}
        >
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {data.kpis.map((kpi) => (
              <KpiCard key={kpi.id} kpi={kpi} comparisonLabel={`vs ${RANGE_TEXT[data.range]}`} />
            ))}
          </div>

          <ChartCard
            title="Revenue over time"
            description={`${GRANULARITY_TEXT[data.granularity]} recognised revenue`}
          >
            <RevenueAreaChart data={data.series} height={320} />
          </ChartCard>

          <div className="grid gap-4 lg:grid-cols-3">
            <ChartCard
              className="lg:col-span-2"
              title="New vs churned MRR"
              description={`${GRANULARITY_TEXT[data.granularity]} MRR movements`}
            >
              <NewVsChurnedChart data={data.series} />
            </ChartCard>

            <ChartCard title="Revenue by plan" description="Share of revenue in the selected range">
              <ul className="space-y-4">
                {data.revenueByPlan.map((p) => {
                  const share = planTotal ? (p.revenue / planTotal) * 100 : 0;
                  return (
                    <li key={p.plan}>
                      <div className="mb-1 flex items-baseline justify-between text-sm">
                        <PlanBadge plan={p.plan} />
                        <span className="tabular-nums text-slate-900 dark:text-white">
                          {formatCurrency(p.revenue)}{' '}
                          <span className="text-slate-500 dark:text-slate-400">
                            ({formatPercent(share)})
                          </span>
                        </span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${share}%`, background: PLAN_COLOR_VAR[p.plan] }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>

              <h3 className="mb-2 mt-8 text-sm font-semibold text-slate-900 dark:text-white">
                Top accounts by MRR
              </h3>
              <ol className="divide-y divide-slate-100 text-sm dark:divide-slate-800">
                {data.topCustomers.map((c, i) => (
                  <li key={c.id} className="flex items-center gap-3 py-2">
                    <span className="w-4 text-slate-400">{i + 1}</span>
                    <span className="flex-1 truncate text-slate-800 dark:text-slate-200">
                      {c.company}
                    </span>
                    <span className="font-medium tabular-nums text-slate-900 dark:text-white">
                      {formatCurrency(c.mrr)}
                    </span>
                  </li>
                ))}
              </ol>
            </ChartCard>
          </div>
        </div>
      )}
    </>
  );
}
