// @ts-nocheck
import { Card } from "@workspace/ui/components/Card";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { QuestionStatusData } from "../types/mentor.type";

interface QuestionStatusChartProps {
  data: QuestionStatusData;
}

const ITEMS = [
  { key: "approved", label: "Đã duyệt", color: "#0F6E56" },
  { key: "pending", label: "Chờ duyệt", color: "#EF9F27" },
  { key: "rejected", label: "Từ chối", color: "#E24B4A" },
];

export const QuestionStatusChart = ({ data }: QuestionStatusChartProps) => {
  const chartData = ITEMS.map((item) => ({ name: item.label, value: data[item.key], color: item.color }));
  const total = chartData.reduce((s, d) => s + d.value, 0);

  return (
    <Card className="p-6">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Trạng thái câu hỏi</h2>
      <div className="flex items-center gap-6">
        <div className="h-48 w-48 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={48}
                outerRadius={72}
                paddingAngle={3}
                dataKey="value"
              >
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [`${value} câu`, ""]}
                contentStyle={{ borderRadius: "8px", border: "1px solid #E5E7EB" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 space-y-3">
          {chartData.map((item) => (
            <div key={item.name} className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: item.color }} />
              <span className="flex-1 text-sm text-gray-600">{item.name}</span>
              <span className="text-sm font-semibold text-gray-900">{item.value.toLocaleString("vi-VN")}</span>
              <span className="w-10 text-right text-xs text-gray-400">{Math.round((item.value / total) * 100)}%</span>
            </div>
          ))}
          <div className="border-t border-gray-100 pt-2 flex justify-between text-sm">
            <span className="text-gray-500">Tổng cộng</span>
            <span className="font-bold text-gray-900">{total.toLocaleString("vi-VN")}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
