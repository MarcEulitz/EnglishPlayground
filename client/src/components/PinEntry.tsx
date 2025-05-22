import React, { useState, useEffect } from 'react';
import { useUserContext } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';
import useAudio from '@/hooks/use-audio';

interface PinEntryProps {
  onSuccess: () => void;
}

const PinEntry: React.FC<PinEntryProps> = ({ onSuccess }) => {
  const [currentPin, setCurrentPin] = useState<string>('');
  const [error, setError] = useState<boolean>(false);
  const { validatePin } = useUserContext();
  const { toast } = useToast();
  const { playAudio } = useAudio();

  const handlePinButtonClick = (value: string) => {
    playAudio('click');
    if (currentPin.length < 4) {
      setCurrentPin(prev => prev + value);
      setError(false);
    }
  };

  const handleClear = () => {
    playAudio('click');
    setCurrentPin(prev => prev.slice(0, -1));
    setError(false);
  };

  const handleSubmit = () => {
    if (currentPin.length === 4) {
      if (validatePin(currentPin)) {
        playAudio('correct');
        onSuccess();
      } else {
        playAudio('wrong');
        setError(true);
        setCurrentPin('');
        toast({
          title: "Falsche PIN",
          description: "Bitte versuche es erneut.",
          variant: "destructive"
        });
      }
    }
  };

  // Check if PIN is complete and submit automatically
  useEffect(() => {
    if (currentPin.length === 4) {
      handleSubmit();
    }
  }, [currentPin]);

  return (
    <div className="p-6 flex flex-col items-center">
      <p className="text-center mb-6">Bitte geben Sie Ihre PIN ein, um fortzufahren.</p>
      
      <div className="flex gap-3 mb-8">
        {[0, 1, 2, 3].map((idx) => (
          <div 
            key={idx}
            className={`w-12 h-12 border-2 ${error ? 'border-destructive animate-bounce-short' : 'border-primary'} rounded-lg flex items-center justify-center text-2xl font-bold`}
          >
            {idx < currentPin.length ? '•' : ''}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-3 gap-4 w-full max-w-xs">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button 
            key={num}
            className="w-16 h-16 bg-white rounded-xl shadow-md flex items-center justify-center text-2xl font-bold hover:bg-gray-50"
            onClick={() => handlePinButtonClick(num.toString())}
          >
            {num}
          </button>
        ))}
        <button 
          className="w-16 h-16 bg-white rounded-xl shadow-md flex items-center justify-center text-2xl font-bold hover:bg-gray-50"
          onClick={handleClear}
        >
          <i className="ri-delete-back-2-line"></i>
        </button>
        <button 
          className="w-16 h-16 bg-white rounded-xl shadow-md flex items-center justify-center text-2xl font-bold hover:bg-gray-50"
          onClick={() => handlePinButtonClick('0')}
        >
          0
        </button>
        <button 
          className="w-16 h-16 bg-accent rounded-xl shadow-md flex items-center justify-center text-white hover:bg-accent/90"
          onClick={handleSubmit}
        >
          <i className="ri-check-line text-2xl"></i>
        </button>
      </div>
    </div>
  );
};

export default PinEntry;
