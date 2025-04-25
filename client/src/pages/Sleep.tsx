import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTimeTracking } from "@/hooks/use-time-tracking";
import { useGoals } from "@/hooks/use-goals";
import { ActivityCategory, TimePeriod } from "@/types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell } from "recharts";
import { useStopwatch } from "@/hooks/use-stopwatch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Moon, Clock, Target, TrendingUp, TrendingDown, Bed, Calendar, AlertCircle } from "lucide-react";
import { hoursMinutesToSeconds } from "@/lib/utils/time";
import { getPastWeekDays } from "@/lib/utils/time";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export default function Sleep() {
  const userId = 1; // For demo, we're using the default user
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("weekly");
  const [manualHours, setManualHours] = useState<number | "">("");
  const [manualMinutes, setManualMinutes] = useState<number | "">("");
  const [sleepQuality, setSleepQuality] = useState<string>("good");
  const [sleepDate, setSleepDate] = useState<Date>(new Date());
  const category: ActivityCategory = "sleep";
  
  const { 
    getActivities, 
    createActivity, 
    calculateTimeAllocations, 
    formatDuration 
  } = useTimeTracking(userId);
  
  const { getGoals, calculateGoalProgress } = useGoals(userId);
  
  const { 
    data: activities,
    isLoading: activitiesLoading
  } = getActivities(category);
  
  const {
    data: goals,
    isLoading: goalsLoading
  } = getGoals(category);
  
  const { seconds, isRunning, start, pause, reset, formatTime } = useStopwatch();
  
  // Process the data for charts
  const weeklyData = activities ? getWeeklyData(activities) : [];
  const goalProgress = goals ? calculateGoalProgress(goals)[0] : null;
  
  // Calculate average sleep time
  const totalSeconds = activities ? activities.reduce((sum, activity) => sum + activity.duration, 0) : 0;
  const sessionCount = activities ? activities.length : 0;
  const averageSleepSeconds = sessionCount > 0 ? totalSeconds / sessionCount : 0;
  
  // Check if we've met the sleep goal
  const meetingGoal = goalProgress && goalProgress.currentValue >= goalProgress.targetValue * 0.9; // Allow 90% as acceptable
  const exceededGoal = goalProgress && goalProgress.currentValue >= goalProgress.targetValue;
  
  const handleStart = () => {
    start();
  };
  
  const handlePause = () => {
    pause();
  };
  
  const handleSave = () => {
    if (seconds > 0) {
      const description = `Sleep quality: ${sleepQuality}`;
          
      createActivity.mutate({
        userId,
        category,
        description,
        startTime: new Date(Date.now() - seconds * 1000),
        endTime: new Date(),
        duration: seconds,
      }, {
        onSuccess: () => {
          reset();
        }
      });
    }
  };
  
  const handleManualAdd = () => {
    const hours = typeof manualHours === "number" ? manualHours : 0;
    const minutes = typeof manualMinutes === "number" ? manualMinutes : 0;
    
    if (hours > 0 || minutes > 0) {
      const totalSeconds = hoursMinutesToSeconds(hours, minutes);
      
      // Create a date object for the selected sleep date, at midnight
      const bedTime = new Date(sleepDate);
      bedTime.setHours(23, 0, 0, 0); // Set to 11 PM
      
      // Calculate wake up time by adding the sleep duration
      const wakeUpTime = new Date(bedTime.getTime() + totalSeconds * 1000);
      
      const description = `Sleep quality: ${sleepQuality}`;
          
      createActivity.mutate({
        userId,
        category,
        description,
        startTime: bedTime,
        endTime: wakeUpTime,
        duration: totalSeconds,
      }, {
        onSuccess: () => {
          setManualHours("");
          setManualMinutes("");
        }
      });
    }
  };
  
  const qualityOptions = [
    { value: "poor", label: "Poor" },
    { value: "fair", label: "Fair" },
    { value: "good", label: "Good" },
    { value: "excellent", label: "Excellent" },
  ];
  
  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold">Sleep Tracking</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Monitor your sleep patterns and quality
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
        {/* Total sleep */}
        <Card className="shadow">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="rounded-full p-3 bg-indigo-100 dark:bg-indigo-900/20 text-indigo-500 dark:text-indigo-300 mr-4">
                <Moon size={24} />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Sleep Time</div>
                {activitiesLoading ? (
                  <Skeleton className="h-7 w-24 mt-1" />
                ) : (
                  <div className="text-2xl font-semibold">{formatDuration(totalSeconds)}</div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Average sleep */}
        <Card className="shadow">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="rounded-full p-3 bg-blue-100 dark:bg-blue-900/20 text-blue-500 dark:text-blue-300 mr-4">
                <Clock size={24} />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Average Sleep</div>
                {activitiesLoading ? (
                  <Skeleton className="h-7 w-24 mt-1" />
                ) : (
                  <div className="text-2xl font-semibold">{formatDuration(averageSleepSeconds)}</div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Goal status */}
        <Card className="shadow">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="rounded-full p-3 bg-amber-100 dark:bg-amber-900/20 text-amber-500 dark:text-amber-300 mr-4">
                <Target size={24} />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Sleep Goal</div>
                {goalsLoading || !goalProgress ? (
                  <Skeleton className="h-7 w-24 mt-1" />
                ) : (
                  <div className="text-2xl font-semibold flex items-center">
                    {exceededGoal ? (
                      <>
                        <TrendingUp className="text-green-500 dark:text-green-400 mr-1" size={20} />
                        <span className="text-green-600 dark:text-green-400">Goal Met</span>
                      </>
                    ) : meetingGoal ? (
                      <>
                        <TrendingUp className="text-amber-500 dark:text-amber-400 mr-1" size={20} />
                        <span className="text-amber-600 dark:text-amber-400">Almost There</span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="text-red-500 dark:text-red-400 mr-1" size={20} />
                        <span className="text-red-600 dark:text-red-400">Below Goal</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Goal progress */}
      {(goalsLoading || !goalProgress) ? (
        <Card className="shadow mb-8">
          <CardContent className="p-6">
            <Skeleton className="h-6 w-48 mb-4" />
            <Skeleton className="h-5 w-full mb-2" />
            <Skeleton className="h-4 w-32" />
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow mb-8">
          <CardContent className="p-6">
            <h3 className="text-lg font-medium mb-4">Sleep Goal</h3>
            <div className="mb-2 flex justify-between">
              <span className="text-sm">{goalProgress.name}</span>
              <span className="text-sm font-medium">
                {goalProgress.currentValue.toFixed(1)}h / {goalProgress.targetValue}h
              </span>
            </div>
            <Progress 
              value={Math.min(goalProgress.percentage, 100)} 
              className={cn("bg-indigo-200/50 dark:bg-indigo-950/50", 
                exceededGoal 
                  ? "bg-green-500" 
                  : meetingGoal 
                    ? "bg-amber-500" 
                    : "bg-red-500"
              )}
            />
            {!meetingGoal && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Sleep Deficit</AlertTitle>
                <AlertDescription>
                  You're not getting enough sleep. Aim for {goalProgress.targetValue} hours per night for optimal health.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Sleep charts and tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Sleep chart */}
        <Card className="shadow lg:col-span-2">
          <CardHeader>
            <CardTitle>Sleep Duration</CardTitle>
          </CardHeader>
          <CardContent>
            {activitiesLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `${value}h`} />
                    <Tooltip formatter={(value) => [`${value} hours`, 'Sleep Duration']} />
                    <Area 
                      type="monotone" 
                      dataKey="hours" 
                      fill="#818CF8" 
                      stroke="#4F46E5" 
                      name="Sleep"
                    />
                    {goalProgress && (
                      <Line 
                        type="monotone" 
                        dataKey="goal" 
                        stroke="#10B981" 
                        strokeWidth={2} 
                        name="Goal" 
                        dot={false} 
                      />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Sleep tracker */}
        <Card className="shadow">
          <CardHeader>
            <CardTitle>Log Sleep</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Sleep quality */}
            <div className="mb-4">
              <Label htmlFor="sleep-quality" className="text-sm font-medium mb-2 block">Sleep Quality</Label>
              <div className="grid grid-cols-2 gap-2">
                {qualityOptions.map(option => (
                  <Button
                    key={option.value}
                    type="button"
                    variant={sleepQuality === option.value ? "default" : "outline"}
                    onClick={() => setSleepQuality(option.value)}
                    className="justify-center"
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Sleep date */}
            <div className="mb-4">
              <Label htmlFor="sleep-date" className="text-sm font-medium mb-2 block">Sleep Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {sleepDate ? format(sleepDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={sleepDate}
                    onSelect={(date) => date && setSleepDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            {/* Stopwatch section for real-time tracking */}
            <div className="flex flex-col items-center justify-center py-6 bg-gray-50 dark:bg-gray-700 rounded-lg mb-4">
              <div className="text-4xl font-bold mb-6">{formatTime()}</div>
              <div className="flex space-x-4">
                <Button
                  onClick={handleStart}
                  disabled={isRunning}
                  variant="default"
                  className={cn("inline-flex items-center", isRunning ? "" : "animate-pulse")}
                >
                  <span className="mr-2">▶</span>
                  {isRunning ? "Sleeping..." : "Start"}
                </Button>
                <Button
                  onClick={handlePause}
                  disabled={!isRunning}
                  variant="outline"
                >
                  <span className="mr-2">⏸️</span>
                  Pause
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={seconds === 0}
                  variant="outline"
                >
                  <span className="mr-2">💾</span>
                  Save
                </Button>
              </div>
            </div>
            
            {/* Manual entry section */}
            <div>
              <h4 className="text-sm font-medium mb-2">Manual Sleep Entry</h4>
              <div className="flex space-x-2">
                <div>
                  <Label htmlFor="hours" className="sr-only">Hours</Label>
                  <Input
                    type="number"
                    id="hours"
                    min="0"
                    max="24"
                    placeholder="0"
                    value={manualHours}
                    onChange={(e) => setManualHours(e.target.value === "" ? "" : Math.min(24, parseInt(e.target.value)))}
                  />
                  <span className="text-xs text-gray-500 dark:text-gray-400">Hours</span>
                </div>
                <div>
                  <Label htmlFor="minutes" className="sr-only">Minutes</Label>
                  <Input
                    type="number"
                    id="minutes"
                    min="0"
                    max="59"
                    placeholder="0"
                    value={manualMinutes}
                    onChange={(e) => setManualMinutes(e.target.value === "" ? "" : Math.min(59, parseInt(e.target.value)))}
                  />
                  <span className="text-xs text-gray-500 dark:text-gray-400">Minutes</span>
                </div>
                <Button
                  onClick={handleManualAdd}
                  disabled={!(
                    (typeof manualHours === "number" && manualHours > 0) || 
                    (typeof manualMinutes === "number" && manualMinutes > 0)
                  )}
                  variant="default"
                  className="shrink-0"
                >
                  Add
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Sleep quality and recent sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Sleep quality chart */}
        <Card className="shadow">
          <CardHeader>
            <CardTitle>Sleep Quality</CardTitle>
          </CardHeader>
          <CardContent>
            {activitiesLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : activities && activities.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getSleepQualityData(activities)}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {getSleepQualityData(activities).map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={
                            entry.name === "Excellent" ? "#10B981" :
                            entry.name === "Good" ? "#3B82F6" :
                            entry.name === "Fair" ? "#F59E0B" :
                            "#EF4444"
                          } 
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [`${value} nights`, name]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                No sleep quality data available
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Recent sleep sessions */}
        <Card className="shadow">
          <CardHeader>
            <CardTitle>Recent Sleep Records</CardTitle>
          </CardHeader>
          <CardContent>
            {activitiesLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : activities && activities.length > 0 ? (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {activities.slice(0, 5).map((activity) => {
                  const quality = activity.description
                    ? activity.description.match(/quality:\s*(\w+)/i)?.[1] || "Unknown"
                    : "Unknown";
                    
                  const qualityColor = 
                    quality.toLowerCase() === "excellent" ? "text-green-500 dark:text-green-400" :
                    quality.toLowerCase() === "good" ? "text-blue-500 dark:text-blue-400" :
                    quality.toLowerCase() === "fair" ? "text-amber-500 dark:text-amber-400" :
                    "text-red-500 dark:text-red-400";
                    
                  return (
                    <div key={activity.id} className="py-3 flex justify-between items-center">
                      <div>
                        <div className="text-sm font-medium flex items-center">
                          <Bed className="mr-2 h-4 w-4" />
                          <span>Sleep Session</span>
                          <span className={`ml-2 ${qualityColor} capitalize`}>({quality})</span>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {format(new Date(activity.startTime), "PPP")}
                        </div>
                      </div>
                      <div className="text-sm font-medium">
                        {formatDuration(activity.duration)}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                No sleep records yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Sleep tips */}
      <Card className="shadow mb-8">
        <CardHeader>
          <CardTitle>Healthy Sleep Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex space-x-3">
              <Moon className="text-indigo-500 dark:text-indigo-400 flex-shrink-0" />
              <p className="text-sm">Aim for 7-9 hours of sleep every night.</p>
            </div>
            <div className="flex space-x-3">
              <Moon className="text-indigo-500 dark:text-indigo-400 flex-shrink-0" />
              <p className="text-sm">Stick to a consistent sleep schedule, even on weekends.</p>
            </div>
            <div className="flex space-x-3">
              <Moon className="text-indigo-500 dark:text-indigo-400 flex-shrink-0" />
              <p className="text-sm">Avoid screens 1 hour before bedtime.</p>
            </div>
            <div className="flex space-x-3">
              <Moon className="text-indigo-500 dark:text-indigo-400 flex-shrink-0" />
              <p className="text-sm">Keep your bedroom cool, dark, and quiet.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Prepare data for the weekly chart
function getWeeklyData(activities: any[]) {
  const dayNames = getPastWeekDays();
  const result = [];
  
  // Initialize with zero values
  for (const day of dayNames) {
    result.push({
      name: day,
      hours: 0,
      goal: 8, // Default goal value (8 hours per day)
    });
  }
  
  // Group activities by day and calculate total sleep time
  const sleepByDay: Record<string, number> = {};
  
  for (const activity of activities) {
    const date = new Date(activity.startTime);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    if (!sleepByDay[dayName]) {
      sleepByDay[dayName] = 0;
    }
    sleepByDay[dayName] += activity.duration / 3600; // Convert to hours
  }
  
  // Populate the chart data
  for (const [day, hours] of Object.entries(sleepByDay)) {
    const index = dayNames.indexOf(day);
    if (index !== -1) {
      result[index].hours = hours;
    }
  }
  
  return result;
}

// Get sleep quality data
function getSleepQualityData(activities: any[]) {
  const qualityCounts: Record<string, number> = {
    "Excellent": 0,
    "Good": 0,
    "Fair": 0,
    "Poor": 0,
  };
  
  for (const activity of activities) {
    if (activity.description) {
      const match = activity.description.match(/quality:\s*(\w+)/i);
      if (match && match[1]) {
        const quality = match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
        if (qualityCounts[quality] !== undefined) {
          qualityCounts[quality]++;
        }
      }
    }
  }
  
  return Object.entries(qualityCounts)
    .map(([name, value]) => ({ name, value }))
    .filter(item => item.value > 0); // Only include qualities that have at least one entry
}

// Create simple date picker components using Popover
const SleepDatePicker = (props: any) => {
  return <Popover {...props} />;
}

const SleepDatePickerTrigger = (props: any) => {
  return <PopoverTrigger {...props} />;
}

const SleepDatePickerContent = (props: any) => {
  return <PopoverContent {...props} />;
}
