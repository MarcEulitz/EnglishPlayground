
import React from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import useAudio from '@/hooks/use-audio';

const SelectModePage: React.FC = () => {
  const [, navigate] = useLocation();
  const { playAudio } = useAudio();

  const handleModeSelect = (path: string) => {
    playAudio('click');
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 flex flex-col items-center justify-center p-6">
      {/* Hauptcontainer */}
      <div className="max-w-md w-full space-y-8">
        
        {/* Überschrift */}
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            Was möchtest du heute lernen?
          </h1>
          <p className="text-lg text-gray-600">
            Wähle deinen Lieblingsmodus!
          </p>
        </div>

        {/* Button Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Vokabeltrainer Button */}
          <Button
            onClick={() => handleModeSelect('/vocabulary/animals')}
            className="h-32 bg-blue-400 hover:bg-blue-500 text-white rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex flex-col items-center justify-center space-y-2 text-xl font-bold border-4 border-blue-300"
          >
            <span className="text-4xl">📖</span>
            <span>Vokabeltrainer</span>
            <span className="text-sm font-normal opacity-90">
              Neue Wörter lernen
            </span>
          </Button>

          {/* Lückentext Button */}
          <Button
            onClick={() => handleModeSelect('/gap-fill/animals')}
            className="h-32 bg-green-400 hover:bg-green-500 text-white rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex flex-col items-center justify-center space-y-2 text-xl font-bold border-4 border-green-300"
          >
            <span className="text-4xl">✍️</span>
            <span>Lückentext</span>
            <span className="text-sm font-normal opacity-90">
              Wörter einsetzen
            </span>
          </Button>

        </div>

        {/* Charakter Mia mit Sprechblase */}
        <div className="flex items-end justify-center mt-8">
          <div className="relative">
            {/* Sprechblase */}
            <div className="bg-white rounded-2xl px-4 py-3 shadow-lg border-2 border-purple-200 relative mb-2">
              <p className="text-purple-700 font-medium text-center">
                Wähle einen Modus – ich helfe dir! 💜
              </p>
              {/* Sprechblasen-Pfeil */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-t-[10px] border-l-transparent border-r-transparent border-t-purple-200"></div>
                <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-l-transparent border-r-transparent border-t-white absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-[1px]"></div>
              </div>
            </div>
            
            {/* Charakter Mia */}
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center shadow-lg border-4 border-white animate-bounce-small">
                <span className="text-2xl">👧</span>
              </div>
            </div>
          </div>
        </div>

        {/* Zusätzliche Motivation */}
        <div className="text-center">
          <p className="text-gray-500 text-sm">
            🌟 Sammle Sterne und werde zum Englisch-Profi! 🌟
          </p>
        </div>

      </div>
    </div>
  );
};

export default SelectModePage;
