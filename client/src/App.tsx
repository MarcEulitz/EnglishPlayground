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
      <TooltipProvider>
        <Toaster />
        <div className="max-w-xl mx-auto pb-20 min-h-screen" style={{
          backgroundImage: "url('https://images.pexels.com/photos/726484/pexels-photo-726484.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat"
        }}>
          <div className="p-6 flex flex-col items-center justify-center min-h-screen bg-white/80 backdrop-blur-sm">
            <div className="w-40 h-40 bg-primary rounded-full flex items-center justify-center mb-6 border-4 border-white shadow-lg">
              <h1 className="text-white text-4xl font-extrabold">Mia's</h1>
            </div>
            <h1 className="text-4xl font-extrabold text-primary mb-2 text-center">Englischwelt</h1>
            <p className="text-lg mb-10 text-center">Lerne Englisch mit Spaß!</p>
            
            <button 
              className="w-full bg-accent text-white py-4 px-6 rounded-xl font-bold text-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center mb-4"
              onClick={() => alert("Diese App ist noch in der Entwicklung. Bald kannst du hier Englisch lernen!")}
            >
              <i className="ri-add-line mr-2 text-xl"></i>
              Neuer Spieler
            </button>
            
            <button 
              className="mt-2 text-primary flex items-center"
              onClick={() => alert("Der Elternbereich wird bald verfügbar sein.")}
            >
              <i className="ri-lock-line mr-1"></i>
              Elternbereich
            </button>
          </div>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
