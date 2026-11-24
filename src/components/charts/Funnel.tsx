import type { FunnelStage } from '../../data/types';
import { formatNumber, formatPercent } from '../../lib/format';

/**
 * Conversion funnel as an HTML list: each bar shows the conversion from the previous stage,
 * so late stages stay readable even when the top of the funnel is orders of magnitude larger.
 */
export function Funnel({ stages }: { stages: FunnelStage[] }) {
  const first = stages[0]?.value ?? 0;
  const last = stages[stages.length - 1]?.value ?? 0;
  return (
    <div>
      <ol className="space-y-4">
        {stages.map((s, i) => {
          const prev = i === 0 ? s.value : (stages[i - 1]?.value ?? 0);
          const rate = prev ? (s.value / prev) * 100 : 0;
          return (
            <li key={s.stage}>
              <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
                <span className="font-medium text-slate-700 dark:text-slate-300">{s.stage}</span>
                <span className="tabular-nums text-slate-900 dark:text-white">
                  {formatNumber(s.value)}
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${Math.max(rate, 1.5)}%`, background: 'var(--series-1)' }}
                />
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {i === 0 ? 'Top of funnel' : `${formatPercent(rate)} of previous stage`}
              </p>
            </li>
          );
        })}
      </ol>
      <p className="mt-5 border-t border-slate-200 pt-3 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-400">
        Overall visitor-to-paid conversion:{' '}
        <span className="font-semibold text-slate-900 dark:text-white">
          {formatPercent(first ? (last / first) * 100 : 0, 2)}
        </span>
      </p>
    </div>
  );
}
