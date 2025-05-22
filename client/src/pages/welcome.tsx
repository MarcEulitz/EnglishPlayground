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
    <div id="welcomeScreen" className="flex flex-col min-h-screen p-6">
      <div className="flex-1 flex flex-col items-center justify-center splash-animation">
        {/* London Bridge Image */}
        <div className="w-80 h-56 rounded-lg overflow-hidden mb-6 shadow-lg">
          <svg width="100%" height="100%" viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg">
            {/* Sky */}
            <rect width="800" height="300" fill="#87CEEB" />
            
            {/* River Thames */}
            <rect y="300" width="800" height="200" fill="#1E90FF" />
            
            {/* London Bridge */}
            <rect x="100" y="250" width="600" height="50" fill="#808080" />
            
            {/* Bridge Pillars */}
            <rect x="150" y="300" width="30" height="150" fill="#696969" />
            <rect x="300" y="300" width="30" height="150" fill="#696969" />
            <rect x="450" y="300" width="30" height="150" fill="#696969" />
            <rect x="600" y="300" width="30" height="150" fill="#696969" />
            
            {/* Bridge Arches */}
            <path d="M150,300 Q215,350 300,300" fill="none" stroke="#696969" strokeWidth="5" />
            <path d="M300,300 Q375,350 450,300" fill="none" stroke="#696969" strokeWidth="5" />
            <path d="M450,300 Q525,350 600,300" fill="none" stroke="#696969" strokeWidth="5" />
            
            {/* Bridge Railing */}
            <rect x="100" y="230" width="600" height="20" fill="#A9A9A9" />
            
            {/* Tower Bridge Towers - Making it look more iconic */}
            <rect x="175" y="150" width="50" height="100" fill="#F5DEB3" />
            <rect x="550" y="150" width="50" height="100" fill="#F5DEB3" />
            <rect x="165" y="130" width="70" height="20" fill="#8B4513" />
            <rect x="540" y="130" width="70" height="20" fill="#8B4513" />
            
            {/* Sun */}
            <circle cx="700" cy="80" r="40" fill="#FFD700" />
            
            {/* Small boat */}
            <rect x="400" y="350" width="60" height="20" fill="#8B4513" />
            <rect x="420" y="330" width="20" height="20" fill="#FFFFFF" />
            
            {/* Text */}
            <text x="400" y="100" textAnchor="middle" fill="#000000" fontFamily="Arial" fontSize="24" fontWeight="bold">London Bridge</text>
          </svg>
        </div>

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
            <div className="grid grid-cols-2 gap-4">
              {users.map(user => (
                <button 
                  key={user.id}
                  className="user-select bg-white rounded-xl p-4 flex flex-col items-center shadow-md hover:shadow-lg transition-all"
                  onClick={() => handleUserSelect(user.id)}
                >
                  <img 
                    src={getAvatarUrl(user.avatarId)} 
                    alt={`Avatar - ${user.username}`} 
                    className="w-20 h-20 rounded-full mb-2 border-2 border-primary"
                  />
                  <span className="font-bold">{user.username}</span>
                  <div className="mt-1">
                    <StarRating count={getUserStars(user.id)} />
                  </div>
                </button>
              ))}
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
