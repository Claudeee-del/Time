import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/use-theme";
import NotFound from "@/pages/not-found";
import MainLayout from "./components/layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import Expenses from "./pages/Expenses";
import SocialMedia from "./pages/SocialMedia";
import Gaming from "./pages/Gaming";
import Reading from "./pages/Reading";
import Lectures from "./pages/Lectures";
import Practice from "./pages/Practice";
import Sleep from "./pages/Sleep";
import Salah from "./pages/Salah";
import Calendar from "./pages/Calendar";
import Settings from "./pages/Settings";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/expenses" component={Expenses} />
      <Route path="/social-media" component={SocialMedia} />
      <Route path="/gaming" component={Gaming} />
      <Route path="/reading" component={Reading} />
      <Route path="/lectures" component={Lectures} />
      <Route path="/practice" component={Practice} />
      <Route path="/sleep" component={Sleep} />
      <Route path="/salah" component={Salah} />
      <Route path="/calendar" component={Calendar} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <MainLayout>
            <Router />
          </MainLayout>
          <Toaster />
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
