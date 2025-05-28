import React from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';

const SelectModePage: React.FC = () => {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-blue-100 text-center p-6">
      <h1 className="text-3xl font-bold mb-6">Was möchtest du lernen?</h1>

      <div className="space-y-4">
        <Button className="w-64 text-xl" onClick={() => navigate('/home')}>
          🧠 Vokabeltrainer starten
        </Button>

        <Button className="w-64 text-xl" onClick={() => navigate('/gap-fill')}>
          ✍️ Lückentext starten
        </Button>
      </div>
    </div>
  );
};

export default SelectModePage;
