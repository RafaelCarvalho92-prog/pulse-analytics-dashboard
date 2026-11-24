import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { PLAN_COLOR_VAR } from '../ui/planColors';
import { PLANS, type PlanRecord } from '../../data/types';
import {
  formatCompact,
  formatCompactCurrency,
  formatCurrency,
  formatNumber,
} from '../../lib/format';
import { ChartLegend, ChartTooltip } from './ChartCard';

const axisProps = {
  tickLine: false,
  axisLine: false,
  tickMargin: 8,
} as const;

const cursorStyle = { stroke: 'var(--chart-axis)', strokeWidth: 1, strokeDasharray: '4 4' };

export function RevenueAreaChart({
  data,
  height = 288,
}: {
  data: { label: string; revenue: number }[];
  height?: number;
}) {
  return (
    <div style={{ height }} role="img" aria-label="Area chart of revenue over time">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--series-1)" stopOpacity={0.3} />
              <stop offset="100%" stopColor="var(--series-1)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="label" {...axisProps} minTickGap={16} />
          <YAxis {...axisProps} width={56} tickFormatter={formatCompactCurrency} />
          <Tooltip cursor={cursorStyle} content={<ChartTooltip formatter={formatCurrency} />} />
          <Area
            type="monotone"
            dataKey="revenue"
            name="Revenue"
            stroke="var(--series-1)"
            strokeWidth={2}
            fill="url(#revenueFill)"
            activeDot={{ r: 5, strokeWidth: 2, stroke: 'var(--chart-surface)' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MrrByPlanChart({ data }: { data: ({ label: string } & PlanRecord)[] }) {
  return (
    <div className="flex h-full flex-col gap-3">
      <ChartLegend items={PLANS.map((p) => ({ label: p, color: PLAN_COLOR_VAR[p] }))} />
      <div className="h-64" role="img" aria-label="Stacked bar chart of MRR by plan per month">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="label" {...axisProps} minTickGap={8} />
            <YAxis {...axisProps} width={56} tickFormatter={formatCompactCurrency} />
            <Tooltip
              cursor={{ fill: 'var(--chart-grid)', opacity: 0.5 }}
              content={<ChartTooltip formatter={formatCurrency} />}
            />
            {PLANS.map((plan, i) => (
              <Bar
                key={plan}
                dataKey={plan}
                name={plan}
                stackId="mrr"
                fill={PLAN_COLOR_VAR[plan]}
                stroke="var(--chart-surface)"
                strokeWidth={1}
                maxBarSize={36}
                radius={i === PLANS.length - 1 ? [4, 4, 0, 0] : 0}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function ActiveUsersChart({ data }: { data: { date: string; activeUsers: number }[] }) {
  const rows = data.map((d) => ({ ...d, label: format(parseISO(d.date), 'MMM d') }));
  return (
    <div className="h-64" role="img" aria-label="Line chart of daily active users over 90 days">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="label" {...axisProps} minTickGap={24} />
          <YAxis {...axisProps} width={48} tickFormatter={formatCompact} />
          <Tooltip cursor={cursorStyle} content={<ChartTooltip formatter={formatNumber} />} />
          <Line
            type="monotone"
            dataKey="activeUsers"
            name="Active users"
            stroke="var(--series-1)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 5, strokeWidth: 2, stroke: 'var(--chart-surface)' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function NewVsChurnedChart({
  data,
}: {
  data: { label: string; newMrr: number; churnedMrr: number }[];
}) {
  return (
    <div className="flex h-full flex-col gap-3">
      <ChartLegend
        items={[
          { label: 'New MRR', color: 'var(--series-1)' },
          { label: 'Churned MRR', color: 'var(--series-2)' },
        ]}
      />
      <div className="h-64" role="img" aria-label="Bar chart comparing new and churned MRR">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barGap={2}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="label" {...axisProps} minTickGap={12} />
            <YAxis {...axisProps} width={56} tickFormatter={formatCompactCurrency} />
            <Tooltip
              cursor={{ fill: 'var(--chart-grid)', opacity: 0.5 }}
              content={<ChartTooltip formatter={formatCurrency} />}
            />
            <Bar
              dataKey="newMrr"
              name="New MRR"
              fill="var(--series-1)"
              radius={[4, 4, 0, 0]}
              maxBarSize={24}
            />
            <Bar
              dataKey="churnedMrr"
              name="Churned MRR"
              fill="var(--series-2)"
              radius={[4, 4, 0, 0]}
              maxBarSize={24}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
