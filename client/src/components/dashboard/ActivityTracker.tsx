import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStopwatch } from "@/hooks/use-stopwatch";
import { useTimeTracking } from "@/hooks/use-time-tracking";
import { ActivityCategory } from "@/types";
import { useState } from "react";
import { hoursMinutesToSeconds } from "@/lib/utils/time";
import { cn } from "@/lib/utils";

interface ActivityTrackerProps {
  userId: number;
}

export default function ActivityTracker({ userId }: ActivityTrackerProps) {
  const [selectedCategory, setSelectedCategory] = useState<ActivityCategory>("reading");
  const [manualHours, setManualHours] = useState<number | "">("");
  const [manualMinutes, setManualMinutes] = useState<number | "">("");
  const { seconds, isRunning, start, pause, reset, formatTime } = useStopwatch();
  const { createActivity } = useTimeTracking(userId);

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
        category: selectedCategory,
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
        category: selectedCategory,
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
    <div className="px-4 py-5 sm:p-6">
      <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100 mb-4">Track Activity</h3>
      
      {/* Activity selection dropdown */}
      <div className="mb-4">
        <Label htmlFor="activity-select">Activity Type</Label>
        <Select 
          value={selectedCategory} 
          onValueChange={(value) => setSelectedCategory(value as ActivityCategory)}
        >
          <SelectTrigger id="activity-select" className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="reading">Reading</SelectItem>
            <SelectItem value="social_media">Social Media</SelectItem>
            <SelectItem value="gaming">Gaming</SelectItem>
            <SelectItem value="lectures">Lectures</SelectItem>
            <SelectItem value="practice">Practice</SelectItem>
            <SelectItem value="sleep">Sleep</SelectItem>
            <SelectItem value="salah">Salah</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Stopwatch section */}
      <div className="flex flex-col items-center justify-center py-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="text-4xl font-bold mb-6">{formatTime()}</div>
        <div className="flex space-x-4">
          <Button
            onClick={handleStart}
            disabled={isRunning}
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
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Manual Time Entry</h4>
        </div>
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
    </div>
  );
}
