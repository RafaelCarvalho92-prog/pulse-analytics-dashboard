import { useCallback, useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { ErrorState, LoadingRegion, Skeleton } from '../components/ui/States';
import { api } from '../data/api';
import type { Customer } from '../data/types';
import { CustomerDrawer } from '../features/customers/CustomerDrawer';
import { CustomersTable } from '../features/customers/CustomersTable';
import { useAsync } from '../hooks/useAsync';
import { formatNumber } from '../lib/format';

export default function CustomersPage() {
  const { status, data, error, retry } = useAsync(() => api.getCustomers(), []);
  const [selected, setSelected] = useState<Customer | null>(null);
  const onSelect = useCallback((c: Customer) => setSelected(c), []);

  return (
    <>
      <PageHeader
        title="Customers"
        description={
          data
            ? `${formatNumber(data.length)} accounts across all plans. Select a row for details.`
            : 'All accounts across all plans'
        }
      />
      {status === 'error' ? (
        <ErrorState message={error.message} onRetry={retry} />
      ) : !data ? (
        <LoadingRegion label="Loading customers">
          <div className="card space-y-3 p-4">
            <Skeleton className="h-10 w-full" />
            {Array.from({ length: 8 }, (_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </LoadingRegion>
      ) : (
        <CustomersTable customers={data} onSelect={onSelect} />
      )}
      <CustomerDrawer customer={selected} onClose={() => setSelected(null)} />
    </>
  );
}
