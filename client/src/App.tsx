import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Expenses from "@/pages/Expenses";
import Statistics from "@/pages/Statistics";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { ExpenseProvider } from "./lib/hooks/use-expenses";
// Fix import consistency

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/expenses" component={Expenses} />
      <Route path="/statistics" component={Statistics} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="chillar-theme">
        <ExpenseProvider>
          <TooltipProvider>
            <Layout>
              <Router />
            </Layout>
            <Toaster />
          </TooltipProvider>
        </ExpenseProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
