import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  DollarSign, 
  Timer, 
  BarChart2, 
  Settings 
} from "lucide-react";

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
        "flex flex-col items-center justify-center",
        isActive
          ? "text-primary-500 dark:text-primary-400"
          : "text-gray-500 dark:text-gray-400"
      )}>
        <span className="text-xl">{icon}</span>
        <span className="text-xs mt-1">{label}</span>
      </a>
    </Link>
  );
}

export default function MobileNavigation() {
  const [location] = useLocation();

  return (
    <div className="md:hidden fixed bottom-0 w-full bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-10">
      <div className="grid grid-cols-5 h-16">
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
          href="/reading" 
          icon={<Timer size={20} />} 
          label="Track" 
          isActive={["/reading", "/social-media", "/gaming", "/lectures", "/practice", "/sleep", "/salah"].includes(location)} 
        />
        <NavItem 
          href="/calendar" 
          icon={<BarChart2 size={20} />} 
          label="Calendar" 
          isActive={location === "/calendar"} 
        />
        <NavItem 
          href="/settings" 
          icon={<Settings size={20} />} 
          label="Settings" 
          isActive={location === "/settings"} 
        />
      </div>
    </div>
  );
}
