import type { CustomerStatus } from '../../data/types';

export const STATUS_LABEL: Record<CustomerStatus, string> = {
  active: 'Active',
  trial: 'Trial',
  past_due: 'Past due',
  churned: 'Churned',
};
