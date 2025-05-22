import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useUserContext } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AvatarSelection from '@/components/AvatarSelection';
import AgeSelection from '@/components/AgeSelection';
import CelebrationEffect from '@/components/CelebrationEffect';
import useAudio from '@/hooks/use-audio';
import { useToast } from '@/hooks/use-toast';

const CreateUserPage: React.FC = () => {
  const [, navigate] = useLocation();
  const { addUser, setCurrentUser } = useUserContext();
  const { playAudio } = useAudio();
  const { toast } = useToast();
  
  const [username, setUsername] = useState<string>('');
  const [avatarId, setAvatarId] = useState<number>(1);
  const [age, setAge] = useState<number>(6);
  const [showCelebration, setShowCelebration] = useState(false);

  const handleBackClick = () => {
    playAudio('click');
    navigate('/');
  };

  const handleSubmit = async () => {
    playAudio('click');
    
    if (!username.trim()) {
      toast({
        title: "Name fehlt",
        description: "Bitte gib deinen Namen ein.",
        variant: "destructive"
      });
      return;
    }

    try {
      const newUser = await addUser({
        username: username.trim(),
        avatarId,
        age
      });
      
      setCurrentUser(newUser);
      setShowCelebration(true);
      
      // Play success sound and welcome greeting
      playAudio('success');
      
      // Navigate after celebration
      setTimeout(() => {
        navigate('/home');
      }, 1500);
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Dein Spieler konnte nicht erstellt werden. Bitte versuche es erneut.",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <CelebrationEffect active={showCelebration} />
      
      <div className="p-6 min-h-screen flex flex-col">
        <div className="flex items-center mb-6">
          <button 
            className="p-2 rounded-full hover:bg-white/50"
            onClick={handleBackClick}
          >
            <i className="ri-arrow-left-line text-2xl text-primary"></i>
          </button>
          <h1 className="text-2xl font-bold text-primary ml-2">Neuer Spieler</h1>
        </div>
        
        <div className="flex-1">
          <div className="mb-6">
            <label htmlFor="username" className="block text-lg font-bold mb-2">Wie heißt du?</label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-4 rounded-xl border-2 border-primary text-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Dein Name"
            />
          </div>
          
          <AvatarSelection 
            onSelect={setAvatarId} 
            selectedAvatar={avatarId}
          />
          
          <AgeSelection 
            onSelect={setAge} 
            selectedAge={age}
          />
        </div>
        
        <Button 
          onClick={handleSubmit}
          className="w-full bg-accent text-white py-4 px-6 rounded-xl font-bold text-lg shadow-md hover:shadow-lg transition-all"
        >
          Spielen!
        </Button>
      </div>
    </>
  );
};

export default CreateUserPage;
