import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { generateDataset } from '../../data/generator';
import { CustomersTable } from './CustomersTable';

const customers = generateDataset({ customerCount: 40, seed: 7 }).customers;
const bodyRows = () => within(screen.getAllByRole('rowgroup')[1]!).getAllByRole('row');

describe('<CustomersTable />', () => {
  it('paginates 10 rows per page and moves between pages', async () => {
    const user = userEvent.setup();
    render(<CustomersTable customers={customers} onSelect={vi.fn()} />);
    expect(bodyRows()).toHaveLength(10);
    expect(screen.getByText('1 / 4')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Next page' }));
    expect(screen.getByText('2 / 4')).toBeInTheDocument();
  });

  it('filters rows by search and shows an empty state that can be cleared', async () => {
    const user = userEvent.setup();
    const target = customers[5]!;
    render(<CustomersTable customers={customers} onSelect={vi.fn()} />);

    await user.type(screen.getByLabelText('Search'), target.id);
    expect(bodyRows()).toHaveLength(1);
    expect(screen.getByRole('button', { name: target.name })).toBeInTheDocument();

    await user.clear(screen.getByLabelText('Search'));
    await user.type(screen.getByLabelText('Search'), 'zzz-no-match');
    expect(screen.getByText('No customers found')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(bodyRows()).toHaveLength(10);
  });

  it('filters by status and sorts by MRR when the header is clicked', async () => {
    const user = userEvent.setup();
    render(<CustomersTable customers={customers} onSelect={vi.fn()} />);

    await user.selectOptions(screen.getByLabelText('Status'), 'churned');
    const churned = customers.filter((c) => c.status === 'churned').length;
    expect(screen.getByText(`${churned} customers match the current filters.`)).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText('Status'), 'all');

    const mrrHeader = screen.getByRole('columnheader', { name: /mrr/i });
    expect(mrrHeader).toHaveAttribute('aria-sort', 'descending');
    await user.click(within(mrrHeader).getByRole('button'));
    expect(mrrHeader).toHaveAttribute('aria-sort', 'ascending');
    const minMrr = Math.min(...customers.map((c) => c.mrr));
    expect(
      within(bodyRows()[0]!).getByText(`$${minMrr.toLocaleString('en-US')}`),
    ).toBeInTheDocument();
  });

  it('calls onSelect when a customer is activated with the keyboard', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<CustomersTable customers={customers} onSelect={onSelect} />);
    const firstButton = within(bodyRows()[0]!).getAllByRole('button')[0]!;
    firstButton.focus();
    await user.keyboard('{Enter}');
    expect(onSelect).toHaveBeenCalledTimes(1);
  });
});
