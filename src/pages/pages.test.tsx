import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppRoutes } from '../App';
import { configureApi } from '../data/api';
import { useAuth } from '../store/auth';

const future = { v7_startTransition: true, v7_relativeSplatPath: true } as const;

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]} future={future}>
      <AppRoutes />
    </MemoryRouter>,
  );
}

describe('pages (smoke)', () => {
  const consoleError = vi.spyOn(console, 'error');

  beforeEach(() => {
    consoleError.mockClear();
    act(() => useAuth.getState().signIn('demo@pulse.dev'));
  });
  afterEach(() => act(() => useAuth.setState({ session: null })));

  it('renders the overview with KPIs and the funnel without console errors', async () => {
    renderAt('/');
    expect(await screen.findByRole('heading', { name: 'Conversion funnel' })).toBeInTheDocument();
    expect(screen.getByRole('article', { name: 'Monthly recurring revenue' })).toBeInTheDocument();
    expect(screen.getByText('Paid conversions')).toBeInTheDocument();
    expect(consoleError).not.toHaveBeenCalled();
  });

  it('updates the revenue page when the date range changes', async () => {
    const user = userEvent.setup();
    renderAt('/revenue');
    expect(await screen.findByText('Daily recognised revenue')).toBeInTheDocument();
    await user.click(screen.getByRole('radio', { name: '12m' }));
    expect(await screen.findByText('Monthly recognised revenue')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: '12m' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getAllByText('vs previous 12 months')).toHaveLength(4);
  });

  it('shows an error state with retry when the API fails', async () => {
    const user = userEvent.setup();
    configureApi({ failRequests: true });
    renderAt('/customers');
    expect(await screen.findByRole('alert')).toHaveTextContent('Something went wrong');
    configureApi({ failRequests: false });
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByLabelText('Search')).toBeInTheDocument();
  });
});
