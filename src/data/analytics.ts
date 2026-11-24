import { format, parseISO, startOfMonth, startOfWeek, subMonths } from 'date-fns';
import type {
  DailyMetric,
  Dataset,
  DateRange,
  FunnelStage,
  Kpi,
  OverviewData,
  PlanRecord,
  RevenueData,
  RevenuePoint,
} from './types';
import { PLANS } from './types';

const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);
const avg = (values: number[]) => (values.length ? sum(values) / values.length : 0);

/** Groups consecutive daily rows by a key while preserving order. */
export function groupBy<T>(rows: T[], key: (row: T) => string): { key: string; rows: T[] }[] {
  const groups: { key: string; rows: T[] }[] = [];
  for (const row of rows) {
    const k = key(row);
    const last = groups[groups.length - 1];
    if (last && last.key === k) last.rows.push(row);
    else groups.push({ key: k, rows: [row] });
  }
  return groups;
}

const monthKey = (d: DailyMetric) => d.date.slice(0, 7);
const monthLabel = (key: string) => format(parseISO(`${key}-01`), 'MMM yy');

export function buildOverview(ds: Dataset): OverviewData {
  const d = ds.daily;
  const last = d[d.length - 1];
  const monthAgo = d[d.length - 31];
  if (!last || !monthAgo) throw new Error('Dataset needs at least 31 days of history');

  const last30 = d.slice(-30);
  const prev30 = d.slice(-60, -30);
  const churnRate = (rows: DailyMetric[]) => {
    const base = rows[0]?.payingCustomers ?? 0;
    return base ? (sum(rows.map((r) => r.churnedCustomers)) / base) * 100 : 0;
  };

  const kpis: Kpi[] = [
    {
      id: 'mrr',
      label: 'Monthly recurring revenue',
      value: last.mrr,
      previous: monthAgo.mrr,
      format: 'currency',
      spark: last30.map((r) => r.mrr),
    },
    {
      id: 'customers',
      label: 'Paying customers',
      value: last.payingCustomers,
      previous: monthAgo.payingCustomers,
      format: 'number',
      spark: last30.map((r) => r.payingCustomers),
    },
    {
      id: 'dau',
      label: 'Avg. daily active users',
      value: Math.round(avg(last30.map((r) => r.activeUsers))),
      previous: Math.round(avg(prev30.map((r) => r.activeUsers))),
      format: 'number',
      spark: last30.map((r) => r.activeUsers),
    },
    {
      id: 'churn',
      label: 'Customer churn (30d)',
      value: churnRate(last30),
      previous: churnRate(prev30),
      format: 'percent',
      invert: true,
      spark: last30.map((r) => r.churnedCustomers),
    },
  ];

  const months = groupBy(d, monthKey).slice(-12);
  const visitors = sum(last30.map((r) => r.visitors));
  const signups = sum(last30.map((r) => r.signups));
  const funnel: FunnelStage[] = [
    { stage: 'Visitors', value: visitors },
    { stage: 'Sign-ups', value: signups },
    { stage: 'Activated trials', value: Math.round(signups * 0.36) },
    { stage: 'Paid conversions', value: sum(last30.map((r) => r.newCustomers)) },
  ];

  return {
    asOf: ds.asOf,
    kpis,
    revenueByMonth: months.map((m) => ({
      label: monthLabel(m.key),
      revenue: sum(m.rows.map((r) => r.revenue)),
    })),
    mrrByPlan: months.map((m) => {
      const end = m.rows[m.rows.length - 1];
      return {
        label: monthLabel(m.key),
        ...(end?.mrrByPlan ?? { Starter: 0, Growth: 0, Enterprise: 0 }),
      };
    }),
    activeUsers: d.slice(-90).map((r) => ({ date: r.date, activeUsers: r.activeUsers })),
    funnel,
  };
}

const RANGE_DAYS: Record<Exclude<DateRange, '12m'>, number> = { '7d': 7, '30d': 30, '90d': 90 };

/** Splits the daily series into the selected range and the equally long period before it. */
export function sliceRange(daily: DailyMetric[], range: DateRange, asOf: string) {
  if (range === '12m') {
    const from = format(startOfMonth(subMonths(parseISO(asOf), 11)), 'yyyy-MM-dd');
    const prevFrom = format(startOfMonth(subMonths(parseISO(asOf), 23)), 'yyyy-MM-dd');
    return {
      current: daily.filter((r) => r.date >= from),
      previous: daily.filter((r) => r.date >= prevFrom && r.date < from),
    };
  }
  const n = RANGE_DAYS[range];
  return { current: daily.slice(-n), previous: daily.slice(-2 * n, -n) };
}

export function buildRevenue(ds: Dataset, range: DateRange): RevenueData {
  const { current, previous } = sliceRange(ds.daily, range, ds.asOf);
  const granularity = range === '12m' ? 'month' : range === '90d' ? 'week' : 'day';

  const bucketKey = (r: DailyMetric) =>
    granularity === 'month'
      ? monthKey(r)
      : granularity === 'week'
        ? format(startOfWeek(parseISO(r.date), { weekStartsOn: 1 }), 'yyyy-MM-dd')
        : r.date;
  const bucketLabel = (key: string) =>
    granularity === 'month' ? monthLabel(key) : format(parseISO(key), 'MMM d');

  const series: RevenuePoint[] = groupBy(current, bucketKey).map((g) => ({
    label: bucketLabel(g.key),
    revenue: sum(g.rows.map((r) => r.revenue)),
    newMrr: sum(g.rows.map((r) => r.newMrr)),
    churnedMrr: sum(g.rows.map((r) => r.churnedMrr)),
  }));

  const total = (rows: DailyMetric[], f: (r: DailyMetric) => number) => sum(rows.map(f));
  const arpa = (rows: DailyMetric[]) => {
    const end = rows[rows.length - 1];
    return end && end.payingCustomers ? end.mrr / end.payingCustomers : 0;
  };

  const kpis: Kpi[] = [
    {
      id: 'revenue',
      label: 'Revenue',
      value: total(current, (r) => r.revenue),
      previous: total(previous, (r) => r.revenue),
      format: 'currency',
      spark: series.map((s) => s.revenue),
    },
    {
      id: 'new-mrr',
      label: 'New MRR',
      value: total(current, (r) => r.newMrr),
      previous: total(previous, (r) => r.newMrr),
      format: 'currency',
      spark: series.map((s) => s.newMrr),
    },
    {
      id: 'churned-mrr',
      label: 'Churned MRR',
      value: total(current, (r) => r.churnedMrr),
      previous: total(previous, (r) => r.churnedMrr),
      format: 'currency',
      invert: true,
      spark: series.map((s) => s.churnedMrr),
    },
    {
      id: 'arpa',
      label: 'Avg. revenue per account',
      value: arpa(current),
      previous: arpa(previous),
      format: 'currency',
      spark: [],
    },
  ];

  const byPlan: PlanRecord = { Starter: 0, Growth: 0, Enterprise: 0 };
  for (const r of current) {
    if (!r.mrr) continue;
    for (const p of PLANS) byPlan[p] += (r.revenue * r.mrrByPlan[p]) / r.mrr;
  }

  const topCustomers = ds.customers
    .filter((c) => c.status === 'active' || c.status === 'past_due')
    .sort((a, b) => b.mrr - a.mrr)
    .slice(0, 5)
    .map(({ id, company, plan, mrr }) => ({ id, company, plan, mrr }));

  return {
    range,
    from: current[0]?.date ?? ds.asOf,
    to: current[current.length - 1]?.date ?? ds.asOf,
    granularity,
    kpis,
    series,
    revenueByPlan: PLANS.map((plan) => ({ plan, revenue: Math.round(byPlan[plan]) })),
    topCustomers,
  };
}
