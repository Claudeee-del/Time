import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTimeTracking } from "@/hooks/use-time-tracking";
import { useGoals } from "@/hooks/use-goals";
import { ActivityCategory, TimePeriod } from "@/types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { useStopwatch } from "@/hooks/use-stopwatch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Video, Clock, Target, TrendingUp, TrendingDown, Presentation, School } from "lucide-react";
import { hoursMinutesToSeconds } from "@/lib/utils/time";
import { getPastWeekDays } from "@/lib/utils/time";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Lectures() {
  const userId = 1; // For demo, we're using the default user
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("weekly");
  const [manualHours, setManualHours] = useState<number | "">("");
  const [manualMinutes, setManualMinutes] = useState<number | "">("");
  const [lectureTitle, setLectureTitle] = useState("");
  const [lectureType, setLectureType] = useState("online");
  const category: ActivityCategory = "lectures";
  
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
  
  // Calculate daily average
  const totalSeconds = activities ? activities.reduce((sum, activity) => sum + activity.duration, 0) : 0;
  const dayCount = 7; // Assuming we're looking at a week's worth of data
  const dailyAverageSeconds = totalSeconds / dayCount;
  
  // Check if we're meeting the goal
  const meetingGoal = goalProgress && goalProgress.currentValue >= goalProgress.targetValue;
  
  const handleStart = () => {
    start();
  };
  
  const handlePause = () => {
    pause();
  };
  
  const handleSave = () => {
    if (seconds > 0) {
      const description = lectureTitle 
        ? `${lectureTitle} (${lectureType === 'online' ? 'Online' : 'Offline'})`
        : undefined;
        
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
      const now = new Date();
      
      const description = lectureTitle 
        ? `${lectureTitle} (${lectureType === 'online' ? 'Online' : 'Offline'})`
        : undefined;
        
      createActivity.mutate({
        userId,
        category,
        description,
        startTime: new Date(now.getTime() - totalSeconds * 1000),
        endTime: now,
        duration: totalSeconds,
      }, {
        onSuccess: () => {
          setManualHours("");
          setManualMinutes("");
        }
      });
    }
  };
  
  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold">Lecture Tracking</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Monitor your time spent on lectures
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
              <div className="rounded-full p-3 bg-blue-100 dark:bg-blue-900/20 text-blue-500 dark:text-blue-300 mr-4">
                <Video size={24} />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Lecture Time</div>
                {activitiesLoading ? (
                  <Skeleton className="h-7 w-24 mt-1" />
                ) : (
                  <div className="text-2xl font-semibold">{formatDuration(totalSeconds)}</div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Daily average */}
        <Card className="shadow">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="rounded-full p-3 bg-amber-100 dark:bg-amber-900/20 text-amber-500 dark:text-amber-300 mr-4">
                <Clock size={24} />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Daily Average</div>
                {activitiesLoading ? (
                  <Skeleton className="h-7 w-24 mt-1" />
                ) : (
                  <div className="text-2xl font-semibold">{formatDuration(dailyAverageSeconds)}</div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Goal status */}
        <Card className="shadow">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="rounded-full p-3 bg-teal-100 dark:bg-teal-900/20 text-teal-500 dark:text-teal-300 mr-4">
                <Target size={24} />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Goal Status</div>
                {goalsLoading || !goalProgress ? (
                  <Skeleton className="h-7 w-24 mt-1" />
                ) : (
                  <div className="text-2xl font-semibold flex items-center">
                    {meetingGoal ? (
                      <>
                        <TrendingUp className="text-green-500 dark:text-green-400 mr-1" size={20} />
                        <span className="text-green-600 dark:text-green-400">Meeting Goal</span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="text-amber-500 dark:text-amber-400 mr-1" size={20} />
                        <span className="text-amber-600 dark:text-amber-400">Below Goal</span>
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
            <h3 className="text-lg font-medium mb-4">Lecture Goal</h3>
            <div className="mb-2 flex justify-between">
              <span className="text-sm">{goalProgress.name}</span>
              <span className="text-sm font-medium">
                {goalProgress.currentValue.toFixed(1)}h / {goalProgress.targetValue}h
              </span>
            </div>
            <Progress 
              value={Math.min(goalProgress.percentage, 100)} 
              className="bg-blue-200/50 dark:bg-blue-950/50"
              indicatorClassName={meetingGoal ? "bg-blue-500" : "bg-amber-500"}
            />
            {meetingGoal && (
              <Alert className="mt-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-900">
                <School className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                <AlertTitle className="text-blue-800 dark:text-blue-300">Great Progress!</AlertTitle>
                <AlertDescription className="text-blue-700 dark:text-blue-400">
                  You're keeping up with your lecture attendance goal. Keep learning!
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Activity charts and tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Activity chart */}
        <Card className="shadow lg:col-span-2">
          <CardHeader>
            <CardTitle>Lectures Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            {activitiesLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `${value}h`} />
                    <Tooltip formatter={(value) => [`${value} hours`, 'Time Spent']} />
                    <Bar 
                      dataKey="hours" 
                      fill="#3B82F6" 
                      name="Lectures"
                      radius={[4, 4, 0, 0]} 
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
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Activity tracker */}
        <Card className="shadow">
          <CardHeader>
            <CardTitle>Track Lectures</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Lecture details */}
            <div className="space-y-4 mb-4">
              <div>
                <Label htmlFor="lecture-title" className="text-sm font-medium mb-2 block">Lecture Title (Optional)</Label>
                <Input
                  id="lecture-title"
                  placeholder="Enter lecture title or subject"
                  value={lectureTitle}
                  onChange={(e) => setLectureTitle(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="lecture-type" className="text-sm font-medium mb-2 block">Lecture Type</Label>
                <Select value={lectureType} onValueChange={setLectureType}>
                  <SelectTrigger id="lecture-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="offline">Offline</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Stopwatch section */}
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
                  {isRunning ? "Recording..." : "Start"}
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
              <h4 className="text-sm font-medium mb-2">Manual Time Entry</h4>
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
      
      {/* Recent sessions */}
      <Card className="shadow mb-8">
        <CardHeader>
          <CardTitle>Lecture History</CardTitle>
        </CardHeader>
        <CardContent>
          {activitiesLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : activities && activities.length > 0 ? (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {activities.slice(0, 5).map((activity) => (
                <div key={activity.id} className="py-3 flex justify-between items-center">
                  <div>
                    <div className="text-sm font-medium">
                      {activity.description ? activity.description : "Lecture Session"}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(activity.startTime).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-sm font-medium">
                    {formatDuration(activity.duration)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
              No lecture sessions recorded yet
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Lecture type breakdown */}
      <Card className="shadow mb-8">
        <CardHeader>
          <CardTitle>Lecture Type Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {activitiesLoading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : activities && activities.length > 0 ? (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={getLectureTypeBreakdown(activities)}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={(value) => `${value}h`} />
                  <YAxis type="category" dataKey="name" width={100} />
                  <Tooltip formatter={(value) => [`${value} hours`, 'Time Spent']} />
                  <Bar 
                    dataKey="hours" 
                    fill="#3B82F6" 
                    name="Hours"
                    radius={[0, 4, 4, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
              No lecture data available
            </div>
          )}
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
      goal: 2, // Default goal value (2 hours per day)
    });
  }
  
  // Sum up the durations for each day
  for (const activity of activities) {
    const date = new Date(activity.startTime);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    const dayIndex = dayNames.indexOf(dayName);
    
    if (dayIndex !== -1) {
      // Convert seconds to hours
      result[dayIndex].hours += activity.duration / 3600;
    }
  }
  
  return result;
}

// Get lecture type breakdown
function getLectureTypeBreakdown(activities: any[]) {
  let onlineHours = 0;
  let offlineHours = 0;
  let unspecifiedHours = 0;
  
  for (const activity of activities) {
    const description = activity.description?.toLowerCase() || '';
    const hours = activity.duration / 3600;
    
    if (description.includes('online')) {
      onlineHours += hours;
    } else if (description.includes('offline')) {
      offlineHours += hours;
    } else {
      unspecifiedHours += hours;
    }
  }
  
  return [
    { name: 'Online', hours: onlineHours },
    { name: 'Offline', hours: offlineHours },
    { name: 'Unspecified', hours: unspecifiedHours },
  ];
}
