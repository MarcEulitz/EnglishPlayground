import React, { useState } from 'react';
import useAudio from '@/hooks/use-audio';

interface Avatar {
  id: number;
  url: string;
  alt: string;
}

interface AvatarSelectionProps {
  onSelect: (avatarId: number) => void;
  selectedAvatar?: number;
}

const avatars: Avatar[] = [
  { 
    id: 1, 
    url: 'https://images.unsplash.com/photo-1601288496920-b6154fe3626a?fit=crop&w=120&h=120', 
    alt: 'Avatar Option 1 - Boy with brown hair' 
  },
  { 
    id: 2, 
    url: 'https://images.unsplash.com/photo-1566140967404-b8b3932483f5?fit=crop&w=120&h=120', 
    alt: 'Avatar Option 2 - Girl with blonde hair' 
  },
  { 
    id: 3, 
    url: 'https://images.unsplash.com/photo-1590650153855-d9e808231d41?fit=crop&w=120&h=120', 
    alt: 'Avatar Option 3 - Boy with glasses' 
  },
  { 
    id: 4, 
    url: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?fit=crop&w=120&h=120', 
    alt: 'Avatar Option 4 - Girl with dark hair' 
  },
  { 
    id: 5, 
    url: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?fit=crop&w=120&h=120', 
    alt: 'Avatar Option 5 - Boy with red hair' 
  },
  { 
    id: 6, 
    url: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?fit=crop&w=120&h=120', 
    alt: 'Avatar Option 6 - Girl with braids' 
  }
];

const AvatarSelection: React.FC<AvatarSelectionProps> = ({ onSelect, selectedAvatar }) => {
  const [selected, setSelected] = useState<number | undefined>(selectedAvatar);
  const { playAudio } = useAudio();

  const handleAvatarClick = (avatarId: number) => {
    playAudio('click');
    setSelected(avatarId);
    onSelect(avatarId);
  };

  return (
    <div className="mb-8">
      <h2 className="text-lg font-bold mb-4">Wähle deinen Avatar</h2>
      <div className="grid grid-cols-3 gap-4">
        {avatars.map((avatar) => (
          <button 
            key={avatar.id}
            className="avatar-option p-2 rounded-xl hover:bg-white/70 transition-all"
            onClick={() => handleAvatarClick(avatar.id)}
          >
            <img 
              src={avatar.url} 
              alt={avatar.alt} 
              className={`w-full rounded-full border-4 ${selected === avatar.id ? 'border-primary' : 'border-transparent'} hover:border-primary`}
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default AvatarSelection;

export { avatars };
