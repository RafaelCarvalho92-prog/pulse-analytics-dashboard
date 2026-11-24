import { describe, expect, it } from 'vitest';
import { buildOverview, buildRevenue } from './analytics';
import { generateDataset } from './generator';

const ds = generateDataset();

describe('buildRevenue', () => {
  it.each([
    ['7d', 7, 'day'],
    ['30d', 30, 'day'],
    ['12m', 12, 'month'],
  ] as const)('buckets the %s range into %i %s points', (range, points, granularity) => {
    const data = buildRevenue(ds, range);
    expect(data.series).toHaveLength(points);
    expect(data.granularity).toBe(granularity);
    expect(data.to).toBe(ds.asOf);
  });

  it('uses weekly buckets for 90 days and keeps totals consistent with the KPI', () => {
    const data = buildRevenue(ds, '90d');
    expect(data.granularity).toBe('week');
    const revenueKpi = data.kpis.find((k) => k.id === 'revenue')!;
    expect(data.series.reduce((s, p) => s + p.revenue, 0)).toBe(revenueKpi.value);
    expect(revenueKpi.previous).toBeGreaterThan(0);
  });
});

describe('buildOverview', () => {
  it('returns 4 KPIs, 12 months of charts and a narrowing funnel', () => {
    const data = buildOverview(ds);
    expect(data.kpis.map((k) => k.id)).toEqual(['mrr', 'customers', 'dau', 'churn']);
    expect(data.revenueByMonth).toHaveLength(12);
    expect(data.mrrByPlan).toHaveLength(12);
    expect(data.activeUsers).toHaveLength(90);
    const values = data.funnel.map((s) => s.value);
    expect([...values].sort((a, b) => b - a)).toEqual(values);
  });
});
