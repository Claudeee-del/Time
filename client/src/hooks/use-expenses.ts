import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Expense, ExpenseCategory, ExpenseSummary, TimePeriod } from "../types";

interface ExpenseInput {
  userId: number;
  amount: number;
  category: ExpenseCategory;
  description?: string;
  date: Date;
}

export function useExpenses(userId: number) {
  const queryClient = useQueryClient();

  const getExpenses = (category?: ExpenseCategory) => {
    return useQuery({
      queryKey: ["/api/expenses", { userId, category }],
      queryFn: async () => {
        const url = new URL("/api/expenses", window.location.origin);
        url.searchParams.append("userId", userId.toString());
        if (category) {
          url.searchParams.append("category", category);
        }
        const response = await fetch(url.toString(), {
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error("Failed to fetch expenses");
        }
        return response.json() as Promise<Expense[]>;
      },
    });
  };

  const createExpense = useMutation({
    mutationFn: async (data: ExpenseInput) => {
      const res = await apiRequest("POST", "/api/expenses", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] }); // Since expenses might affect goals
    },
  });

  const updateExpense = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<ExpenseInput> }) => {
      const res = await apiRequest("PATCH", `/api/expenses/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] }); // Since expenses might affect goals
    },
  });

  const deleteExpense = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/expenses/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] }); // Since expenses might affect goals
    },
  });

  // Helper function to calculate expense summaries for charts
  const calculateExpenseSummaries = (
    expenses: Expense[],
    period: TimePeriod = "weekly"
  ): ExpenseSummary[] => {
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

    // Filter expenses within the period
    const filteredExpenses = expenses.filter(
      (expense) => new Date(expense.date) >= startDate
    );

    // Group expenses by category and calculate total amount
    const groupedByCategory: Record<string, number> = {};
    for (const expense of filteredExpenses) {
      const category = expense.category;
      if (!groupedByCategory[category]) {
        groupedByCategory[category] = 0;
      }
      groupedByCategory[category] += expense.amount;
    }

    // Convert to ExpenseSummary array
    return Object.entries(groupedByCategory).map(([category, amount]) => ({
      category: category as ExpenseCategory,
      amount,
    }));
  };

  // Helper function to calculate total expenses
  const calculateTotalExpenses = (expenses: Expense[]): number => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  };

  // Helper function to format money for display
  const formatMoney = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return {
    getExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
    calculateExpenseSummaries,
    calculateTotalExpenses,
    formatMoney,
  };
}
