import { describe, expect, it } from 'vitest';
import { generateDataset, HISTORY_DAYS } from './generator';

describe('generateDataset', () => {
  const ds = generateDataset();

  it('is deterministic for a given seed and varies across seeds', () => {
    expect(generateDataset()).toEqual(ds);
    const other = generateDataset({ seed: 42 });
    expect(other.customers[0]).not.toEqual(ds.customers[0]);
  });

  it('creates 500 customers with unique ids and consistent lifecycle fields', () => {
    expect(ds.customers).toHaveLength(500);
    expect(new Set(ds.customers.map((c) => c.id)).size).toBe(500);
    for (const c of ds.customers) {
      expect(c.mrr).toBeGreaterThan(0);
      expect(c.signupDate <= ds.asOf).toBe(true);
      if (c.status === 'trial') expect(c.paidSince).toBeNull();
      if (c.status === 'churned') {
        expect(c.churnDate).not.toBeNull();
        expect(c.churnDate! > c.paidSince!).toBe(true);
        expect(c.churnDate! <= ds.asOf).toBe(true);
      } else {
        expect(c.churnDate).toBeNull();
      }
    }
  });

  it('produces two years of daily metrics ending on the as-of date', () => {
    expect(ds.daily).toHaveLength(HISTORY_DAYS);
    expect(ds.daily[ds.daily.length - 1]?.date).toBe(ds.asOf);
  });

  it('reconciles final MRR and paying customers with the customer list', () => {
    const paying = ds.customers.filter((c) => c.status === 'active' || c.status === 'past_due');
    const last = ds.daily[ds.daily.length - 1]!;
    expect(last.mrr).toBe(paying.reduce((s, c) => s + c.mrr, 0));
    expect(last.payingCustomers).toBe(paying.length);
    expect(last.mrrByPlan.Starter + last.mrrByPlan.Growth + last.mrrByPlan.Enterprise).toBe(
      last.mrr,
    );
  });
});
