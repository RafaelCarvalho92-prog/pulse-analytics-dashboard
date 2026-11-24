export const PLANS = ['Starter', 'Growth', 'Enterprise'] as const;
export type Plan = (typeof PLANS)[number];

export const CUSTOMER_STATUSES = ['active', 'trial', 'past_due', 'churned'] as const;
export type CustomerStatus = (typeof CUSTOMER_STATUSES)[number];

export interface Customer {
  id: string;
  name: string;
  email: string;
  company: string;
  industry: string;
  country: string;
  plan: Plan;
  status: CustomerStatus;
  seats: number;
  /** Monthly recurring revenue in USD (list price for trials). */
  mrr: number;
  /** ISO date (yyyy-MM-dd). */
  signupDate: string;
  /** ISO date the account started paying (signup + trial). */
  paidSince: string | null;
  /** ISO date the account churned, if it did. */
  churnDate: string | null;
  /** ISO date of the last product activity. */
  lastActive: string;
  /** 0-100 product engagement score. */
  healthScore: number;
}

export type PlanRecord = Record<Plan, number>;

export interface DailyMetric {
  /** ISO date (yyyy-MM-dd). */
  date: string;
  revenue: number;
  mrr: number;
  mrrByPlan: PlanRecord;
  newMrr: number;
  churnedMrr: number;
  newCustomers: number;
  churnedCustomers: number;
  payingCustomers: number;
  activeUsers: number;
  visitors: number;
  signups: number;
}

export interface Dataset {
  asOf: string;
  customers: Customer[];
  daily: DailyMetric[];
}

export type DateRange = '7d' | '30d' | '90d' | '12m';

export interface Kpi {
  id: string;
  label: string;
  value: number;
  previous: number;
  format: 'currency' | 'number' | 'percent';
  /** When true, a decrease is good (e.g. churn). */
  invert?: boolean;
  spark: number[];
}

export interface FunnelStage {
  stage: string;
  value: number;
}

export interface OverviewData {
  asOf: string;
  kpis: Kpi[];
  revenueByMonth: { label: string; revenue: number }[];
  mrrByPlan: ({ label: string } & PlanRecord)[];
  activeUsers: { date: string; activeUsers: number }[];
  funnel: FunnelStage[];
}

export interface RevenuePoint {
  label: string;
  revenue: number;
  newMrr: number;
  churnedMrr: number;
}

export interface RevenueData {
  range: DateRange;
  from: string;
  to: string;
  granularity: 'day' | 'week' | 'month';
  kpis: Kpi[];
  series: RevenuePoint[];
  revenueByPlan: { plan: Plan; revenue: number }[];
  topCustomers: Pick<Customer, 'id' | 'company' | 'plan' | 'mrr'>[];
}

export interface Profile {
  fullName: string;
  email: string;
  company: string;
  role: 'Founder' | 'Product' | 'Engineering' | 'Marketing' | 'Finance';
  website: string;
  bio: string;
  weeklyDigest: boolean;
}
