import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { DemoBanner } from '../components/layout/AppLayout';
import { Button } from '../components/ui/Button';
import { Icon } from '../components/ui/Icon';
import { useAuth } from '../store/auth';

const loginSchema = z.object({
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});
type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const session = useAuth((s) => s.session);
  const signIn = useAuth((s) => s.signIn);
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: 'demo@pulse.dev', password: 'demo1234' },
  });

  useEffect(() => {
    document.title = 'Sign in | Pulse Analytics';
  }, []);

  if (session) return <Navigate to={from} replace />;

  const onSubmit = handleSubmit(async ({ email }) => {
    await new Promise((r) => setTimeout(r, 400)); // simulate a network round trip
    signIn(email);
    navigate(from, { replace: true });
  });

  return (
    <div className="flex min-h-screen flex-col">
      <DemoBanner />
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center text-center">
            <span className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-brand-600 text-white">
              <Icon name="pulse" className="h-7 w-7" />
            </span>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Sign in to Pulse
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Demo mode: any email and password will work.
            </p>
          </div>
          <form onSubmit={onSubmit} noValidate className="card space-y-5 p-6" aria-label="Sign in">
            <div>
              <label htmlFor="login-email" className="label">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                className="input"
                aria-invalid={errors.email ? true : undefined}
                aria-describedby={errors.email ? 'login-email-error' : undefined}
                {...register('email')}
              />
              {errors.email && (
                <p id="login-email-error" className="mt-1 text-sm text-rose-600 dark:text-rose-400">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="login-password" className="label">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                className="input"
                aria-invalid={errors.password ? true : undefined}
                aria-describedby={errors.password ? 'login-password-error' : undefined}
                {...register('password')}
              />
              {errors.password && (
                <p
                  id="login-password-error"
                  className="mt-1 text-sm text-rose-600 dark:text-rose-400"
                >
                  {errors.password.message}
                </p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
