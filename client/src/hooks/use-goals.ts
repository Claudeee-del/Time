import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Goal, GoalProgress, ActivityCategory, ExpenseCategory } from "../types";

interface GoalInput {
  userId: number;
  name: string;
  category: ActivityCategory | ExpenseCategory;
  targetValue: number;
  currentValue?: number;
  unit: string;
  active?: boolean;
}

export function useGoals(userId: number) {
  const queryClient = useQueryClient();

  const getGoals = (category?: ActivityCategory | ExpenseCategory) => {
    return useQuery({
      queryKey: ["/api/goals", { userId, category }],
      queryFn: async () => {
        const url = new URL("/api/goals", window.location.origin);
        url.searchParams.append("userId", userId.toString());
        if (category) {
          url.searchParams.append("category", category);
        }
        const response = await fetch(url.toString(), {
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error("Failed to fetch goals");
        }
        return response.json() as Promise<Goal[]>;
      },
    });
  };

  const createGoal = useMutation({
    mutationFn: async (data: GoalInput) => {
      const res = await apiRequest("POST", "/api/goals", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
    },
  });

  const updateGoal = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<GoalInput> }) => {
      const res = await apiRequest("PATCH", `/api/goals/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
    },
  });

  const deleteGoal = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/goals/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
    },
  });

  // Helper function to calculate goal progress for display
  const calculateGoalProgress = (goals: Goal[]): GoalProgress[] => {
    return goals.map(goal => {
      const percentage = Math.min(Math.round((goal.currentValue / goal.targetValue) * 100), 200);
      
      // Some goals are "less than" goals (e.g., social media < 2 hours)
      // For these, exceeding the target is bad
      const isLessThanGoal = goal.name.includes('<') || 
                            (goal.category === 'social_media' || 
                             goal.category === 'gaming');
      
      // For "less than" goals, being under target is good
      // For regular goals, being over target is good
      const isAboveTarget = isLessThanGoal 
        ? goal.currentValue > goal.targetValue
        : goal.currentValue >= goal.targetValue;

      return {
        goalId: goal.id,
        name: goal.name,
        category: goal.category,
        targetValue: goal.targetValue,
        currentValue: goal.currentValue,
        unit: goal.unit,
        percentage,
        isAboveTarget,
      };
    });
  };

  // Helper function to format goal values for display
  const formatGoalValue = (value: number, unit: string): string => {
    if (unit === 'hours') {
      const hours = Math.floor(value);
      const minutes = Math.round((value - hours) * 60);
      return `${hours}h ${minutes}m`;
    } else if (unit === 'USD') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(value);
    } else {
      return `${value} ${unit}`;
    }
  };

  return {
    getGoals,
    createGoal,
    updateGoal,
    deleteGoal,
    calculateGoalProgress,
    formatGoalValue,
  };
}
