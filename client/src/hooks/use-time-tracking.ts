import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Activity, ActivityCategory, GoalProgress, TimeAllocation, TimePeriod } from "../types";
import { formatSecondsToHM } from "@/lib/utils/time";

interface ActivityInput {
  userId: number;
  category: ActivityCategory;
  description?: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
}

export function useTimeTracking(userId: number) {
  const queryClient = useQueryClient();

  const getActivities = (category?: ActivityCategory) => {
    return useQuery({
      queryKey: ["/api/activities", { userId, category }],
      queryFn: async () => {
        const url = new URL("/api/activities", window.location.origin);
        url.searchParams.append("userId", userId.toString());
        if (category) {
          url.searchParams.append("category", category);
        }
        const response = await fetch(url.toString(), {
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error("Failed to fetch activities");
        }
        return response.json() as Promise<Activity[]>;
      },
    });
  };

  const createActivity = useMutation({
    mutationFn: async (data: ActivityInput) => {
      const res = await apiRequest("POST", "/api/activities", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] }); // Since activities might affect goals
    },
  });

  const updateActivity = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<ActivityInput> }) => {
      const res = await apiRequest("PATCH", `/api/activities/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] }); // Since activities might affect goals
    },
  });

  const deleteActivity = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/activities/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] }); // Since activities might affect goals
    },
  });

  // Helper function to calculate time allocations for charts
  const calculateTimeAllocations = (
    activities: Activity[],
    period: TimePeriod = "weekly"
  ): TimeAllocation[] => {
    const now = new Date();
    const startDate = new Date();

    // Define the start date based on the period
    if (period === "daily") {
      startDate.setHours(0, 0, 0, 0);
    } else if (period === "weekly") {
      const day = startDate.getDay();
      startDate.setDate(startDate.getDate() - day);
      startDate.setHours(0, 0, 0, 0);
    } else if (period === "monthly") {
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
    }

    // Filter activities within the period
    const filteredActivities = activities.filter(
      (activity) => new Date(activity.startTime) >= startDate
    );

    // Group activities by category and calculate total duration
    const groupedByCategory: Record<string, number> = {};
    for (const activity of filteredActivities) {
      const category = activity.category;
      if (!groupedByCategory[category]) {
        groupedByCategory[category] = 0;
      }
      groupedByCategory[category] += activity.duration;
    }

    // Convert to TimeAllocation array and convert seconds to hours
    return Object.entries(groupedByCategory).map(([category, duration]) => ({
      category: category as ActivityCategory,
      duration: duration / 3600, // Convert seconds to hours
      date: now,
    }));
  };

  // Helper function to format durations for display
  const formatDuration = (seconds: number): string => {
    return formatSecondsToHM(seconds);
  };

  return {
    getActivities,
    createActivity,
    updateActivity,
    deleteActivity,
    calculateTimeAllocations,
    formatDuration,
  };
}
