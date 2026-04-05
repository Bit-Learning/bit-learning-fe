// @ts-nocheck
import { Card } from "@workspace/ui/components/Card";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { MonthlyCount } from "../types/dashboard.type";

interface ExamMonthlyChartProps {
  data: MonthlyCount[];
}

const BAR_COLORS = [
  "#CECBF6",
  "#9FE1CB",
  "#F5C4B3",
  "#CECBF6",
  "#9FE1CB",
  "#F5C4B3",
  "#CECBF6",
  "#534AB7",
  "#0F6E56",
  "#993C1D",
  "#534AB7",
  "#CECBF6",
];

export const ExamMonthlyChart = ({ data }: ExamMonthlyChartProps) => {
  return (
    <Card className="p-6">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Đề thi theo tháng</h2>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
            <XAxis
              dataKey="month"
              stroke="#D1D5DB"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#9CA3AF" }}
            />
            <YAxis
              stroke="#D1D5DB"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#9CA3AF" }}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ fill: "rgba(83,74,183,.06)" }}
              contentStyle={{ borderRadius: "8px", border: "1px solid #E5E7EB" }}
              formatter={(value: number) => [value, "Đề thi"]}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={36}>
              {data.map((_: any, i: number) => (
                <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
