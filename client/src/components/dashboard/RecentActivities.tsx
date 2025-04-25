import { Activity, Expense } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils/time";
import { BookOpen, DollarSign, Instagram, Gamepad2, Video, FileQuestion, Moon } from "lucide-react";

interface ActivityItem {
  id: string;
  icon: React.ReactNode;
  category: string;
  description: string;
  value: string;
  time: string;
  color: string;
}

interface RecentActivitiesProps {
  activities: Activity[];
  expenses: Expense[];
}

export default function RecentActivities({ activities, expenses }: RecentActivitiesProps) {
  // Merge activities and expenses, sort by date (most recent first)
  const mergedActivities: ActivityItem[] = [
    ...activities.map(activity => {
      const iconProps = { className: "text-lg" };
      let icon;
      let color = "";
      
      switch (activity.category) {
        case "reading":
          icon = <BookOpen {...iconProps} />;
          color = "bg-blue-100 dark:bg-blue-900/20 text-blue-500 dark:text-blue-300";
          break;
        case "social_media":
          icon = <Instagram {...iconProps} />;
          color = "bg-red-100 dark:bg-red-900/20 text-red-500 dark:text-red-300";
          break;
        case "gaming":
          icon = <Gamepad2 {...iconProps} />;
          color = "bg-orange-100 dark:bg-orange-900/20 text-orange-500 dark:text-orange-300";
          break;
        case "lectures":
          icon = <Video {...iconProps} />;
          color = "bg-green-100 dark:bg-green-900/20 text-green-500 dark:text-green-300";
          break;
        case "practice":
          icon = <FileQuestion {...iconProps} />;
          color = "bg-teal-100 dark:bg-teal-900/20 text-teal-500 dark:text-teal-300";
          break;
        case "sleep":
          icon = <Moon {...iconProps} />;
          color = "bg-indigo-100 dark:bg-indigo-900/20 text-indigo-500 dark:text-indigo-300";
          break;
        default:
          icon = <FileQuestion {...iconProps} />;
          color = "bg-gray-100 dark:bg-gray-900/20 text-gray-500 dark:text-gray-300";
      }
      
      // Format the category name
      const formattedCategory = activity.category
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      // Format the time value
      const hours = Math.floor(activity.duration / 3600);
      const minutes = Math.floor((activity.duration % 3600) / 60);
      const timeValue = `${hours}h ${minutes}m`;
      
      return {
        id: `activity-${activity.id}`,
        icon,
        category: formattedCategory,
        description: `${formattedCategory} session completed`,
        value: timeValue,
        time: formatDate(new Date(activity.createdAt)),
        color,
      };
    }),
    ...expenses.map(expense => {
      // Format the money value
      const moneyValue = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(expense.amount);
      
      // Format the category name
      const formattedCategory = expense.category
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
        
      return {
        id: `expense-${expense.id}`,
        icon: <DollarSign className="text-lg" />,
        category: formattedCategory,
        description: `Added expense in ${formattedCategory} category`,
        value: moneyValue,
        time: formatDate(new Date(expense.createdAt)),
        color: "bg-purple-100 dark:bg-purple-900/20 text-purple-500 dark:text-purple-300",
      };
    }),
  ].sort((a, b) => {
    return new Date(b.time).getTime() - new Date(a.time).getTime();
  }).slice(0, 5); // Take only the 5 most recent items

  return (
    <Card className="shadow rounded-lg overflow-hidden">
      <CardContent className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">Recent Activities</h3>
        </div>
        
        {/* Activity list */}
        <div className="flow-root">
          <ul role="list" className="-mb-8">
            {mergedActivities.map((activity, index) => (
              <li key={activity.id}>
                <div className="relative pb-8">
                  {index < mergedActivities.length - 1 && (
                    <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700" aria-hidden="true"></span>
                  )}
                  <div className="relative flex space-x-3">
                    <div>
                      <span className={`h-8 w-8 rounded-full ${activity.color} flex items-center justify-center ring-8 ring-white dark:ring-gray-800`}>
                        {activity.icon}
                      </span>
                    </div>
                    <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                      <div>
                        <p className="text-sm text-gray-800 dark:text-gray-200">
                          {activity.description}
                        </p>
                      </div>
                      <div className="whitespace-nowrap text-right text-sm text-gray-500 dark:text-gray-400">
                        <div>{activity.value}</div>
                        <div>{activity.time}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
