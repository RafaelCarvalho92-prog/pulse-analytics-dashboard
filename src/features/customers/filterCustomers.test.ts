import { describe, expect, it } from 'vitest';
import type { Customer } from '../../data/types';
import { DEFAULT_FILTERS, filterCustomers } from './filterCustomers';

const base: Customer = {
  id: 'cus_0001',
  name: 'Ava Silva',
  email: 'ava.silva@nimbuslabs.example',
  company: 'Nimbus Labs',
  industry: 'SaaS',
  country: 'Brazil',
  plan: 'Starter',
  status: 'active',
  seats: 3,
  mrr: 87,
  signupDate: '2026-01-01',
  paidSince: '2026-01-15',
  churnDate: null,
  lastActive: '2026-10-30',
  healthScore: 80,
};

const customers: Customer[] = [
  base,
  {
    ...base,
    id: 'cus_0002',
    name: 'Liam Novak',
    company: 'Vertex AI',
    email: 'liam@vertexai.example',
    plan: 'Growth',
    status: 'trial',
  },
  {
    ...base,
    id: 'cus_0003',
    name: 'José Álvarez',
    company: 'Atlas Pay',
    email: 'jose@atlaspay.example',
    plan: 'Enterprise',
    status: 'churned',
  },
];

describe('filterCustomers', () => {
  it('returns everything with default filters', () => {
    expect(filterCustomers(customers, DEFAULT_FILTERS)).toHaveLength(3);
  });

  it('searches name, company, email and id case-insensitively with multiple terms', () => {
    const ids = (q: string) =>
      filterCustomers(customers, { ...DEFAULT_FILTERS, query: q }).map((c) => c.id);
    expect(ids('VERTEX')).toEqual(['cus_0002']);
    expect(ids('nimbus ava')).toEqual(['cus_0001']);
    expect(ids('cus_0003')).toEqual(['cus_0003']);
    expect(ids('nobody')).toEqual([]);
  });

  it('ignores accents in the search query and data', () => {
    expect(filterCustomers(customers, { ...DEFAULT_FILTERS, query: 'jose alvarez' })).toHaveLength(
      1,
    );
  });

  it('combines status and plan filters with the search', () => {
    expect(filterCustomers(customers, { query: '', status: 'trial', plan: 'all' })).toHaveLength(1);
    expect(
      filterCustomers(customers, { query: '', status: 'all', plan: 'Enterprise' })[0]?.id,
    ).toBe('cus_0003');
    expect(
      filterCustomers(customers, { query: 'ava', status: 'churned', plan: 'all' }),
    ).toHaveLength(0);
  });
});
