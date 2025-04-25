import { ActivityCategory, type DashboardSummary as DashboardSummaryType } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Instagram, 
  Moon, 
  BookOpen, 
  DollarSign, 
  TrendingUp, 
  TrendingDown 
} from "lucide-react";

interface SummaryCardProps {
  data: DashboardSummaryType;
}

export function SummaryCard({ data }: SummaryCardProps) {
  const { label, value, change, icon, color } = data;
  
  return (
    <Card className="overflow-hidden shadow">
      <CardContent className="p-5 sm:p-6 flex items-center justify-between">
        <div>
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
            {label}
          </div>
          <div className="mt-1 text-3xl font-semibold text-gray-900 dark:text-gray-100">
            {value}
          </div>
          <div className={`mt-1 flex items-center text-xs font-medium ${
            change.isNegative ? "text-red-600 dark:text-red-400" : 
            change.isPositive ? "text-green-600 dark:text-green-400" : 
            "text-amber-600 dark:text-amber-400"
          }`}>
            {change.isNegative ? <TrendingUp className="mr-1 h-3 w-3" /> : 
             change.isPositive ? <TrendingUp className="mr-1 h-3 w-3" /> : 
             <TrendingDown className="mr-1 h-3 w-3" />}
            <span>{change.value}</span>
          </div>
        </div>
        <div className={`rounded-full p-3 ${color}`}>
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}

interface DashboardSummaryProps {
  socialMediaTime: string;
  sleepTime: string;
  readingTime: string;
  expenseAmount: string;
  socialMediaGoalPercentage: number;
  sleepGoalPercentage: number;
  readingGoalPercentage: number;
  expenseBudgetPercentage: number;
}

export default function DashboardSummary({
  socialMediaTime,
  sleepTime,
  readingTime,
  expenseAmount,
  socialMediaGoalPercentage,
  sleepGoalPercentage,
  readingGoalPercentage,
  expenseBudgetPercentage
}: DashboardSummaryProps) {
  
  const summaryCards: DashboardSummaryType[] = [
    {
      id: 1,
      label: "Social Media Time",
      value: socialMediaTime,
      change: {
        value: `${Math.abs(100 - socialMediaGoalPercentage)}% ${socialMediaGoalPercentage > 100 ? 'above' : 'below'} goal`,
        isPositive: socialMediaGoalPercentage < 100, // For social media, less is better
        isNegative: socialMediaGoalPercentage > 100,
      },
      icon: <Instagram className="text-2xl" />,
      color: "bg-red-100 dark:bg-red-900/20 text-red-500 dark:text-red-300"
    },
    {
      id: 2,
      label: "Sleep",
      value: sleepTime,
      change: {
        value: `${Math.abs(100 - sleepGoalPercentage)}% ${sleepGoalPercentage < 100 ? 'below' : 'above'} goal`,
        isPositive: sleepGoalPercentage >= 100,
        isNegative: sleepGoalPercentage < 90,
      },
      icon: <Moon className="text-2xl" />,
      color: "bg-blue-100 dark:bg-blue-900/20 text-blue-500 dark:text-blue-300"
    },
    {
      id: 3,
      label: "Reading",
      value: readingTime,
      change: {
        value: `${Math.abs(100 - readingGoalPercentage)}% ${readingGoalPercentage > 100 ? 'above' : 'below'} goal`,
        isPositive: readingGoalPercentage >= 100,
        isNegative: readingGoalPercentage < 70,
      },
      icon: <BookOpen className="text-2xl" />,
      color: "bg-green-100 dark:bg-green-900/20 text-green-500 dark:text-green-300"
    },
    {
      id: 4,
      label: "Expenses",
      value: expenseAmount,
      change: {
        value: `${Math.abs(100 - expenseBudgetPercentage)}% ${expenseBudgetPercentage < 100 ? 'under' : 'over'} budget`,
        isPositive: expenseBudgetPercentage < 100, // For expenses, less is better
        isNegative: expenseBudgetPercentage > 110,
      },
      icon: <DollarSign className="text-2xl" />,
      color: "bg-purple-100 dark:bg-purple-900/20 text-purple-500 dark:text-purple-300"
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
      {summaryCards.map(card => (
        <SummaryCard key={card.id} data={card} />
      ))}
    </div>
  );
}
