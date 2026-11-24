import { ChartCard, ChartSkeleton } from '../components/charts/ChartCard';
import { ActiveUsersChart, MrrByPlanChart, RevenueAreaChart } from '../components/charts/charts';
import { Funnel } from '../components/charts/Funnel';
import { PageHeader } from '../components/layout/PageHeader';
import { KpiCard, KpiCardSkeleton } from '../components/ui/KpiCard';
import { ErrorState, LoadingRegion } from '../components/ui/States';
import { api } from '../data/api';
import { useAsync } from '../hooks/useAsync';

export default function OverviewPage() {
  const { status, data, error, retry } = useAsync(() => api.getOverview(), []);

  return (
    <>
      <PageHeader
        title="Overview"
        description="Key business metrics. KPI deltas compare the last 30 days with the 30 days before."
      />

      {status === 'error' && !data ? (
        <ErrorState message={error.message} onRetry={retry} />
      ) : !data ? (
        <LoadingRegion label="Loading overview">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => (
              <KpiCardSkeleton key={i} />
            ))}
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <ChartSkeleton />
            </div>
            <ChartSkeleton />
          </div>
        </LoadingRegion>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {data.kpis.map((kpi) => (
              <KpiCard key={kpi.id} kpi={kpi} comparisonLabel="vs previous 30 days" />
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <ChartCard
              className="lg:col-span-2"
              title="Revenue"
              description="Recognised revenue per month, last 12 months"
            >
              <RevenueAreaChart data={data.revenueByMonth} />
            </ChartCard>
            <ChartCard title="Conversion funnel" description="Last 30 days">
              <Funnel stages={data.funnel} />
            </ChartCard>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <ChartCard title="MRR by plan" description="Month-end MRR split by subscription plan">
              <MrrByPlanChart data={data.mrrByPlan} />
            </ChartCard>
            <ChartCard title="Active users" description="Daily active users, last 90 days">
              <ActiveUsersChart data={data.activeUsers} />
            </ChartCard>
          </div>
        </div>
      )}
    </>
  );
}
