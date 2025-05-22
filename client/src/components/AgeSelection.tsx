import React, { useState } from 'react';
import useAudio from '@/hooks/use-audio';

interface AgeSelectionProps {
  onSelect: (age: number) => void;
  selectedAge?: number;
}

const AgeSelection: React.FC<AgeSelectionProps> = ({ onSelect, selectedAge = 6 }) => {
  const [selected, setSelected] = useState<number>(selectedAge);
  const { playAudio } = useAudio();

  const handleAgeClick = (age: number) => {
    playAudio('click');
    setSelected(age);
    onSelect(age);
  };

  return (
    <div className="mb-6">
      <label className="block text-lg font-bold mb-2">Wie alt bist du?</label>
      <div className="flex items-center justify-between bg-white rounded-xl p-2">
        {[6, 7, 8, 9, 10, 11].map((age) => (
          <button 
            key={age}
            className={`age-btn w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
              selected === age ? 'bg-primary text-white' : 'bg-white text-primary'
            }`}
            onClick={() => handleAgeClick(age)}
          >
            {age}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AgeSelection;
