import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExpenseCategory } from "@/types";
import { useState } from "react";
import { useExpenses } from "@/hooks/use-expenses";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import ExpenseChart from "./ExpenseChart";

interface ExpenseTrackerProps {
  userId: number;
  expenseSummaries: any[];
}

const expenseFormSchema = z.object({
  amount: z.preprocess(
    (a) => parseFloat(z.string().parse(a)), 
    z.number().positive({ message: "Amount must be greater than 0" })
  ),
  category: z.string(),
});

type ExpenseFormValues = z.infer<typeof expenseFormSchema>;

export default function ExpenseTracker({ userId, expenseSummaries }: ExpenseTrackerProps) {
  const { createExpense } = useExpenses(userId);

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      amount: 0,
      category: "food",
    },
  });

  const onSubmit = (data: ExpenseFormValues) => {
    createExpense.mutate({
      userId,
      amount: data.amount,
      category: data.category as ExpenseCategory,
      date: new Date(),
    }, {
      onSuccess: () => {
        form.reset({
          amount: 0,
          category: "food",
        });
      }
    });
  };

  return (
    <div className="px-4 py-5 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">Expense Tracker</h3>
      </div>
      
      {/* Expense categories chart */}
      <ExpenseChart data={expenseSummaries} />
      
      {/* Add expense form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 space-y-4">
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
          
          <Button type="submit" className="w-full" disabled={createExpense.isPending}>
            <span className="mr-2">+</span>
            {createExpense.isPending ? "Adding Expense..." : "Add Expense"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
