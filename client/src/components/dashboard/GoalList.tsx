import { Button } from "@/components/ui/button";
import { GoalProgress } from "@/types";
import { useGoals } from "@/hooks/use-goals";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

interface GoalListProps {
  goals: GoalProgress[];
  userId: number;
}

const goalFormSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters" }),
  category: z.string(),
  targetValue: z.preprocess(
    (a) => parseFloat(z.string().parse(a)), 
    z.number().positive()
  ),
  unit: z.string(),
});

type GoalFormValues = z.infer<typeof goalFormSchema>;

export default function GoalList({ goals, userId }: GoalListProps) {
  const [open, setOpen] = useState(false);
  const { createGoal } = useGoals(userId);

  const form = useForm<GoalFormValues>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: {
      name: "",
      category: "social_media",
      targetValue: 0,
      unit: "hours",
    },
  });

  const onSubmit = (data: GoalFormValues) => {
    createGoal.mutate({
      userId,
      name: data.name,
      category: data.category as any,
      targetValue: data.targetValue,
      unit: data.unit,
      currentValue: 0,
      active: true,
    }, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
      }
    });
  };

  return (
    <>
      <div className="space-y-4">
        {goals.map((goal) => (
          <div key={goal.goalId} className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {goal.name}
                </span>
                <span 
                  className={`text-sm font-medium ${
                    !goal.isAboveTarget && goal.percentage < 70 
                      ? "text-red-600 dark:text-red-400" 
                      : goal.isAboveTarget 
                        ? "text-green-600 dark:text-green-400" 
                        : "text-amber-600 dark:text-amber-400"
                  }`}
                >
                  {goal.unit === 'hours' 
                    ? `${Math.floor(goal.currentValue)}h ${Math.round((goal.currentValue - Math.floor(goal.currentValue)) * 60)}m` 
                    : goal.unit === 'USD' 
                      ? `$${goal.currentValue.toFixed(2)}` 
                      : `${goal.currentValue}`} / 
                  {goal.unit === 'hours' 
                    ? `${goal.targetValue}h` 
                    : goal.unit === 'USD' 
                      ? `$${goal.targetValue.toFixed(2)}` 
                      : goal.targetValue}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div 
                  className={`h-2.5 rounded-full ${
                    !goal.isAboveTarget && goal.percentage < 70 
                      ? "bg-red-500" 
                      : goal.isAboveTarget 
                        ? "bg-green-500" 
                        : "bg-amber-500"
                  }`} 
                  style={{ width: `${Math.min(goal.percentage, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="w-full">
              <span className="mr-2">+</span>
              Add New Goal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Goal</DialogTitle>
              <DialogDescription>
                Create a new goal to track your progress.
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Goal Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Sleep 8 hours" {...field} />
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
                          <SelectItem value="social_media">Social Media</SelectItem>
                          <SelectItem value="gaming">Gaming</SelectItem>
                          <SelectItem value="reading">Reading</SelectItem>
                          <SelectItem value="lectures">Lectures</SelectItem>
                          <SelectItem value="practice">Practice</SelectItem>
                          <SelectItem value="sleep">Sleep</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="targetValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Value</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="unit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a unit" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="hours">Hours</SelectItem>
                            <SelectItem value="count">Count</SelectItem>
                            <SelectItem value="USD">USD</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <DialogFooter>
                  <Button type="submit" disabled={createGoal.isPending}>
                    {createGoal.isPending ? "Saving..." : "Save Goal"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
