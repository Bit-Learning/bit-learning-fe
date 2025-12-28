import { Card } from '@workspace/ui/components/Card'
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { StudentDistribution } from '../types/dashboard.type'

interface StudentDistributionChartProps {
    data: StudentDistribution[]
}

export const StudentDistributionChart = ({ data }: StudentDistributionChartProps) => {
    const chartData = data.map(item => ({
        name: item.name,
        value: item.value,
    }))

    const colors = data.map(item => item.color)

    return (
        <Card className="p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Phân bố học viên</h2>
            <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="45%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {chartData.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={colors[index]} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => [`${value} học viên`, '']} />
                        <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </Card>
    )
}
