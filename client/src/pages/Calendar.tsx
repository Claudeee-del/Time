import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useTimeTracking } from "@/hooks/use-time-tracking";
import { useExpenses } from "@/hooks/use-expenses";
import { 
  ActivityCategory, 
  Activity, 
  ExpenseCategory, 
  Expense 
} from "@/types";
import { CalendarIcon, InfoIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getDaysInMonth, format, isSameDay } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface DayActivitySummary {
  date: Date;
  activities: {
    [key in ActivityCategory]?: {
      count: number;
      duration: number;
      color: string;
    }
  };
  expenses: {
    [key in ExpenseCategory]?: {
      count: number;
      amount: number;
      color: string;
    }
  };
}

export default function Calendar() {
  const userId = 1; // Default user ID
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const timeTracking = useTimeTracking(userId);
  const expenseTracking = useExpenses(userId);
  
  // Get activities and expenses data
  const activitiesQuery = timeTracking.getActivities();
  const expensesQuery = expenseTracking.getExpenses();
  
  // Check if data is loading
  const isLoading = activitiesQuery.isLoading || expensesQuery.isLoading;
  
  // Generate daily summaries
  const dailySummaries = generateDailySummaries(activitiesQuery.data || [], expensesQuery.data || []);
  
  // Get selected day data
  const selectedDayData = selectedDate 
    ? dailySummaries.find(day => isSameDay(day.date, selectedDate))
    : undefined;
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold">Activity Calendar</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Visual overview of your activities and expenses
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Calendar section */}
        <Card className="lg:col-span-8 shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CalendarIcon className="mr-2 h-5 w-5" />
              Activity Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CalendarComponent
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
              // Custom rendering can be added here when necessary
              modifiers={{
                // Add custom day styling based on the data
                highlighted: (date) => {
                  const dayData = dailySummaries.find(summary => 
                    isSameDay(summary.date, date)
                  );
                  
                  return !!dayData && (
                    Object.keys(dayData.activities).length > 0 || 
                    Object.keys(dayData.expenses).length > 0
                  );
                }
              }}
              modifiersClassNames={{
                highlighted: "font-medium border-primary-500 dark:border-primary-400 border-b-2"
              }}
            />
          </CardContent>
        </Card>
        
        {/* Selected day details */}
        <Card className="lg:col-span-4 shadow">
          <CardHeader>
            <CardTitle className="text-lg">
              {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Select a date"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-5/6"></div>
              </div>
            ) : selectedDayData ? (
              <div className="space-y-4">
                {/* Activities section */}
                <div>
                  <h3 className="text-sm font-medium mb-2">Activities</h3>
                  {Object.keys(selectedDayData.activities).length > 0 ? (
                    <div className="space-y-2">
                      {Object.entries(selectedDayData.activities).map(([category, data]) => (
                        <div key={category} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div 
                              className="w-3 h-3 rounded-full mr-2" 
                              style={{ backgroundColor: data.color }}
                            />
                            <span className="text-sm capitalize">{formatCategoryName(category)}</span>
                          </div>
                          <span className="text-sm">
                            {Math.round(data.duration / 60)} min
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No activities recorded</p>
                  )}
                </div>
                
                {/* Expenses section */}
                <div>
                  <h3 className="text-sm font-medium mb-2">Expenses</h3>
                  {Object.keys(selectedDayData.expenses).length > 0 ? (
                    <div className="space-y-2">
                      {Object.entries(selectedDayData.expenses).map(([category, data]) => (
                        <div key={category} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div 
                              className="w-3 h-3 rounded-full mr-2" 
                              style={{ backgroundColor: data.color }}
                            />
                            <span className="text-sm capitalize">{formatCategoryName(category)}</span>
                          </div>
                          <span className="text-sm">${data.amount.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No expenses recorded</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <CalendarIcon className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-500 dark:text-gray-400">Select a date to view details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Legend */}
      <Card className="shadow mt-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <InfoIcon className="h-5 w-5 mr-2" />
            Calendar Legend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Activities</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2 bg-blue-500" />
                  <span className="text-sm">Social Media</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2 bg-orange-500" />
                  <span className="text-sm">Gaming</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2 bg-green-500" />
                  <span className="text-sm">Reading</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2 bg-purple-500" />
                  <span className="text-sm">Lectures</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2 opacity-0 md:opacity-100">More</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2 bg-yellow-500" />
                  <span className="text-sm">Practice</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2 bg-indigo-500" />
                  <span className="text-sm">Sleep</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2 bg-emerald-500" />
                  <span className="text-sm">Salah</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Expenses</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2 bg-red-500" />
                  <span className="text-sm">Food</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2 bg-cyan-500" />
                  <span className="text-sm">Transport</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2 bg-pink-500" />
                  <span className="text-sm">Entertainment</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2 opacity-0 md:opacity-100">More</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2 bg-amber-500" />
                  <span className="text-sm">Shopping</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2 bg-lime-500" />
                  <span className="text-sm">Utilities</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2 bg-gray-500" />
                  <span className="text-sm">Other</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function generateDailySummaries(activities: Activity[], expenses: Expense[]): DayActivitySummary[] {
  const summaries: Record<string, DayActivitySummary> = {};
  
  // Define colors for categories
  const activityColors: Record<ActivityCategory, string> = {
    social_media: '#3b82f6', // blue
    gaming: '#f97316',       // orange
    reading: '#10b981',      // green
    lectures: '#8b5cf6',     // purple
    practice: '#eab308',     // yellow
    sleep: '#6366f1',        // indigo
    salah: '#10b981',        // emerald
  };
  
  const expenseColors: Record<ExpenseCategory, string> = {
    food: '#ef4444',         // red
    transport: '#06b6d4',    // cyan
    entertainment: '#ec4899', // pink
    shopping: '#f59e0b',     // amber
    utilities: '#84cc16',    // lime
    other: '#6b7280',        // gray
  };
  
  // Process activities
  activities.forEach(activity => {
    const dateStr = new Date(activity.startTime).toISOString().split('T')[0];
    
    if (!summaries[dateStr]) {
      summaries[dateStr] = {
        date: new Date(activity.startTime),
        activities: {},
        expenses: {}
      };
    }
    
    const category = activity.category;
    
    if (!summaries[dateStr].activities[category]) {
      summaries[dateStr].activities[category] = {
        count: 0,
        duration: 0,
        color: activityColors[category]
      };
    }
    
    summaries[dateStr].activities[category]!.count++;
    summaries[dateStr].activities[category]!.duration += activity.duration;
  });
  
  // Process expenses
  expenses.forEach(expense => {
    const dateStr = new Date(expense.date).toISOString().split('T')[0];
    
    if (!summaries[dateStr]) {
      summaries[dateStr] = {
        date: new Date(expense.date),
        activities: {},
        expenses: {}
      };
    }
    
    const category = expense.category;
    
    if (!summaries[dateStr].expenses[category]) {
      summaries[dateStr].expenses[category] = {
        count: 0,
        amount: 0,
        color: expenseColors[category]
      };
    }
    
    summaries[dateStr].expenses[category]!.count++;
    summaries[dateStr].expenses[category]!.amount += expense.amount;
  });
  
  return Object.values(summaries);
}

function formatCategoryName(category: string): string {
  return category
    .replace(/_/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());
}