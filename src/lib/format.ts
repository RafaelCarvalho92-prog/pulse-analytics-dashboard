const currency0 = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});
const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });
const integer = new Intl.NumberFormat('en-US');

export const formatCurrency = (value: number) => currency0.format(value);
export const formatCompactCurrency = (value: number) => `$${compact.format(value)}`;
export const formatNumber = (value: number) => integer.format(Math.round(value));
export const formatCompact = (value: number) => compact.format(value);
export const formatPercent = (value: number, digits = 1) => `${value.toFixed(digits)}%`;
export const formatDelta = (value: number) => `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;

export function formatKpi(kpi: { value: number; format: 'currency' | 'number' | 'percent' }) {
  if (kpi.format === 'currency') return formatCurrency(kpi.value);
  if (kpi.format === 'percent') return formatPercent(kpi.value, 2);
  return formatNumber(kpi.value);
}

/** Percentage change from `previous` to `current`; 0 when there is no baseline. */
export function percentChange(current: number, previous: number): number {
  if (previous === 0) return 0;
  return ((current - previous) / Math.abs(previous)) * 100;
}
