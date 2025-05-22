import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useUserContext } from '@/contexts/UserContext';
import { calculateLevel } from '@/lib/utils';
import useAudio from '@/hooks/use-audio';
import { avatars } from '@/components/AvatarSelection';
import StarRating from '@/components/StarRating';

const WelcomePage: React.FC = () => {
  const [, navigate] = useLocation();
  const { users, achievements, setCurrentUser } = useUserContext();
  const { playAudio } = useAudio();
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    // Apply splash animation
    setTimeout(() => {
      setIsAnimating(false);
    }, 1500);
  }, []);

  const handleUserSelect = (userId: number) => {
    playAudio('click');
    const user = users.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      navigate('/home');
    }
  };

  const handleAddUser = () => {
    playAudio('click');
    navigate('/create-user');
  };

  const handleParentArea = () => {
    playAudio('click');
    navigate('/parent');
  };

  const getUserStars = (userId: number) => {
    // Count achievements for this user and convert to stars (1-3)
    const userAchievements = achievements.filter(a => a.userId === userId);
    const level = calculateLevel(userAchievements.length);
    return Math.min(level, 3);
  };

  const getAvatarUrl = (avatarId: number) => {
    const avatar = avatars.find(a => a.id === avatarId);
    return avatar ? avatar.url : avatars[0].url;
  };

  return (
    <div id="welcomeScreen" className="flex flex-col min-h-screen p-6 relative">
      {/* London Bridge Background Image */}
      <div className="absolute inset-0 z-0 bg-cover bg-center" style={{
        backgroundImage: `url('https://images.pexels.com/photos/672532/pexels-photo-672532.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'brightness(0.6)',
      }}></div>
      
      <div className="flex-1 flex flex-col items-center justify-center splash-animation relative z-10 bg-white/40 p-6 rounded-xl shadow-lg my-10 backdrop-blur-sm">


        {/* App Logo */}
        <div className="w-40 h-40 bg-primary rounded-full flex items-center justify-center mb-6 border-4 border-white shadow-lg">
          <h1 className="text-white text-4xl font-extrabold">Mia's</h1>
        </div>
        <h1 className="text-4xl font-extrabold text-primary mb-2 text-center">Englischwelt</h1>
        <p className="text-lg mb-10 text-center">Lerne Englisch mit Spaß!</p>
        
        {/* User Selection */}
        {users.length > 0 && (
          <div className="w-full mb-6">
            <h2 className="text-xl font-bold mb-4 text-center">Wer bist du?</h2>
            <div className="flex flex-col items-center">
              {/* Single user button with prominent styling */}
              <button 
                className="user-select bg-white rounded-xl p-6 flex flex-col items-center shadow-md hover:shadow-lg transition-all w-48"
                onClick={() => handleUserSelect(users[0].id)}
              >
                <img 
                  src={getAvatarUrl(users[0].avatarId)} 
                  alt={`Avatar - ${users[0].username}`} 
                  className="w-24 h-24 rounded-full mb-3 border-2 border-primary"
                />
                <span className="font-bold text-lg">{users[0].username}</span>
                <div className="mt-2">
                  <StarRating count={getUserStars(users[0].id)} />
                </div>
              </button>
              
              {/* Info about other profiles */}
              {users.length > 1 && (
                <p className="text-sm text-gray-600 mt-4 text-center">
                  {users.length - 1} weitere Profile verfügbar
                </p>
              )}
            </div>
          </div>
        )}
        
        {/* Add New User Button */}
        <button 
          className="w-full bg-accent text-white py-4 px-6 rounded-xl font-bold text-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center"
          onClick={handleAddUser}
        >
          <i className="ri-add-line mr-2 text-xl"></i>
          Neuer Spieler
        </button>
        
        {/* Parent Area Button */}
        <button 
          className="mt-6 text-primary flex items-center"
          onClick={handleParentArea}
        >
          <i className="ri-lock-line mr-1"></i>
          Elternbereich
        </button>
      </div>
    </div>
  );
};

export default WelcomePage;
