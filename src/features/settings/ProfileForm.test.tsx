import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ProfileForm } from './ProfileForm';
import type { ProfileFormValues } from './profileSchema';

const defaults: ProfileFormValues = {
  fullName: 'Ava Silva',
  email: 'ava@example.com',
  company: 'Nimbus',
  role: 'Founder',
  website: '',
  bio: '',
  weeklyDigest: true,
};

describe('<ProfileForm />', () => {
  it('shows validation errors and does not submit invalid data', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<ProfileForm defaultValues={defaults} onSubmit={onSubmit} />);

    await user.clear(screen.getByLabelText('Full name'));
    await user.type(screen.getByLabelText('Full name'), 'A');
    await user.clear(screen.getByLabelText('Email'));
    await user.type(screen.getByLabelText('Email'), 'not-an-email');
    await user.type(screen.getByLabelText('Website'), 'example');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(await screen.findByText('Name must be at least 2 characters')).toBeInTheDocument();
    expect(screen.getByText('Enter a valid email address')).toBeInTheDocument();
    expect(screen.getByText(/full URL starting with http/)).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits valid values and confirms the save', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<ProfileForm defaultValues={defaults} onSubmit={onSubmit} />);

    await user.clear(screen.getByLabelText('Full name'));
    await user.type(screen.getByLabelText('Full name'), 'Ava Moreau');
    await user.type(screen.getByLabelText('Website'), 'https://ava.dev');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(await screen.findByText('Profile saved.')).toBeInTheDocument();
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ fullName: 'Ava Moreau', website: 'https://ava.dev' }),
    );
  });

  it('surfaces API errors returned by onSubmit', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockRejectedValue(new Error('Server unavailable'));
    render(<ProfileForm defaultValues={defaults} onSubmit={onSubmit} />);
    await user.click(screen.getByRole('button', { name: 'Save changes' }));
    expect(await screen.findByText('Server unavailable')).toBeInTheDocument();
  });
});
