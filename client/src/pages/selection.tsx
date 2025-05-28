import React from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import useAudio from "@/hooks/use-audio";

const SelectionPage: React.FC = () => {
  const [, navigate] = useLocation();
  const { playAudio } = useAudio();

  const handleSelect = (path: string) => {
    playAudio("click");
    navigate(path);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center bg-white/80 rounded-lg shadow-lg backdrop-blur-sm">
      <h1 className="text-3xl font-bold text-primary mb-8">
        Was möchtest du machen?
      </h1>
      <div className="flex flex-col gap-4 w-full max-w-xs">
        <Button
          onClick={() => handleSelect("/select-mode")}
          className="text-lg py-4"
        >
          🎯 Lernmodus wählen
        </Button>
      </div>
    </div>
  );
};

export default SelectionPage;
