import type { Customer, CustomerStatus, Plan } from '../../data/types';

export interface CustomerFilters {
  query: string;
  status: CustomerStatus | 'all';
  plan: Plan | 'all';
}

export const DEFAULT_FILTERS: CustomerFilters = { query: '', status: 'all', plan: 'all' };

/**
 * Pure filtering logic, kept outside the table so it is trivially unit-testable.
 * The search matches name, company, email and id (case- and accent-insensitive).
 */
export function filterCustomers(
  customers: readonly Customer[],
  filters: CustomerFilters,
): Customer[] {
  // Strip combining diacritical marks (U+0300-U+036F) after NFD decomposition.
  const normalize = (s: string) =>
    s
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase();
  const terms = normalize(filters.query.trim()).split(/\s+/).filter(Boolean);

  return customers.filter((c) => {
    if (filters.status !== 'all' && c.status !== filters.status) return false;
    if (filters.plan !== 'all' && c.plan !== filters.plan) return false;
    if (!terms.length) return true;
    const haystack = normalize(`${c.name} ${c.company} ${c.email} ${c.id}`);
    return terms.every((t) => haystack.includes(t));
  });
}
