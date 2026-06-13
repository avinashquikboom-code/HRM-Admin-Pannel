'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import ChartContainer from '@/components/ChartContainer';

const growthDataDefault = [
  { name: 'Jan', companies: 8, seats: 2100 },
  { name: 'Feb', companies: 9, seats: 2450 },
  { name: 'Mar', companies: 10, seats: 2800 },
  { name: 'Apr', companies: 11, seats: 3100 },
  { name: 'May', companies: 13, seats: 4200 },
  { name: 'Jun', companies: 14, seats: 5100 },
  { name: 'Jul', companies: 15, seats: 6425 },
];

interface DashboardGrowthChartProps {
  data?: { name: string; companies: number; seats: number }[];
}

export default function DashboardGrowthChart({ data }: DashboardGrowthChartProps) {
  const chartData = data && data.length > 0 ? data : growthDataDefault;
  const latest = chartData[chartData.length - 1];

  return (
    <div className="rounded-sm border border-border/60 bg-surface p-5 sm:p-6 flex flex-col shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <h3 className="heading-2">Platform growth</h3>
          <p className="text-xs text-text-secondary mt-1">
            Monthly employee seat growth across all companies
          </p>
        </div>
        <div className="flex gap-3">
          <div className="rounded-sm bg-primary/10 px-4 py-2 text-center min-w-[88px]">
            <p className="text-[10px] font-bold uppercase tracking-wide text-primary">
              Seats
            </p>
            <p className="text-lg font-black text-text-primary tabular-nums">
              {latest.seats.toLocaleString()}
            </p>
          </div>
          <div className="rounded-sm bg-accent/10 px-4 py-2 text-center min-w-[88px]">
            <p className="text-[10px] font-bold uppercase tracking-wide text-accent">
              Companies
            </p>
            <p className="text-lg font-black text-text-primary tabular-nums">
              {latest.companies}
            </p>
          </div>
        </div>
      </div>

      <ChartContainer heightClassName="h-[260px] sm:min-h-[300px] sm:h-[300px]">
        <BarChart data={chartData} barSize={28}>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="var(--border)"
          />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
            dy={8}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
            tickFormatter={(val) =>
              val >= 1000 ? `${(val / 1000).toFixed(1)}k` : String(val)
            }
          />
          <Tooltip
            cursor={{ fill: 'var(--surface-variant)', opacity: 0.5 }}
            contentStyle={{
              borderRadius: '0px',
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              fontSize: '12px',
            }}
            formatter={(value, name) => [
              typeof value === 'number'
                ? value.toLocaleString()
                : String(value ?? ''),
              name === 'seats' ? 'Employee seats' : 'Companies',
            ]}
          />
          <Bar
            dataKey="seats"
            fill="#3BA38B"
            radius={[8, 8, 0, 0]}
            animationDuration={900}
          />
        </BarChart>
      </ChartContainer>
    </div>
  );
}
