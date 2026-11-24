import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { Button } from './Button';
import { Icon } from './Icon';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-slate-200 dark:bg-slate-800', className)}
      aria-hidden="true"
    />
  );
}

/** Wraps skeleton content so screen readers announce a single "loading" message. */
export function LoadingRegion({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="mb-3 rounded-full bg-slate-100 p-3 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
        <Icon name="inbox" className="h-6 w-6" />
      </div>
      <p className="font-medium text-slate-900 dark:text-white">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center rounded-xl border border-rose-200 bg-rose-50 px-6 py-10 text-center dark:border-rose-900/60 dark:bg-rose-950/30"
    >
      <div className="mb-3 rounded-full bg-rose-100 p-3 text-rose-600 dark:bg-rose-900/40 dark:text-rose-300">
        <Icon name="alert" className="h-6 w-6" />
      </div>
      <p className="font-medium text-rose-900 dark:text-rose-200">Something went wrong</p>
      <p className="mt-1 max-w-md text-sm text-rose-700 dark:text-rose-300">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" className="mt-4" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
