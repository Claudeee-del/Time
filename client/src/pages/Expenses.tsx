import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useExpenses } from "@/hooks/use-expenses";
import { ExpenseCategory, ExpenseSummary, TimePeriod } from "@/types";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, TrendingDown, TrendingUp } from "lucide-react";
import { getMonthNames } from "@/lib/utils/time";
import { Skeleton } from "@/components/ui/skeleton";

const expenseFormSchema = z.object({
  amount: z.preprocess(
    (a) => parseFloat(z.string().parse(a)), 
    z.number().positive({ message: "Amount must be greater than 0" })
  ),
  category: z.string(),
  description: z.string().optional(),
});

type ExpenseFormValues = z.infer<typeof expenseFormSchema>;

export default function Expenses() {
  const userId = 1; // For demo, we're using the default user
  const [view, setView] = useState<"chart" | "list">("chart");
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("monthly");
  
  const { 
    getExpenses, 
    createExpense, 
    calculateExpenseSummaries, 
    calculateTotalExpenses, 
    formatMoney 
  } = useExpenses(userId);
  
  const { 
    data: expenses,
    isLoading: expensesLoading
  } = getExpenses();
  
  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      amount: 0,
      category: "food",
      description: "",
    },
  });
  
  const onSubmit = (data: ExpenseFormValues) => {
    createExpense.mutate({
      userId,
      amount: data.amount,
      category: data.category as ExpenseCategory,
      description: data.description,
      date: new Date(),
    }, {
      onSuccess: () => {
        form.reset({
          amount: 0,
          category: "food",
          description: "",
        });
      }
    });
  };
  
  // Calculate expense data for charts
  const expenseSummaries = expenses ? calculateExpenseSummaries(expenses, timePeriod) : [];
  const totalExpenses = expenses ? calculateTotalExpenses(expenses) : 0;
  
  // Colors for categories
  const COLORS = {
    food: '#3B82F6',
    transport: '#F59E0B',
    entertainment: '#10B981',
    shopping: '#8B5CF6',
    utilities: '#EC4899',
    other: '#6B7280',
  };
  
  // Format the data for the pie chart
  const pieChartData = expenseSummaries.map(item => ({
    name: formatCategoryName(item.category),
    value: item.amount,
  }));
  
  // Format the data for trend chart
  const trendChartData = timePeriod === "monthly"
    ? getMonthlyTrendData(expenses || [])
    : getWeeklyTrendData(expenses || []);
  
  // Determine if total expense has increased or decreased from previous period
  const previousPeriodTotal = getPreviousPeriodTotal(expenses || [], timePeriod);
  const currentPeriodTotal = getCurrentPeriodTotal(expenses || [], timePeriod);
  const percentageChange = previousPeriodTotal > 0
    ? Math.round(((currentPeriodTotal - previousPeriodTotal) / previousPeriodTotal) * 100)
    : 0;
  
  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold">Expense Tracker</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Track and manage your expenses across different categories
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex items-center space-x-3">
          {/* View toggle */}
          <Tabs defaultValue="chart" className="w-[200px]" onValueChange={(value) => setView(value as any)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="chart">Chart View</TabsTrigger>
              <TabsTrigger value="list">List View</TabsTrigger>
            </TabsList>
          </Tabs>
          
          {/* Time period filter */}
          <Select value={timePeriod} onValueChange={(value) => setTimePeriod(value as TimePeriod)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Summary card */}
      <div className="mb-8">
        <Card className="shadow">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Total expenses */}
              <div className="flex items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <div className="rounded-full h-12 w-12 flex items-center justify-center bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 mr-4">
                  <DollarSign />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Expenses</div>
                  {expensesLoading ? (
                    <Skeleton className="h-7 w-24 mt-1" />
                  ) : (
                    <div className="text-2xl font-semibold">{formatMoney(totalExpenses)}</div>
                  )}
                </div>
              </div>
              
              {/* Current period total */}
              <div className="flex items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <div className="rounded-full h-12 w-12 flex items-center justify-center bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 mr-4">
                  <DollarSign />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {timePeriod === 'daily' ? 'Today' : 
                     timePeriod === 'weekly' ? 'This Week' : 'This Month'}
                  </div>
                  {expensesLoading ? (
                    <Skeleton className="h-7 w-24 mt-1" />
                  ) : (
                    <div className="text-2xl font-semibold">{formatMoney(currentPeriodTotal)}</div>
                  )}
                </div>
              </div>
              
              {/* Change indicator */}
              <div className="flex items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <div className={`rounded-full h-12 w-12 flex items-center justify-center ${
                  percentageChange > 0 
                    ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400' 
                    : 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                } mr-4`}>
                  {percentageChange > 0 ? <TrendingUp /> : <TrendingDown />}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">vs Previous Period</div>
                  {expensesLoading ? (
                    <Skeleton className="h-7 w-20 mt-1" />
                  ) : (
                    <div className={`text-2xl font-semibold ${
                      percentageChange > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                    }`}>
                      {percentageChange > 0 ? '+' : ''}{percentageChange}%
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Charts */}
        <div className="lg:col-span-2">
          <Card className="shadow h-full">
            <CardHeader>
              <CardTitle>Expense Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {expensesLoading ? (
                <Skeleton className="h-[400px] w-full" />
              ) : view === "chart" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[400px]">
                  {/* Pie chart */}
                  <div className="h-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {pieChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[entry.name.toLowerCase() as keyof typeof COLORS] || '#6B7280'} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [formatMoney(value as number), '']} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {/* Trend chart */}
                  <div className="h-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={trendChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(value) => `$${value}`} />
                        <Tooltip formatter={(value) => [formatMoney(value as number), '']} />
                        <Bar dataKey="amount" fill="#3B82F6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ) : (
                <div className="h-[400px] overflow-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {expenses && expenses.map((expense) => (
                        <tr key={expense.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                            {new Date(expense.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                            {formatCategoryName(expense.category)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {expense.description || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-gray-300">
                            {formatMoney(expense.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Add expense form */}
        <Card className="shadow">
          <CardHeader>
            <CardTitle>Add New Expense</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <div className="relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 dark:text-gray-400 sm:text-sm">$</span>
                          </div>
                          <Input
                            type="number"
                            min="0.01"
                            step="0.01"
                            placeholder="0.00"
                            className="pl-7"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="food">Food</SelectItem>
                          <SelectItem value="transport">Transport</SelectItem>
                          <SelectItem value="entertainment">Entertainment</SelectItem>
                          <SelectItem value="shopping">Shopping</SelectItem>
                          <SelectItem value="utilities">Utilities</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Lunch, movie tickets, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full" disabled={createExpense.isPending}>
                  {createExpense.isPending ? "Adding..." : "Add Expense"}
                </Button>
              </form>
            </Form>
            
            {/* Category breakdown */}
            <div className="mt-8">
              <h4 className="text-sm font-medium mb-2">Category Breakdown</h4>
              <div className="space-y-2">
                {expenseSummaries.map((summary) => (
                  <div key={summary.category} className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: COLORS[summary.category as keyof typeof COLORS] }}
                      ></div>
                      <span className="text-sm">{formatCategoryName(summary.category)}</span>
                    </div>
                    <span className="text-sm font-medium">{formatMoney(summary.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Helper functions

// Format category names
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

// Get monthly trend data
function getMonthlyTrendData(expenses: any[]) {
  const monthNames = getMonthNames();
  const currentDate = new Date();
  const data = [];
  
  // Get data for the past 6 months
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(currentDate.getMonth() - i);
    const month = date.getMonth();
    const year = date.getFullYear();
    
    const monthExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === month && expenseDate.getFullYear() === year;
    });
    
    const totalAmount = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    data.push({
      name: monthNames[month],
      amount: totalAmount,
    });
  }
  
  return data;
}

// Get weekly trend data
function getWeeklyTrendData(expenses: any[]) {
  const currentDate = new Date();
  const data = [];
  
  // Get data for the past 4 weeks
  for (let i = 3; i >= 0; i--) {
    const startDate = new Date();
    startDate.setDate(currentDate.getDate() - (7 * i + 6));
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);
    
    const weekExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= startDate && expenseDate <= endDate;
    });
    
    const totalAmount = weekExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    data.push({
      name: `Week ${4-i}`,
      amount: totalAmount,
    });
  }
  
  return data;
}

// Get previous period total
function getPreviousPeriodTotal(expenses: any[], period: TimePeriod) {
  const now = new Date();
  const currentPeriodStart = new Date();
  const previousPeriodStart = new Date();
  const previousPeriodEnd = new Date();
  
  if (period === 'daily') {
    currentPeriodStart.setHours(0, 0, 0, 0);
    previousPeriodStart.setDate(now.getDate() - 1);
    previousPeriodStart.setHours(0, 0, 0, 0);
    previousPeriodEnd.setDate(now.getDate() - 1);
    previousPeriodEnd.setHours(23, 59, 59, 999);
  } else if (period === 'weekly') {
    const day = now.getDay();
    currentPeriodStart.setDate(now.getDate() - day);
    currentPeriodStart.setHours(0, 0, 0, 0);
    previousPeriodStart.setDate(currentPeriodStart.getDate() - 7);
    previousPeriodEnd.setDate(currentPeriodStart.getDate() - 1);
    previousPeriodEnd.setHours(23, 59, 59, 999);
  } else {
    currentPeriodStart.setDate(1);
    currentPeriodStart.setHours(0, 0, 0, 0);
    previousPeriodStart.setMonth(now.getMonth() - 1);
    previousPeriodStart.setDate(1);
    previousPeriodStart.setHours(0, 0, 0, 0);
    previousPeriodEnd.setDate(0); // Last day of previous month
    previousPeriodEnd.setHours(23, 59, 59, 999);
  }
  
  const previousPeriodExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate >= previousPeriodStart && expenseDate <= previousPeriodEnd;
  });
  
  return previousPeriodExpenses.reduce((sum, expense) => sum + expense.amount, 0);
}

// Get current period total
function getCurrentPeriodTotal(expenses: any[], period: TimePeriod) {
  const now = new Date();
  const currentPeriodStart = new Date();
  
  if (period === 'daily') {
    currentPeriodStart.setHours(0, 0, 0, 0);
  } else if (period === 'weekly') {
    const day = now.getDay();
    currentPeriodStart.setDate(now.getDate() - day);
    currentPeriodStart.setHours(0, 0, 0, 0);
  } else {
    currentPeriodStart.setDate(1);
    currentPeriodStart.setHours(0, 0, 0, 0);
  }
  
  const currentPeriodExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate >= currentPeriodStart && expenseDate <= now;
  });
  
  return currentPeriodExpenses.reduce((sum, expense) => sum + expense.amount, 0);
}
