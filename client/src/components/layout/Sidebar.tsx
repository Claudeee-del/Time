import { Link, useLocation } from "wouter";
import ThemeToggle from "../ui/ThemeToggle";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  DollarSign, 
  Instagram, 
  Gamepad2, 
  BookOpen, 
  Video, 
  FileQuestion, 
  Moon, 
  Settings,
  Heart,
  CalendarDays
} from "lucide-react";
import { Avatar, AvatarFallback } from "../ui/avatar";

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}

function NavItem({ href, icon, label, isActive }: NavItemProps) {
  return (
    <Link href={href}>
      <a className={cn(
        "flex items-center px-4 py-3 text-sm font-medium rounded-lg",
        isActive 
          ? "bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300" 
          : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
      )}>
        <span className="mr-3 text-lg">{icon}</span>
        <span>{label}</span>
      </a>
    </Link>
  );
}

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="flex flex-col w-64 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 h-full">
      <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="text-primary-500 text-2xl">⏱️</div>
          <h1 className="text-xl font-semibold">KingTrack</h1>
        </div>
      </div>
      
      <div className="flex flex-col flex-1 overflow-y-auto">
        <nav className="flex-1 px-2 py-4 space-y-1">
          <NavItem 
            href="/" 
            icon={<LayoutDashboard size={20} />} 
            label="Dashboard" 
            isActive={location === "/"} 
          />
          <NavItem 
            href="/expenses" 
            icon={<DollarSign size={20} />} 
            label="Expenses" 
            isActive={location === "/expenses"} 
          />
          <NavItem 
            href="/social-media" 
            icon={<Instagram size={20} />} 
            label="Social Media" 
            isActive={location === "/social-media"} 
          />
          <NavItem 
            href="/gaming" 
            icon={<Gamepad2 size={20} />} 
            label="Gaming" 
            isActive={location === "/gaming"} 
          />
          <NavItem 
            href="/reading" 
            icon={<BookOpen size={20} />} 
            label="Reading" 
            isActive={location === "/reading"} 
          />
          <NavItem 
            href="/lectures" 
            icon={<Video size={20} />} 
            label="Lectures" 
            isActive={location === "/lectures"} 
          />
          <NavItem 
            href="/practice" 
            icon={<FileQuestion size={20} />} 
            label="Practice" 
            isActive={location === "/practice"} 
          />
          <NavItem 
            href="/sleep" 
            icon={<Moon size={20} />} 
            label="Sleep" 
            isActive={location === "/sleep"} 
          />
          <NavItem 
            href="/salah" 
            icon={<Heart size={20} />} 
            label="Salah" 
            isActive={location === "/salah"} 
          />
          <NavItem 
            href="/calendar" 
            icon={<CalendarDays size={20} />} 
            label="Calendar" 
            isActive={location === "/calendar"} 
          />
          <NavItem 
            href="/settings" 
            icon={<Settings size={20} />} 
            label="Settings" 
            isActive={location === "/settings"} 
          />
        </nav>
      </div>
      
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8 bg-primary-100 dark:bg-primary-900">
              <AvatarFallback className="text-sm font-medium text-primary-700 dark:text-primary-300">
                JD
              </AvatarFallback>
            </Avatar>
            <div className="text-sm font-medium">Demo User</div>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
