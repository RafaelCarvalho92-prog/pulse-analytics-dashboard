import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { AppRoutes } from '../../App';
import { SESSION_STORAGE_KEY, useAuth } from '../../store/auth';
import { RequireAuth } from './RequireAuth';

const future = { v7_startTransition: true, v7_relativeSplatPath: true } as const;

function renderGuarded(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]} future={future}>
      <Routes>
        <Route path="/login" element={<p>Login screen</p>} />
        <Route
          path="/secret"
          element={
            <RequireAuth>
              <p>Secret content</p>
            </RequireAuth>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe('auth guard', () => {
  afterEach(() => act(() => useAuth.setState({ session: null })));

  it('redirects anonymous visitors to the login screen', () => {
    renderGuarded('/secret');
    expect(screen.getByText('Login screen')).toBeInTheDocument();
    expect(screen.queryByText('Secret content')).not.toBeInTheDocument();
  });

  it('renders protected content when a session exists', () => {
    useAuth.getState().signIn('jane.doe@acme.com');
    renderGuarded('/secret');
    expect(screen.getByText('Secret content')).toBeInTheDocument();
    expect(useAuth.getState().session?.name).toBe('Jane Doe');
  });

  it('signs in through the login form, persists the session and returns to the requested page', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/customers']} future={future}>
        <AppRoutes />
      </MemoryRouter>,
    );

    expect(await screen.findByRole('heading', { name: 'Sign in to Pulse' })).toBeInTheDocument();
    await user.clear(screen.getByLabelText('Email'));
    await user.type(screen.getByLabelText('Email'), 'rafael@example.com');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(
      await screen.findByRole('heading', { name: 'Customers' }, { timeout: 3000 }),
    ).toBeInTheDocument();
    expect(await screen.findByLabelText('Search', {}, { timeout: 3000 })).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem(SESSION_STORAGE_KEY) ?? '{}').state.session.email).toBe(
      'rafael@example.com',
    );
  });
});
