import { buildOverview, buildRevenue } from './analytics';
import { getDataset } from './generator';
import type { Customer, DateRange, OverviewData, Profile, RevenueData } from './types';

/**
 * A tiny fake REST layer. Every call resolves after a simulated network delay and can be
 * forced to fail (Settings -> "Simulate API errors") to exercise error states in the UI.
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status = 500,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const config = {
  minLatency: 350,
  maxLatency: 900,
  failRequests: false,
};

export function configureApi(next: Partial<typeof config>) {
  Object.assign(config, next);
}

function request<T>(resolver: () => T): Promise<T> {
  const latency = config.minLatency + Math.random() * (config.maxLatency - config.minLatency);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (config.failRequests) {
        reject(new ApiError('The server returned an error (simulated). Please try again.', 503));
        return;
      }
      try {
        resolve(resolver());
      } catch (err) {
        reject(err instanceof Error ? err : new ApiError(String(err)));
      }
    }, latency);
  });
}

export const api = {
  getOverview: (): Promise<OverviewData> => request(() => buildOverview(getDataset())),
  getRevenue: (range: DateRange): Promise<RevenueData> =>
    request(() => buildRevenue(getDataset(), range)),
  getCustomers: (): Promise<Customer[]> => request(() => getDataset().customers),
  getCustomer: (id: string): Promise<Customer> =>
    request(() => {
      const customer = getDataset().customers.find((c) => c.id === id);
      if (!customer) throw new ApiError(`Customer ${id} not found`, 404);
      return customer;
    }),
  updateProfile: (profile: Profile): Promise<Profile> => request(() => ({ ...profile })),
};
