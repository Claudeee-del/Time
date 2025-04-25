import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTimeTracking } from "@/hooks/use-time-tracking";
import { useGoals } from "@/hooks/use-goals";
import { ActivityCategory, TimePeriod } from "@/types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { useStopwatch } from "@/hooks/use-stopwatch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock, Target, TrendingUp, TrendingDown, Moon, Calendar, AlertCircle, Heart } from "lucide-react";
import { hoursMinutesToSeconds } from "@/lib/utils/time";
import { getPastWeekDays } from "@/lib/utils/time";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Salah() {
  const userId = 1; // Default user ID
  const category: ActivityCategory = "salah";
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("weekly");
  const [prayerType, setPrayerType] = useState<string>("fajr");
  const [description, setDescription] = useState<string>("");
  
  const timeTracking = useTimeTracking(userId);
  const goalTracking = useGoals(userId);
  
  // Get the data using the hook methods
  const activitiesQuery = timeTracking.getActivities(category);
  const goalsQuery = goalTracking.getGoals(category);
  
  // Access loading states and data
  const activitiesLoading = activitiesQuery.isLoading;
  const goalsLoading = goalsQuery.isLoading;
  
  // Create activity function
  const { createActivity } = timeTracking;
  const { createGoal } = goalTracking;
  
  // Filter for this category's data
  const salahActivities = activitiesQuery.data || [];
  const salahGoals = goalsQuery.data || [];
  
  const { seconds, isRunning, start, pause, reset, formatTime } = useStopwatch();
  
  const handleStartTracking = () => {
    start();
  };
  
  const handleStopTracking = () => {
    pause();
  };
  
  const handleSaveTracking = () => {
    if (seconds > 0) {
      createActivity.mutate({
        userId,
        category,
        description: `type:${prayerType},${description ? `notes:${description}` : ''}`,
        startTime: new Date(Date.now() - seconds * 1000),
        endTime: new Date(),
        duration: seconds,
      }, {
        onSuccess: () => {
          reset();
          setDescription("");
        }
      });
    }
  };
  
  const handleAddManualTime = (hours: number, minutes: number) => {
    if (hours > 0 || minutes > 0) {
      const totalSeconds = hoursMinutesToSeconds(hours, minutes);
      createActivity.mutate({
        userId,
        category,
        description: `type:${prayerType},${description ? `notes:${description}` : ''}`,
        startTime: new Date(Date.now() - totalSeconds * 1000),
        endTime: new Date(),
        duration: totalSeconds,
      }, {
        onSuccess: () => {
          setDescription("");
        }
      });
    }
  };
  
  // Data transformation for charts
  const weeklyData = getWeeklyData(salahActivities);
  const prayerTypeData = getPrayerTypeData(salahActivities);
  
  const totalDuration = salahActivities.reduce((sum, activity) => sum + activity.duration, 0);
  const avgDuration = salahActivities.length > 0 
    ? Math.round(totalDuration / salahActivities.length) 
    : 0;
  
  // Calculate total prayers this week
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  
  const prayersThisWeek = salahActivities.filter(
    activity => new Date(activity.startTime) >= startOfWeek
  ).length;
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold">Salah Tracking</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Monitor your prayer time and consistency
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex items-center space-x-3">
          {/* Time period filter */}
          <Tabs defaultValue="weekly" onValueChange={(value) => setTimePeriod(value as TimePeriod)}>
            <TabsList>
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total time */}
        <Card className="shadow">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="rounded-full p-3 bg-green-100 dark:bg-green-900/20 text-green-500 dark:text-green-300 mr-4">
                <Heart size={24} />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Prayer Time</div>
                {activitiesLoading ? (
                  <Skeleton className="h-7 w-24 mt-1" />
                ) : (
                  <div className="text-2xl font-bold">
                    {Math.floor(totalDuration / 3600)}h {Math.floor((totalDuration % 3600) / 60)}m
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Prayer count */}
        <Card className="shadow">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="rounded-full p-3 bg-blue-100 dark:bg-blue-900/20 text-blue-500 dark:text-blue-300 mr-4">
                <Moon size={24} />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Prayers This Week</div>
                {activitiesLoading ? (
                  <Skeleton className="h-7 w-24 mt-1" />
                ) : (
                  <div className="text-2xl font-bold">{prayersThisWeek}</div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Average duration */}
        <Card className="shadow">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="rounded-full p-3 bg-purple-100 dark:bg-purple-900/20 text-purple-500 dark:text-purple-300 mr-4">
                <Clock size={24} />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg. Prayer Duration</div>
                {activitiesLoading ? (
                  <Skeleton className="h-7 w-24 mt-1" />
                ) : (
                  <div className="text-2xl font-bold">
                    {Math.floor(avgDuration / 60)}m {avgDuration % 60}s
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Weekly chart */}
        <Card className="shadow">
          <CardHeader>
            <CardTitle className="text-lg">Weekly Prayer Time</CardTitle>
          </CardHeader>
          <CardContent>
            {activitiesLoading ? (
              <div className="h-64 flex items-center justify-center">
                <Skeleton className="h-64 w-full" />
              </div>
            ) : salahActivities.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center p-4">
                <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-muted-foreground">No prayer data available yet.</p>
                <p className="text-sm text-muted-foreground mt-1">Start tracking your prayers to see statistics here.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis unit="m" />
                  <Tooltip 
                    formatter={(value: number) => [`${value} minutes`, 'Duration']}
                    labelFormatter={(label) => `Day: ${label}`}
                  />
                  <Bar dataKey="duration" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        
        {/* Prayer type breakdown */}
        <Card className="shadow">
          <CardHeader>
            <CardTitle className="text-lg">Prayer Type Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {activitiesLoading ? (
              <div className="h-64 flex items-center justify-center">
                <Skeleton className="h-64 w-full" />
              </div>
            ) : salahActivities.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center p-4">
                <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-muted-foreground">No prayer data available yet.</p>
                <p className="text-sm text-muted-foreground mt-1">Start tracking different prayer types to see the breakdown.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={prayerTypeData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={40}
                    dataKey="value"
                    nameKey="name"
                    label={(entry) => `${entry.name}: ${entry.value}`}
                  >
                    {prayerTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getRandomColor(entry.name)} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} minutes`, 'Duration']} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Prayer tracking section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="shadow">
          <CardHeader>
            <CardTitle className="text-lg">Track Prayer Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="prayer-type">Prayer Type</Label>
                <Select
                  value={prayerType}
                  onValueChange={setPrayerType}
                >
                  <SelectTrigger id="prayer-type" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fajr">Fajr</SelectItem>
                    <SelectItem value="dhuhr">Dhuhr</SelectItem>
                    <SelectItem value="asr">Asr</SelectItem>
                    <SelectItem value="maghrib">Maghrib</SelectItem>
                    <SelectItem value="isha">Isha</SelectItem>
                    <SelectItem value="tahajjud">Tahajjud</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="prayer-notes">Notes (Optional)</Label>
                <Input
                  id="prayer-notes"
                  placeholder="Additional notes about your prayer"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div className="flex flex-col items-center py-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-3xl font-bold mb-4">{formatTime()}</div>
                <div className="flex space-x-3">
                  <Button
                    onClick={handleStartTracking}
                    disabled={isRunning}
                    variant="default"
                  >
                    Start
                  </Button>
                  <Button
                    onClick={handleStopTracking}
                    disabled={!isRunning}
                    variant="outline"
                  >
                    Stop
                  </Button>
                  <Button
                    onClick={handleSaveTracking}
                    disabled={seconds === 0}
                    variant="outline"
                  >
                    Save
                  </Button>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-end space-y-3 sm:space-y-0 sm:space-x-3 mt-2">
                <div className="flex-1">
                  <Label htmlFor="manual-minutes">Add Prayer Time Manually</Label>
                  <div className="flex space-x-2 mt-1">
                    <Input
                      id="manual-minutes"
                      type="number"
                      min="0"
                      max="60"
                      placeholder="Minutes"
                      className="flex-1"
                    />
                  </div>
                </div>
                <Button 
                  onClick={() => {
                    const minutesInput = document.getElementById('manual-minutes') as HTMLInputElement;
                    const minutes = parseInt(minutesInput.value) || 0;
                    handleAddManualTime(0, minutes);
                    minutesInput.value = '';
                  }}
                  className="w-full sm:w-auto"
                >
                  Add
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Recent prayers */}
        <Card className="shadow">
          <CardHeader>
            <CardTitle className="text-lg">Recent Prayers</CardTitle>
          </CardHeader>
          <CardContent>
            {activitiesLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map(i => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : salahActivities.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center p-6">
                <Heart className="h-12 w-12 text-gray-400 mb-3" />
                <p className="text-muted-foreground">No prayer data available yet.</p>
                <p className="text-sm text-muted-foreground mt-1">Your recent prayers will appear here.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {salahActivities.slice(0, 5).map((activity) => {
                  const prayerType = activity.description
                    ? activity.description.match(/type:\s*(\w+)/i)?.[1] || "Unknown"
                    : "Unknown";
                    
                  return (
                    <div key={activity.id} className="py-3 flex justify-between items-center">
                      <div>
                        <div className="text-sm font-medium flex items-center">
                          <Heart className="mr-2 h-4 w-4" />
                          <span className="capitalize">{prayerType} Prayer</span>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(activity.startTime).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-sm font-medium">
                        {Math.floor(activity.duration / 60)}m {activity.duration % 60}s
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Goals section */}
      <Card className="shadow mb-8">
        <CardHeader>
          <CardTitle className="text-lg">Prayer Goals</CardTitle>
        </CardHeader>
        <CardContent>
          {goalsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : salahGoals.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-6">
              <Target className="h-12 w-12 text-gray-400 mb-3" />
              <p className="text-muted-foreground">No prayer goals set yet.</p>
              <Button 
                className="mt-4"
                onClick={() => {
                  createGoal.mutate({
                    userId,
                    name: "Pray 5 times daily",
                    category,
                    targetValue: 5,
                    currentValue: 0,
                    unit: "prayers",
                    active: true,
                  });
                }}
              >
                Set Default Goal
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {salahGoals.map((goal) => {
                const percentage = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
                return (
                  <div key={goal.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{goal.name}</span>
                      <span className="text-sm text-gray-500">
                        {goal.currentValue} / {goal.targetValue} {goal.unit}
                      </span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  createGoal.mutate({
                    userId,
                    name: "New Prayer Goal",
                    category,
                    targetValue: 5,
                    currentValue: 0,
                    unit: "prayers",
                    active: true,
                  });
                }}
              >
                Add New Goal
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function getWeeklyData(activities: any[]) {
  const days = getPastWeekDays();
  const dayMap = days.reduce((acc, day) => {
    acc[day.date] = { name: day.label, duration: 0 };
    return acc;
  }, {} as Record<string, { name: string, duration: number }>);
  
  activities.forEach(activity => {
    const date = new Date(activity.startTime);
    const dateStr = date.toISOString().split('T')[0];
    
    if (dayMap[dateStr]) {
      // Convert seconds to minutes for display
      dayMap[dateStr].duration += activity.duration / 60;
    }
  });
  
  return Object.values(dayMap);
}

function getPrayerTypeData(activities: any[]) {
  const prayerTypes: Record<string, number> = {};
  
  activities.forEach(activity => {
    if (activity.description) {
      const typeMatch = activity.description.match(/type:\s*(\w+)/i);
      const type = typeMatch ? typeMatch[1] : "Unknown";
      
      if (!prayerTypes[type]) {
        prayerTypes[type] = 0;
      }
      
      // Convert seconds to minutes for display
      prayerTypes[type] += activity.duration / 60;
    } else {
      if (!prayerTypes["Unknown"]) {
        prayerTypes["Unknown"] = 0;
      }
      prayerTypes["Unknown"] += activity.duration / 60;
    }
  });
  
  return Object.entries(prayerTypes).map(([name, value]) => ({
    name,
    value: Math.round(value),
  }));
}

function getRandomColor(key: string) {
  const colors = [
    '#10b981', // Green
    '#3b82f6', // Blue
    '#8b5cf6', // Purple
    '#ef4444', // Red
    '#f59e0b', // Amber
    '#6366f1', // Indigo
    '#ec4899', // Pink
  ];
  
  // Simple hash function to get consistent colors
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = key.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}