import React from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import useAudio from "@/hooks/use-audio";

const SelectionPage: React.FC = () => {
  const [, navigate] = useLocation();
  const { playAudio } = useAudio();

  // Diese Seite ist redundant - leite direkt zur select-mode weiter
  React.useEffect(() => {
    navigate('/select-mode');
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-xl font-bold text-primary">Weiterleitung...</div>
    </div>
  );
};

export default SelectionPage;
