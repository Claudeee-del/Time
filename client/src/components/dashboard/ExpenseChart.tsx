import { Card, CardContent } from "@/components/ui/card";
import { ExpenseSummary } from "@/types";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface ExpenseChartProps {
  data: ExpenseSummary[];
}

export default function ExpenseChart({ data }: ExpenseChartProps) {
  // Colors for each category
  const COLORS = {
    food: '#3B82F6',
    transport: '#F59E0B',
    entertainment: '#10B981',
    shopping: '#8B5CF6',
    utilities: '#EC4899',
    other: '#6B7280',
  };
  
  // Format the data for the chart
  const chartData = data.map(item => ({
    name: formatCategoryName(item.category),
    value: item.amount,
  }));
  
  // Add a dummy entry if there's no data
  if (chartData.length === 0) {
    chartData.push({
      name: 'No Data',
      value: 1,
    });
  }

  return (
    <div className="mb-4 h-48">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={60}
            innerRadius={40}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[entry.name.toLowerCase() as keyof typeof COLORS] || '#6B7280'} 
              />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value) => [`$${value.toFixed(2)}`, '']}
            contentStyle={{ 
              backgroundColor: 'var(--background)',
              borderColor: 'var(--border)'
            }}
          />
          <Legend 
            formatter={(value) => <span className="text-xs">{value}</span>}
            layout="vertical"
            align="right"
            verticalAlign="middle"
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// Helper to format category names
function formatCategoryName(category: string): string {
  switch (category) {
    case 'food': return 'Food';
    case 'transport': return 'Transport';
    case 'entertainment': return 'Entertainment';
    case 'shopping': return 'Shopping';
    case 'utilities': return 'Utilities';
    case 'other': return 'Other';
    default: return 'Other';
  }
}
