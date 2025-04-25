import { Card, CardContent } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { TimeAllocation, TimePeriod } from "@/types";
import { getPastWeekDays } from "@/lib/utils/time";

interface DataPoint {
  name: string;
  'Social Media': number;
  Gaming: number;
  Reading: number;
  Lectures: number;
  Practice: number;
  Sleep: number;
}

interface TimeAllocationChartProps {
  data: TimeAllocation[];
  period?: TimePeriod;
}

export default function TimeAllocationChart({ data, period = 'weekly' }: TimeAllocationChartProps) {
  // Transform data for the chart
  // For weekly view, we need to group by day
  const chartData: DataPoint[] = [];
  
  if (period === 'weekly') {
    // Get day names for the past week
    const dayNames = getPastWeekDays();
    
    // Initialize chart data with day names
    dayNames.forEach(day => {
      chartData.push({
        name: day,
        'Social Media': 0,
        Gaming: 0,
        Reading: 0,
        Lectures: 0,
        Practice: 0,
        Sleep: 0,
      });
    });
    
    // Populate with actual data
    data.forEach(item => {
      const dayName = new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' });
      const dayIndex = dayNames.indexOf(dayName);
      if (dayIndex !== -1) {
        const category = formatCategoryName(item.category);
        chartData[dayIndex][category] = item.duration;
      }
    });
  } else {
    // For simple display, just use the data as is
    // Group by category
    const grouped: { [key: string]: number } = {
      'Social Media': 0,
      Gaming: 0,
      Reading: 0,
      Lectures: 0,
      Practice: 0,
      Sleep: 0,
    };
    
    data.forEach(item => {
      const category = formatCategoryName(item.category);
      grouped[category] += item.duration;
    });
    
    chartData.push({
      name: period === 'daily' ? 'Today' : 'This Month',
      ...grouped,
    });
  }

  return (
    <Card className="shadow">
      <CardContent className="p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100 mb-4">Weekly Time Allocation</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barGap={0} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => `${value}h`} />
              <Tooltip 
                formatter={(value) => [`${value} hours`, '']}
                labelFormatter={(label) => `Day: ${label}`}
              />
              <Legend />
              <Bar dataKey="Social Media" fill="#EF4444" stackId="a" />
              <Bar dataKey="Gaming" fill="#F59E0B" stackId="a" />
              <Bar dataKey="Reading" fill="#10B981" stackId="a" />
              <Bar dataKey="Lectures" fill="#3B82F6" stackId="a" />
              <Bar dataKey="Practice" fill="#8B5CF6" stackId="a" />
              <Bar dataKey="Sleep" fill="#6B7280" stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper to format category names for the chart
function formatCategoryName(category: string): keyof DataPoint {
  switch (category) {
    case 'social_media': return 'Social Media';
    case 'gaming': return 'Gaming';
    case 'reading': return 'Reading';
    case 'lectures': return 'Lectures';
    case 'practice': return 'Practice';
    case 'sleep': return 'Sleep';
    default: return 'Social Media'; // Fallback
  }
}
