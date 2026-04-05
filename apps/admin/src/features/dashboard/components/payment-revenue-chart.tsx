import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { MonthlyRevenue } from "../types/dashboard.types";

interface PaymentRevenueChartProps {
  data: MonthlyRevenue[];
}

const BAR_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#ec4899",
  "#f43f5e",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#10b981",
  "#06b6d4",
  "#3b82f6",
  "#6366f1",
];

export function PaymentRevenueChart({ data }: PaymentRevenueChartProps) {
  const chartData = data.map((item) => ({
    name: getMonthName(item.month),
    revenue: item.revenue,
    revenueFormatted: formatCurrency(item.revenue),
    month: item.month,
  }));

  const maxRevenue = Math.max(...chartData.map((d) => d.revenue), 1);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} barCategoryGap="30%">
        <defs>
          {chartData.map((_, i) => (
            <linearGradient key={i} id={`bar-grad-${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={BAR_COLORS[i % BAR_COLORS.length]} stopOpacity={1} />
              <stop offset="100%" stopColor={BAR_COLORS[i % BAR_COLORS.length]} stopOpacity={0.55} />
            </linearGradient>
          ))}
        </defs>

        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />

        <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} tick={{ fill: "#94a3b8" }} />
        <YAxis
          fontSize={11}
          tickLine={false}
          axisLine={false}
          tick={{ fill: "#94a3b8" }}
          tickFormatter={formatCurrencyShort}
          width={55}
        />

        <Tooltip
          cursor={{ fill: "rgba(99,102,241,0.06)", radius: 6 }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const d = payload[0].payload;
            const pct = Math.round((d.revenue / maxRevenue) * 100);
            const color = BAR_COLORS[(d.month - 1) % BAR_COLORS.length];
            return (
              <div className="rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-lg">
                <p className="mb-1 text-xs font-semibold text-gray-400 uppercase tracking-wide">{d.name}</p>
                <p className="text-lg font-bold" style={{ color }}>
                  {d.revenueFormatted}
                </p>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
                </div>
                <p className="mt-1 text-xs text-gray-400">{pct}% so với cao nhất</p>
              </div>
            );
          }}
        />

        <Bar dataKey="revenue" radius={[6, 6, 0, 0]} maxBarSize={48}>
          {chartData.map((_, i) => (
            <Cell key={i} fill={`url(#bar-grad-${i})`} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function getMonthName(month: number): string {
  return ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"][month - 1] ?? `T${month}`;
}

function formatCurrency(amount: number): string {
  return amount.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
}

function formatCurrencyShort(value: number): string {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return value.toString();
}
