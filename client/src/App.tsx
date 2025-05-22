import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import WelcomePage from "@/pages/welcome";
import CreateUserPage from "@/pages/create-user";
import HomePage from "@/pages/home";
import VocabularyPage from "@/pages/vocabulary";
import GapFillPage from "@/pages/gap-fill";
import SuccessPage from "@/pages/success";
import ParentAreaPage from "@/pages/parent-area";
import { useEffect, useState } from "react";
import { UserProvider, useUserContext } from "./contexts/UserContext";

function Router() {
  const { initializeDb } = useUserContext();
  const [isDbInitialized, setIsDbInitialized] = useState(false);
  
  useEffect(() => {
    const init = async () => {
      await initializeDb();
      setIsDbInitialized(true);
    };
    
    init();
  }, [initializeDb]);

  if (!isDbInitialized) {
    return <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-2xl font-bold text-primary">Lade...</div>
    </div>;
  }

  return (
    <Switch>
      <Route path="/" component={WelcomePage} />
      <Route path="/create-user" component={CreateUserPage} />
      <Route path="/home" component={HomePage} />
      <Route path="/vocabulary/:topic" component={VocabularyPage} />
      <Route path="/gap-fill/:topic" component={GapFillPage} />
      <Route path="/success/:topic" component={SuccessPage} />
      <Route path="/parent" component={ParentAreaPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </UserProvider>
    </QueryClientProvider>
  );
}

export default App;
