import { useState, useEffect } from "react";
import { useTimeTracking } from "@/hooks/use-time-tracking";
import { useExpenses } from "@/hooks/use-expenses";
import { useGoals } from "@/hooks/use-goals";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import DashboardSummary from "@/components/dashboard/DashboardSummary";
import TimeAllocationChart from "@/components/dashboard/TimeAllocationChart";
import GoalList from "@/components/dashboard/GoalList";
import ActivityTracker from "@/components/dashboard/ActivityTracker";
import ExpenseTracker from "@/components/dashboard/ExpenseTracker";
import RecentActivities from "@/components/dashboard/RecentActivities";
import DataSync from "@/components/dashboard/DataSync";
import { TimePeriod, ActivityCategory, TimeAllocation } from "@/types";
import { formatSecondsToHM } from "@/lib/utils/time";
import { exportToJson, saveFile } from "@/lib/utils/export";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("weekly");
  const { toast } = useToast();
  const userId = 1; // For demo, we're using the default user
  
  // Get data from hooks
  const { getActivities, calculateTimeAllocations } = useTimeTracking(userId);
  const { getExpenses, calculateExpenseSummaries, formatMoney } = useExpenses(userId);
  const { getGoals, calculateGoalProgress } = useGoals(userId);
  
  const {
    data: activities,
    isLoading: activitiesLoading
  } = getActivities();
  
  const {
    data: expenses,
    isLoading: expensesLoading
  } = getExpenses();
  
  const {
    data: goals,
    isLoading: goalsLoading
  } = getGoals();

  const {
    data: devices = [],
    isLoading: devicesLoading
  } = useQuery({
    queryKey: ["/api/devices", { userId }],
    queryFn: async () => {
      const url = new URL("/api/devices", window.location.origin);
      url.searchParams.append("userId", userId.toString());
      const response = await fetch(url.toString(), {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch devices");
      }
      return response.json();
    },
  });
  
  // Calculate derived values for the dashboard
  const timeAllocations = activities ? calculateTimeAllocations(activities, timePeriod) : [];
  const expenseSummaries = expenses ? calculateExpenseSummaries(expenses, timePeriod) : [];
  const goalProgressList = goals ? calculateGoalProgress(goals) : [];
  
  // Calculate summary data
  const socialMediaTime = activities 
    ? formatSecondsToHM(activities
        .filter(a => a.category === "social_media")
        .reduce((sum, a) => sum + a.duration, 0))
    : "0h 0m";
  
  const sleepTime = activities 
    ? formatSecondsToHM(activities
        .filter(a => a.category === "sleep")
        .reduce((sum, a) => sum + a.duration, 0))
    : "0h 0m";
  
  const readingTime = activities 
    ? formatSecondsToHM(activities
        .filter(a => a.category === "reading")
        .reduce((sum, a) => sum + a.duration, 0))
    : "0h 0m";
  
  const totalExpenses = expenses 
    ? expenses.reduce((sum, e) => sum + e.amount, 0)
    : 0;
  
  // Goal percentages (for summary cards)
  const socialMediaGoal = goalProgressList.find(g => g.category === "social_media");
  const sleepGoal = goalProgressList.find(g => g.category === "sleep");
  const readingGoal = goalProgressList.find(g => g.category === "reading");
  
  const socialMediaGoalPercentage = socialMediaGoal ? Math.round((socialMediaGoal.currentValue / socialMediaGoal.targetValue) * 100) : 100;
  const sleepGoalPercentage = sleepGoal ? Math.round((sleepGoal.currentValue / sleepGoal.targetValue) * 100) : 100;
  const readingGoalPercentage = readingGoal ? Math.round((readingGoal.currentValue / readingGoal.targetValue) * 100) : 100;
  
  // We'll assume a monthly budget of $1000 for the demo
  const monthlyBudget = 1000;
  const expenseBudgetPercentage = Math.round((totalExpenses / monthlyBudget) * 100);
  
  // Handle data export
  const handleExportData = async () => {
    if (!activities || !expenses || !goals) {
      toast({
        title: "Export failed",
        description: "Data is still loading. Please try again later.",
        variant: "destructive",
      });
      return;
    }
    
    const exportData = {
      activities,
      expenses,
      goals,
      devices,
      exportDate: new Date(),
    };
    
    const blob = exportToJson(exportData);
    const fileName = `lifetrack_export_${new Date().toISOString().split('T')[0]}.json`;
    saveFile(blob, fileName);
    
    toast({
      title: "Export successful",
      description: "Your data has been exported successfully.",
    });
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Welcome back! Here's your activity summary.
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex items-center space-x-3">
          {/* Time period filter */}
          <div className="flex rounded-md overflow-hidden border">
            <Button 
              onClick={() => setTimePeriod("daily")} 
              variant={timePeriod === "daily" ? "default" : "outline"}
              className="px-3 py-2 text-sm rounded-none border-0"
            >
              Daily
            </Button>
            <Button 
              onClick={() => setTimePeriod("weekly")} 
              variant={timePeriod === "weekly" ? "default" : "outline"}
              className="px-3 py-2 text-sm rounded-none border-0 border-x"
            >
              Weekly
            </Button>
            <Button 
              onClick={() => setTimePeriod("monthly")} 
              variant={timePeriod === "monthly" ? "default" : "outline"}
              className="px-3 py-2 text-sm rounded-none border-0"
            >
              Monthly
            </Button>
          </div>
          
          {/* Data export button */}
          <Button variant="outline" onClick={handleExportData} className="flex items-center">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Dashboard summary cards */}
      {activitiesLoading || goalsLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="shadow">
              <CardContent className="p-5 sm:p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <DashboardSummary
          socialMediaTime={socialMediaTime}
          sleepTime={sleepTime}
          readingTime={readingTime}
          expenseAmount={formatMoney(totalExpenses)}
          socialMediaGoalPercentage={socialMediaGoalPercentage}
          sleepGoalPercentage={sleepGoalPercentage}
          readingGoalPercentage={readingGoalPercentage}
          expenseBudgetPercentage={expenseBudgetPercentage}
        />
      )}

      {/* Time allocation chart */}
      <div className="mb-8">
        {activitiesLoading ? (
          <Card className="shadow">
            <CardContent className="p-6">
              <Skeleton className="h-6 w-48 mb-6" />
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
        ) : (
          <TimeAllocationChart 
            data={timeAllocations}
            period={timePeriod}
          />
        )}
      </div>

      {/* Goals and activity sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Daily goals card */}
        <Card className="shadow rounded-lg overflow-hidden">
          <CardContent className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">Daily Goals</h3>
            </div>
            
            {goalsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-2.5 w-full rounded-full" />
                  </div>
                ))}
              </div>
            ) : (
              <GoalList 
                goals={goalProgressList} 
                userId={userId} 
              />
            )}
          </CardContent>
        </Card>

        {/* Current activity card */}
        <Card className="shadow rounded-lg overflow-hidden">
          <ActivityTracker userId={userId} />
        </Card>

        {/* Expense tracker card */}
        <Card className="shadow rounded-lg overflow-hidden">
          <ExpenseTracker 
            userId={userId}
            expenseSummaries={expenseSummaries}
          />
        </Card>
      </div>

      {/* Recent activities */}
      <div className="mb-8">
        {activitiesLoading || expensesLoading ? (
          <Card className="shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="space-y-6">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="flex space-x-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <RecentActivities 
            activities={activities || []} 
            expenses={expenses || []} 
          />
        )}
      </div>
      
      {/* Sync and backup card */}
      <div className="mb-8">
        {devicesLoading ? (
          <Card className="shadow">
            <CardContent className="p-6">
              <Skeleton className="h-6 w-48 mb-4" />
              <div className="space-y-4">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <Skeleton className="h-6 w-12" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Skeleton className="h-10 rounded-md" />
                  <Skeleton className="h-10 rounded-md" />
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <DataSync 
            userId={userId}
            devices={devices}
          />
        )}
      </div>
    </div>
  );
}

// Import this at the top of the file, adding it here to avoid disrupting the flow
import { useQuery } from "@tanstack/react-query";
