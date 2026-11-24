import { Suspense, useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '../../lib/cn';
import { useAuth } from '../../store/auth';
import { useTheme } from '../../store/theme';
import { Icon, type IconName } from '../ui/Icon';
import { PageFallback } from './PageFallback';

const NAV: { to: string; label: string; icon: IconName }[] = [
  { to: '/', label: 'Overview', icon: 'overview' },
  { to: '/customers', label: 'Customers', icon: 'customers' },
  { to: '/revenue', label: 'Revenue', icon: 'revenue' },
  { to: '/settings', label: 'Settings', icon: 'settings' },
];

export function DemoBanner() {
  return (
    <div className="bg-slate-900 px-4 py-1.5 text-center text-xs font-medium text-slate-100 dark:bg-brand-900">
      Demo project, fictional data. Built by Rafael Carvalho as a portfolio piece.
    </div>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5 px-2">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-white">
        <Icon name="pulse" className="h-5 w-5" />
      </span>
      <span className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
        Pulse
      </span>
    </div>
  );
}

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav aria-label="Main" className="mt-8 flex flex-col gap-1">
      {NAV.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white',
            )
          }
        >
          <Icon name={item.icon} />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

function ThemeButton() {
  const { preference, setPreference } = useTheme();
  const order = ['system', 'light', 'dark'] as const;
  const next = order[(order.indexOf(preference) + 1) % order.length] ?? 'system';
  const icon: IconName =
    preference === 'light' ? 'sun' : preference === 'dark' ? 'moon' : 'monitor';
  return (
    <button
      type="button"
      onClick={() => setPreference(next)}
      className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
      aria-label={`Theme: ${preference}. Switch to ${next}`}
      title={`Theme: ${preference}`}
    >
      <Icon name={icon} />
    </button>
  );
}

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const session = useAuth((s) => s.session);
  const signOut = useAuth((s) => s.signOut);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => setMobileOpen(false), [location.pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMobileOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [mobileOpen]);

  const initials = (session?.name ?? 'Demo User')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleSignOut = () => {
    signOut();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen">
      <a
        href="#main"
        className="sr-only z-50 rounded-md bg-brand-600 px-3 py-2 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById('main')?.focus();
        }}
      >
        Skip to content
      </a>
      <DemoBanner />

      {/* Desktop sidebar */}
      <div className="lg:flex">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white px-4 py-6 dark:border-slate-800 dark:bg-slate-900 lg:flex">
          <Brand />
          <SidebarNav />
          <p className="mt-auto px-2 text-xs text-slate-400">Data as of Oct 31, 2026</p>
        </aside>

        {/* Mobile off-canvas sidebar */}
        {mobileOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div
              className="absolute inset-0 bg-slate-950/50"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />
            <aside
              id="mobile-nav"
              className="relative flex h-full w-72 animate-fade-in flex-col bg-white px-4 py-6 shadow-xl dark:bg-slate-900"
            >
              <div className="flex items-center justify-between">
                <Brand />
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  aria-label="Close navigation"
                >
                  <Icon name="close" />
                </button>
              </div>
              <SidebarNav onNavigate={() => setMobileOpen(false)} />
            </aside>
          </div>
        )}

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/80 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80 sm:px-6">
            <button
              type="button"
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation"
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
            >
              <Icon name="menu" />
            </button>
            <div className="lg:hidden">
              <Brand />
            </div>
            <div className="ml-auto flex items-center gap-2">
              <ThemeButton />
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {session?.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{session?.email}</p>
              </div>
              <span
                className="grid h-9 w-9 place-items-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700 dark:bg-brand-500/20 dark:text-brand-200"
                aria-hidden="true"
              >
                {initials}
              </span>
              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                aria-label="Sign out"
                title="Sign out"
              >
                <Icon name="logout" />
              </button>
            </div>
          </header>

          <main
            id="main"
            tabIndex={-1}
            className="mx-auto max-w-7xl px-4 py-6 focus:outline-none sm:px-6 lg:py-8"
          >
            <Suspense fallback={<PageFallback />}>
              <Outlet />
            </Suspense>
          </main>
        </div>
      </div>
    </div>
  );
}
