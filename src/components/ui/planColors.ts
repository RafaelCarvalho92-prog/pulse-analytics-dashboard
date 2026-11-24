import type { Plan } from '../../data/types';

/** Plans map to fixed categorical slots, so a plan keeps its color on every chart. */
export const PLAN_COLOR_VAR: Record<Plan, string> = {
  Starter: 'var(--series-1)',
  Growth: 'var(--series-2)',
  Enterprise: 'var(--series-3)',
};
