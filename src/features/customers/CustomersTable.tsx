import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type PaginationState,
  type SortingState,
} from '@tanstack/react-table';
import { format, parseISO } from 'date-fns';
import { useId, useMemo, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { PlanBadge, StatusBadge } from '../../components/ui/Badge';
import { Icon } from '../../components/ui/Icon';
import { EmptyState } from '../../components/ui/States';
import { CUSTOMER_STATUSES, PLANS, type Customer } from '../../data/types';
import { downloadCsv, toCsv } from '../../lib/csv';
import { cn } from '../../lib/cn';
import { formatCurrency, formatNumber } from '../../lib/format';
import { DEFAULT_FILTERS, filterCustomers, type CustomerFilters } from './filterCustomers';
import { STATUS_LABEL } from './labels';

const col = createColumnHelper<Customer>();
const shortDate = (iso: string) => format(parseISO(iso), 'MMM d, yyyy');

interface CustomersTableProps {
  customers: Customer[];
  onSelect: (customer: Customer) => void;
}

export function CustomersTable({ customers, onSelect }: CustomersTableProps) {
  const [filters, setFilters] = useState<CustomerFilters>(DEFAULT_FILTERS);
  const [sorting, setSorting] = useState<SortingState>([{ id: 'mrr', desc: true }]);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const ids = { search: useId(), status: useId(), plan: useId(), size: useId() };

  const filtered = useMemo(() => filterCustomers(customers, filters), [customers, filters]);

  const columns = useMemo(
    () => [
      col.accessor('name', {
        header: 'Customer',
        cell: (info) => (
          <div className="min-w-[12rem]">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(info.row.original);
              }}
              className="rounded text-left font-medium text-slate-900 hover:text-brand-600 dark:text-white dark:hover:text-brand-300"
            >
              {info.getValue()}
            </button>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {info.row.original.company}
            </p>
          </div>
        ),
      }),
      col.accessor('status', {
        header: 'Status',
        cell: (info) => <StatusBadge status={info.getValue()} />,
      }),
      col.accessor('plan', {
        header: 'Plan',
        cell: (info) => <PlanBadge plan={info.getValue()} />,
      }),
      col.accessor('mrr', {
        header: 'MRR',
        cell: (info) => <span className="tabular-nums">{formatCurrency(info.getValue())}</span>,
        meta: { align: 'right' },
      }),
      col.accessor('seats', {
        header: 'Seats',
        cell: (info) => <span className="tabular-nums">{formatNumber(info.getValue())}</span>,
        meta: { align: 'right' },
      }),
      col.accessor('country', { header: 'Country' }),
      col.accessor('signupDate', {
        header: 'Signed up',
        cell: (info) => <span className="whitespace-nowrap">{shortDate(info.getValue())}</span>,
      }),
    ],
    [onSelect],
  );

  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const updateFilters = (patch: Partial<CustomerFilters>) => {
    setFilters((f) => ({ ...f, ...patch }));
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  };

  const exportCsv = () => {
    const rows = table.getSortedRowModel().rows.map((r) => r.original);
    const csv = toCsv(rows, [
      { header: 'ID', value: (c) => c.id },
      { header: 'Name', value: (c) => c.name },
      { header: 'Email', value: (c) => c.email },
      { header: 'Company', value: (c) => c.company },
      { header: 'Status', value: (c) => STATUS_LABEL[c.status] },
      { header: 'Plan', value: (c) => c.plan },
      { header: 'MRR (USD)', value: (c) => c.mrr },
      { header: 'Seats', value: (c) => c.seats },
      { header: 'Country', value: (c) => c.country },
      { header: 'Signed up', value: (c) => c.signupDate },
    ]);
    downloadCsv(`pulse-customers-${rows.length}.csv`, csv);
  };

  const { pageIndex, pageSize } = table.getState().pagination;
  const total = filtered.length;
  const firstRow = total ? pageIndex * pageSize + 1 : 0;
  const lastRow = Math.min(total, (pageIndex + 1) * pageSize);
  const hasFilters = filters.query !== '' || filters.status !== 'all' || filters.plan !== 'all';

  return (
    <div className="card overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 border-b border-slate-200 p-4 dark:border-slate-800 md:flex-row md:items-end">
        <div className="relative flex-1">
          <label htmlFor={ids.search} className="label">
            Search
          </label>
          <Icon
            name="search"
            className="pointer-events-none absolute bottom-2.5 left-3 h-4 w-4 text-slate-400"
          />
          <input
            id={ids.search}
            type="search"
            className="input pl-9"
            placeholder="Name, company, email or ID"
            value={filters.query}
            onChange={(e) => updateFilters({ query: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-3 md:flex">
          <div>
            <label htmlFor={ids.status} className="label">
              Status
            </label>
            <select
              id={ids.status}
              className="input md:w-36"
              value={filters.status}
              onChange={(e) =>
                updateFilters({ status: e.target.value as CustomerFilters['status'] })
              }
            >
              <option value="all">All statuses</option>
              {CUSTOMER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor={ids.plan} className="label">
              Plan
            </label>
            <select
              id={ids.plan}
              className="input md:w-36"
              value={filters.plan}
              onChange={(e) => updateFilters({ plan: e.target.value as CustomerFilters['plan'] })}
            >
              <option value="all">All plans</option>
              {PLANS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>
        <Button variant="secondary" onClick={exportCsv} disabled={!total}>
          <Icon name="download" className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <p className="sr-only" aria-live="polite">
        {total} customers match the current filters.
      </p>

      {total === 0 ? (
        <EmptyState
          title="No customers found"
          description="Try a different search term or clear the filters."
          action={
            hasFilters && (
              <Button variant="secondary" size="sm" onClick={() => updateFilters(DEFAULT_FILTERS)}>
                Clear filters
              </Button>
            )
          }
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">
              Customers, sortable by column. Select a customer name to open details.
            </caption>
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((header) => {
                    const sorted = header.column.getIsSorted();
                    const alignRight =
                      (header.column.columnDef.meta as { align?: string } | undefined)?.align ===
                      'right';
                    return (
                      <th
                        key={header.id}
                        scope="col"
                        aria-sort={
                          sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : 'none'
                        }
                        className={cn('px-4 py-3 font-medium', alignRight && 'text-right')}
                      >
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className={cn(
                            'inline-flex items-center gap-1 rounded uppercase hover:text-slate-900 dark:hover:text-white',
                            alignRight && 'flex-row-reverse',
                          )}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          <Icon
                            name={
                              sorted === 'asc'
                                ? 'arrowUp'
                                : sorted === 'desc'
                                  ? 'arrowDown'
                                  : 'sort'
                            }
                            className={cn('h-3.5 w-3.5', !sorted && 'opacity-40')}
                          />
                        </button>
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {table.getRowModel().rows.map((row) => (
                // Mouse users can click anywhere on the row; keyboard users use the name button.
                <tr
                  key={row.id}
                  onClick={() => onSelect(row.original)}
                  className="cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  {row.getVisibleCells().map((cell) => {
                    const alignRight =
                      (cell.column.columnDef.meta as { align?: string } | undefined)?.align ===
                      'right';
                    return (
                      <td
                        key={cell.id}
                        className={cn(
                          'px-4 py-3 text-slate-700 dark:text-slate-300',
                          alignRight && 'text-right',
                        )}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <nav
        aria-label="Pagination"
        className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-400 sm:flex-row"
      >
        <p>
          Showing <span className="font-medium text-slate-900 dark:text-white">{firstRow}</span>-
          <span className="font-medium text-slate-900 dark:text-white">{lastRow}</span> of{' '}
          <span className="font-medium text-slate-900 dark:text-white">{formatNumber(total)}</span>
        </p>
        <div className="flex items-center gap-3">
          <label htmlFor={ids.size} className="whitespace-nowrap">
            Rows per page
          </label>
          <select
            id={ids.size}
            className="input w-20 py-1"
            value={pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
          >
            {[10, 25, 50].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            aria-label="Previous page"
          >
            <Icon name="chevronLeft" className="h-4 w-4" />
          </Button>
          <span className="whitespace-nowrap tabular-nums">
            {table.getPageCount() ? pageIndex + 1 : 0} / {table.getPageCount()}
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            aria-label="Next page"
          >
            <Icon name="chevronRight" className="h-4 w-4" />
          </Button>
        </div>
      </nav>
    </div>
  );
}
