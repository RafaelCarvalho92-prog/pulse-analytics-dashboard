import { addDays, differenceInCalendarDays, format, parseISO } from 'date-fns';
import { createRng } from '../lib/random';
import type { Customer, CustomerStatus, DailyMetric, Dataset, Plan, PlanRecord } from './types';
import { PLANS } from './types';

export const DEFAULT_SEED = 20261031;
export const DATA_AS_OF = '2026-10-31';
/** Two years of history so every range (incl. 12m) has a previous period to compare against. */
export const HISTORY_DAYS = 730;
export const TRIAL_DAYS = 14;

const FIRST_NAMES = [
  'Ava',
  'Liam',
  'Mia',
  'Noah',
  'Zoe',
  'Ethan',
  'Isla',
  'Lucas',
  'Chloe',
  'Mateo',
  'Nora',
  'Leo',
  'Aria',
  'Hugo',
  'Maya',
  'Omar',
  'Lena',
  'Kai',
  'Elena',
  'Theo',
  'Sofia',
  'Ivan',
  'Priya',
  'Jonas',
  'Amara',
  'Diego',
  'Yuki',
  'Felix',
  'Hana',
  'Rafael',
  'Clara',
  'Samir',
] as const;
const LAST_NAMES = [
  'Silva',
  'Novak',
  'Bennett',
  'Okafor',
  'Larsen',
  'Moreau',
  'Tanaka',
  'Rossi',
  'Kowalski',
  'Haddad',
  'Fischer',
  'Costa',
  'Nguyen',
  'Murphy',
  'Schmidt',
  'Patel',
  'Alvarez',
  'Berg',
  'Ito',
  'Dubois',
  'Reyes',
  'Walsh',
  'Kim',
  'Andersen',
] as const;
const COMPANY_PREFIX = [
  'Nimbus',
  'Vertex',
  'Lumen',
  'Quanta',
  'Atlas',
  'Orbit',
  'Cobalt',
  'Helix',
  'Nova',
  'Ember',
  'Pioneer',
  'Summit',
  'Harbor',
  'Kite',
  'Mosaic',
  'Polar',
  'Cedar',
  'Signal',
  'Arc',
  'Tidal',
] as const;
const COMPANY_SUFFIX = [
  'Labs',
  'Systems',
  'Works',
  'Cloud',
  'AI',
  'Health',
  'Logistics',
  'Studio',
  'Pay',
  'Data',
] as const;
const INDUSTRIES = [
  'Fintech',
  'E-commerce',
  'Healthcare',
  'Education',
  'Logistics',
  'Media',
  'SaaS',
  'Real estate',
] as const;
const COUNTRIES = [
  ['United States', 34],
  ['United Kingdom', 10],
  ['Germany', 9],
  ['Brazil', 8],
  ['Canada', 7],
  ['France', 6],
  ['Netherlands', 5],
  ['Australia', 5],
  ['Portugal', 4],
  ['Japan', 4],
  ['India', 4],
  ['Spain', 4],
] as const;

const PLAN_WEIGHTS = [
  ['Starter', 55],
  ['Growth', 32],
  ['Enterprise', 13],
] as const;
const PLAN_PRICING: Record<Plan, { perSeat: number; seats: [number, number] }> = {
  Starter: { perSeat: 29, seats: [1, 5] },
  Growth: { perSeat: 49, seats: [5, 40] },
  Enterprise: { perSeat: 79, seats: [25, 150] },
};

const iso = (d: Date) => format(d, 'yyyy-MM-dd');
const emptyPlanRecord = (): PlanRecord => ({ Starter: 0, Growth: 0, Enterprise: 0 });
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '');

export interface GeneratorOptions {
  seed?: number;
  customerCount?: number;
  asOf?: string;
}

/**
 * Builds a deterministic dataset: customers first, then daily metrics derived from them
 * (so MRR, new and churned figures always reconcile with the customer list).
 */
export function generateDataset(options: GeneratorOptions = {}): Dataset {
  const { seed = DEFAULT_SEED, customerCount = 500, asOf = DATA_AS_OF } = options;
  const rng = createRng(seed);
  const end = parseISO(asOf);
  const start = addDays(end, -(HISTORY_DAYS - 1));
  const dayIndex = (d: Date) => differenceInCalendarDays(d, start);

  // ---- Customers --------------------------------------------------------------------------
  const customers: Customer[] = [];
  for (let i = 0; i < customerCount; i++) {
    const first = rng.pick(FIRST_NAMES);
    const last = rng.pick(LAST_NAMES);
    const company = `${rng.pick(COMPANY_PREFIX)} ${rng.pick(COMPANY_SUFFIX)}`;
    const plan = rng.weighted(PLAN_WEIGHTS);
    const pricing = PLAN_PRICING[plan];
    const seats = rng.int(pricing.seats[0], pricing.seats[1]);
    const mrr = seats * pricing.perSeat;

    // A power curve skews sign-ups toward recent dates, giving the business a growth curve.
    const daysAgo = Math.floor((HISTORY_DAYS - 1) * (1 - Math.pow(rng.next(), 0.7)));
    const signup = addDays(end, -daysAgo);
    const paidStart = addDays(signup, TRIAL_DAYS);
    const inTrial = paidStart > end;

    let status: CustomerStatus = 'active';
    let churn: Date | null = null;
    const churnChance = plan === 'Enterprise' ? 0.06 : plan === 'Growth' ? 0.12 : 0.2;
    if (inTrial) {
      status = 'trial';
    } else if (differenceInCalendarDays(end, paidStart) >= 1 && rng.next() < churnChance) {
      churn = addDays(paidStart, rng.int(1, differenceInCalendarDays(end, paidStart)));
      status = 'churned';
    } else if (rng.next() < 0.05) {
      status = 'past_due';
    }

    const lastActive = churn ?? addDays(end, -rng.int(0, status === 'past_due' ? 30 : 12));
    const healthBase = status === 'churned' ? 20 : status === 'past_due' ? 45 : 70;

    customers.push({
      id: `cus_${String(i + 1).padStart(4, '0')}`,
      name: `${first} ${last}`,
      email: `${slug(first)}.${slug(last)}@${slug(company)}.example`,
      company,
      industry: rng.pick(INDUSTRIES),
      country: rng.weighted(COUNTRIES),
      plan,
      status,
      seats,
      mrr,
      signupDate: iso(signup),
      paidSince: inTrial ? null : iso(paidStart),
      churnDate: churn ? iso(churn) : null,
      lastActive: iso(lastActive),
      healthScore: Math.max(1, Math.min(100, Math.round(healthBase + rng.noise() * 25))),
    });
  }

  // ---- Daily metrics (difference arrays keep this O(customers + days)) ---------------------
  const mrrDelta = PLANS.reduce(
    (acc, p) => ({ ...acc, [p]: new Array<number>(HISTORY_DAYS + 1).fill(0) }),
    {} as Record<Plan, number[]>,
  );
  const payingDelta = new Array<number>(HISTORY_DAYS + 1).fill(0);
  const seatDelta = new Array<number>(HISTORY_DAYS + 1).fill(0);
  const newMrr = new Array<number>(HISTORY_DAYS).fill(0);
  const churnedMrr = new Array<number>(HISTORY_DAYS).fill(0);
  const newCustomers = new Array<number>(HISTORY_DAYS).fill(0);
  const churnedCustomers = new Array<number>(HISTORY_DAYS).fill(0);
  const add = (arr: number[], idx: number, v: number) => {
    if (idx >= 0 && idx < arr.length) arr[idx] = (arr[idx] ?? 0) + v;
  };

  for (const c of customers) {
    const seatsFrom = Math.max(0, dayIndex(parseISO(c.signupDate)));
    const churnIdx = c.churnDate ? dayIndex(parseISO(c.churnDate)) : HISTORY_DAYS;
    add(seatDelta, seatsFrom, c.seats);
    add(seatDelta, churnIdx, -c.seats);
    if (!c.paidSince) continue;
    const paidIdx = dayIndex(parseISO(c.paidSince));
    const from = Math.max(0, paidIdx);
    add(mrrDelta[c.plan], from, c.mrr);
    add(mrrDelta[c.plan], churnIdx, -c.mrr);
    add(payingDelta, from, 1);
    add(payingDelta, churnIdx, -1);
    add(newMrr, paidIdx, c.mrr);
    add(newCustomers, paidIdx, 1);
    if (c.churnDate) {
      add(churnedMrr, churnIdx, c.mrr);
      add(churnedCustomers, churnIdx, 1);
    }
  }

  const daily: DailyMetric[] = [];
  const running = emptyPlanRecord();
  let paying = 0;
  let seatsActive = 0;
  for (let i = 0; i < HISTORY_DAYS; i++) {
    const date = addDays(start, i);
    for (const p of PLANS) running[p] += mrrDelta[p][i] ?? 0;
    paying += payingDelta[i] ?? 0;
    seatsActive += seatDelta[i] ?? 0;

    const weekday = date.getDay();
    const isWeekend = weekday === 0 || weekday === 6;
    const mrr = running.Starter + running.Growth + running.Enterprise;
    const growth = 1 + i / HISTORY_DAYS; // traffic roughly doubles over two years
    const visitors = Math.round(2400 * growth * (isWeekend ? 0.62 : 1) * (1 + rng.noise() * 0.12));

    daily.push({
      date: iso(date),
      revenue: Math.round((mrr / 30) * (1 + rng.noise() * 0.06)),
      mrr,
      mrrByPlan: { ...running },
      newMrr: newMrr[i] ?? 0,
      churnedMrr: churnedMrr[i] ?? 0,
      newCustomers: newCustomers[i] ?? 0,
      churnedCustomers: churnedCustomers[i] ?? 0,
      payingCustomers: paying,
      activeUsers: Math.round(seatsActive * (isWeekend ? 0.34 : 0.71) * (1 + rng.noise() * 0.07)),
      visitors,
      signups: Math.round(visitors * (0.028 + rng.noise() * 0.004)),
    });
  }

  return { asOf, customers, daily };
}

let cached: Dataset | null = null;

/** Lazily generated, memoised default dataset shared by the fake API. */
export function getDataset(): Dataset {
  cached ??= generateDataset();
  return cached;
}
