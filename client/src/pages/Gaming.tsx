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
import { Gamepad2, Clock, Target, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { hoursMinutesToSeconds } from "@/lib/utils/time";
import { getPastWeekDays } from "@/lib/utils/time";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Gaming() {
  const userId = 1; // For demo, we're using the default user
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("weekly");
  const [manualHours, setManualHours] = useState<number | "">("");
  const [manualMinutes, setManualMinutes] = useState<number | "">("");
  const [gameSelected, setGameSelected] = useState("Select a game");
  const category: ActivityCategory = "gaming";
  
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
  
  // Check if we're over the goal
  const goalExceeded = goalProgress && goalProgress.currentValue > goalProgress.targetValue;
  
  const handleStart = () => {
    start();
  };
  
  const handlePause = () => {
    pause();
  };
  
  const handleSave = () => {
    if (seconds > 0) {
      createActivity.mutate({
        userId,
        category,
        description: gameSelected !== "Select a game" ? gameSelected : undefined,
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
      
      createActivity.mutate({
        userId,
        category,
        description: gameSelected !== "Select a game" ? gameSelected : undefined,
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
  
  // Sample games list
  const games = [
    "Fortnite",
    "Minecraft",
    "League of Legends",
    "Call of Duty",
    "FIFA",
    "Grand Theft Auto V",
    "Apex Legends",
    "Valorant",
    "Among Us",
    "Roblox",
    "Other"
  ];
  
  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold">Gaming Tracking</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Monitor and manage your gaming time
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
              <div className="rounded-full p-3 bg-orange-100 dark:bg-orange-900/20 text-orange-500 dark:text-orange-300 mr-4">
                <Gamepad2 size={24} />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Gaming Time</div>
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
              <div className="rounded-full p-3 bg-blue-100 dark:bg-blue-900/20 text-blue-500 dark:text-blue-300 mr-4">
                <Target size={24} />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Goal Status</div>
                {goalsLoading || !goalProgress ? (
                  <Skeleton className="h-7 w-24 mt-1" />
                ) : (
                  <div className="text-2xl font-semibold flex items-center">
                    {goalExceeded ? (
                      <>
                        <TrendingUp className="text-red-500 dark:text-red-400 mr-1" size={20} />
                        <span className="text-red-600 dark:text-red-400">Over Limit</span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="text-green-500 dark:text-green-400 mr-1" size={20} />
                        <span className="text-green-600 dark:text-green-400">Within Goal</span>
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
            <h3 className="text-lg font-medium mb-4">Gaming Goal</h3>
            <div className="mb-2 flex justify-between">
              <span className="text-sm">{goalProgress.name}</span>
              <span className="text-sm font-medium">
                {goalProgress.currentValue.toFixed(1)}h / {goalProgress.targetValue}h
              </span>
            </div>
            <Progress 
              value={Math.min(goalProgress.percentage, 100)} 
              className={goalExceeded ? "bg-red-200 dark:bg-red-950" : ""}
              indicatorClassName={goalExceeded ? "bg-red-500" : ""}
            />
            {goalExceeded && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Goal Exceeded</AlertTitle>
                <AlertDescription>
                  You've exceeded your gaming time goal. Consider taking a break.
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
            <CardTitle>Usage Over Time</CardTitle>
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
                      fill="#F59E0B" 
                      name="Gaming"
                      radius={[4, 4, 0, 0]} 
                    />
                    {goalProgress && (
                      <Line 
                        type="monotone" 
                        dataKey="goal" 
                        stroke="#3B82F6" 
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
            <CardTitle>Track Gaming</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Game selection */}
            <div className="mb-4">
              <Label htmlFor="game-select" className="text-sm font-medium mb-2 block">Game</Label>
              <Select value={gameSelected} onValueChange={setGameSelected}>
                <SelectTrigger id="game-select">
                  <SelectValue placeholder="Select a game" />
                </SelectTrigger>
                <SelectContent>
                  {games.map(game => (
                    <SelectItem key={game} value={game}>{game}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Stopwatch section */}
            <div className="flex flex-col items-center justify-center py-6 bg-gray-50 dark:bg-gray-700 rounded-lg mb-4">
              <div className="text-4xl font-bold mb-6">{formatTime()}</div>
              <div className="flex space-x-4">
                <Button
                  onClick={handleStart}
                  disabled={isRunning || gameSelected === "Select a game"}
                  variant="default"
                  className={cn("inline-flex items-center", isRunning ? "" : "animate-pulse")}
                >
                  <span className="mr-2">▶</span>
                  {isRunning ? "Running" : "Start"}
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
                  disabled={
                    gameSelected === "Select a game" || 
                    !(
                      (typeof manualHours === "number" && manualHours > 0) || 
                      (typeof manualMinutes === "number" && manualMinutes > 0)
                    )
                  }
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
          <CardTitle>Recent Gaming Sessions</CardTitle>
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
                      {activity.description || "Gaming Session"}
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
              No gaming sessions recorded yet
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Game breakdown */}
      <Card className="shadow mb-8">
        <CardHeader>
          <CardTitle>Game Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {activitiesLoading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : activities && activities.length > 0 ? (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={getGameBreakdownData(activities)}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={(value) => `${value}h`} />
                  <YAxis type="category" dataKey="name" width={120} />
                  <Tooltip formatter={(value) => [`${value} hours`, 'Time Spent']} />
                  <Bar 
                    dataKey="hours" 
                    fill="#8B5CF6" 
                    name="Hours Played"
                    radius={[0, 4, 4, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
              No gaming data available
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
      goal: 1, // Default goal value (1 hour per day)
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

// Prepare data for game breakdown chart
function getGameBreakdownData(activities: any[]) {
  const games: Record<string, number> = {};
  
  // Sum up durations by game
  for (const activity of activities) {
    const game = activity.description || "Unspecified";
    if (!games[game]) {
      games[game] = 0;
    }
    games[game] += activity.duration / 3600; // Convert to hours
  }
  
  // Convert to chart data format
  return Object.entries(games)
    .map(([name, hours]) => ({ name, hours }))
    .sort((a, b) => b.hours - a.hours) // Sort by hours (descending)
    .slice(0, 7); // Get top 7 games only
}
