import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useUserContext } from '@/contexts/UserContext';
import BottomNavigation from '@/components/BottomNavigation';
import ProgressBar from '@/components/ProgressBar';
import CelebrationEffect from '@/components/CelebrationEffect';
import CharacterFeedback from '@/components/CharacterFeedback';
import useAudio from '@/hooks/use-audio';
import { calculateLevel } from '@/lib/utils';
import { avatars } from '@/components/AvatarSelection';

const HomePage: React.FC = () => {
  const [, navigate] = useLocation();
  const { currentUser, achievements, learningStats, parentSettings } = useUserContext();
  const { playAudio, playCharacterPhrase } = useAudio();
  const [showGreeting, setShowGreeting] = useState(false);
  
  // Redirect to welcome page if no user is selected
  useEffect(() => {
    if (!currentUser) {
      navigate('/');
    } else {
      // When user logs in, set greeting state to true to trigger welcome message
      setShowGreeting(true);
      
      // Play a welcome greeting when the user arrives
      const timer = setTimeout(() => {
        playCharacterPhrase('greeting', { 
          character: 'mia', 
          emotion: 'excited' 
        });
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [currentUser, navigate, playCharacterPhrase]);

  if (!currentUser || !parentSettings) {
    return null;
  }

  const userAchievements = achievements.filter(a => a.userId === currentUser.id);
  const trophies = userAchievements.filter(a => a.type === 'trophy');
  const stickers = userAchievements.filter(a => a.type === 'sticker');
  
  const level = calculateLevel(userAchievements.length);
  
  // Calculate daily learning time
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStats = learningStats.filter(
    stat => stat.userId === currentUser.id && new Date(stat.date).getTime() >= today.getTime()
  );
  const dailyMinutes = todayStats.reduce((total, stat) => total + Math.floor(stat.duration / 60), 0);
  
  // Get avatar URL
  const avatar = avatars.find(a => a.id === currentUser.avatarId);
  const avatarUrl = avatar ? avatar.url : avatars[0].url;

  const handleCategoryClick = (category: string) => {
    playAudio('click');
    navigate(`/vocabulary/${category}`);
  };

  return (
    <div className="min-h-screen">
      {/* Header with User Info */}
      <div className="bg-primary text-white p-4 rounded-b-3xl shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <img 
              src={avatarUrl} 
              alt={`${currentUser.username}'s Avatar`} 
              className="w-12 h-12 rounded-full border-2 border-white mr-3"
            />
            <div>
              <h2 className="font-bold text-lg">{currentUser.username}</h2>
              <div className="flex items-center">
                <div className="flex mr-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <i 
                      key={i} 
                      className={`ri-star-${i < level ? 'fill' : 'line'} text-secondary text-sm`}
                    ></i>
                  ))}
                </div>
                <span className="text-xs text-white/80">Level {level}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <div className="mr-4 text-center">
              <div className="flex items-center justify-center">
                <i className="ri-trophy-line text-secondary"></i>
                <span className="ml-1 font-bold">{trophies.length}</span>
              </div>
              <span className="text-xs">Trophäen</span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center">
                <i className="ri-price-tag-3-line text-secondary"></i>
                <span className="ml-1 font-bold">{stickers.length}</span>
              </div>
              <span className="text-xs">Sticker</span>
            </div>
          </div>
        </div>
        
        {/* Daily Progress */}
        <div className="mt-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm">Tägliches Ziel</span>
            <span className="text-sm font-bold">{dailyMinutes} min / {parentSettings.dailyGoal} min</span>
          </div>
          <ProgressBar 
            current={dailyMinutes} 
            total={parentSettings.dailyGoal} 
            showPercentage={false} 
            colorClass="bg-secondary"
          />
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="p-4">
        {/* Recent Lessons */}
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-3 text-primary">Weitermachen</h2>
          <div className="bg-white rounded-xl p-4 shadow-md">
            <div className="flex items-center">
              <div className="w-14 h-14 bg-secondary rounded-full flex items-center justify-center text-white mr-4">
                <i className="ri-book-open-line text-2xl"></i>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg">Tiere</h3>
                <div className="flex items-center">
                  <div className="flex mr-2">
                    <i className="ri-star-fill text-secondary"></i>
                    <i className="ri-star-fill text-secondary"></i>
                    <i className="ri-star-line text-gray-300"></i>
                  </div>
                  <span className="text-xs text-gray-500">2/3 Lektionen abgeschlossen</span>
                </div>
              </div>
              <button 
                className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white shadow-md"
                onClick={() => handleCategoryClick('animals')}
              >
                <i className="ri-play-fill text-2xl"></i>
              </button>
            </div>
          </div>
        </div>
        
        {/* Learning Categories */}
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-3 text-primary">Themen</h2>
          <div className="grid grid-cols-2 gap-4">
            {/* Animals Category */}
            <button 
              className="category-card bg-white rounded-xl p-4 shadow-md flex flex-col items-center"
              onClick={() => handleCategoryClick('animals')}
            >
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center text-white mb-2">
                <i className="ri-bear-smile-line text-3xl"></i>
              </div>
              <h3 className="font-bold">Tiere</h3>
              <div className="mt-1 flex">
                <i className="ri-star-fill text-secondary"></i>
                <i className="ri-star-fill text-secondary"></i>
                <i className="ri-star-line text-gray-300"></i>
              </div>
            </button>
            
            {/* Colors Category */}
            <button 
              className="category-card bg-white rounded-xl p-4 shadow-md flex flex-col items-center"
              onClick={() => handleCategoryClick('colors')}
            >
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center text-white mb-2">
                <i className="ri-palette-line text-3xl"></i>
              </div>
              <h3 className="font-bold">Farben</h3>
              <div className="mt-1 flex">
                <i className="ri-star-fill text-secondary"></i>
                <i className="ri-star-line text-gray-300"></i>
                <i className="ri-star-line text-gray-300"></i>
              </div>
            </button>
            
            {/* Numbers Category */}
            <button 
              className="category-card bg-white rounded-xl p-4 shadow-md flex flex-col items-center"
              onClick={() => handleCategoryClick('numbers')}
            >
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white mb-2">
                <i className="ri-numbers-line text-3xl"></i>
              </div>
              <h3 className="font-bold">Zahlen</h3>
              <div className="mt-1 flex">
                <i className="ri-star-fill text-secondary"></i>
                <i className="ri-star-fill text-secondary"></i>
                <i className="ri-star-fill text-secondary"></i>
              </div>
            </button>
            
            {/* Family Category */}
            <button 
              className="category-card bg-white rounded-xl p-4 shadow-md flex flex-col items-center"
              onClick={() => handleCategoryClick('family')}
            >
              <div className="w-16 h-16 bg-destructive rounded-full flex items-center justify-center text-white mb-2">
                <i className="ri-group-line text-3xl"></i>
              </div>
              <h3 className="font-bold">Familie</h3>
              <div className="mt-1 flex">
                <i className="ri-star-line text-gray-300"></i>
                <i className="ri-star-line text-gray-300"></i>
                <i className="ri-star-line text-gray-300"></i>
              </div>
            </button>
          </div>
        </div>
        
        {/* Achievements */}
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-3 text-primary">Deine Trophäen</h2>
          <div className="flex overflow-x-auto pb-2 gap-4">
            {trophies.length > 0 ? (
              trophies.map((trophy) => (
                <div key={trophy.id} className="flex-shrink-0 w-20 flex flex-col items-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-1 shadow-md border-2 border-secondary">
                    <i className="ri-trophy-fill text-2xl text-secondary"></i>
                  </div>
                  <span className="text-xs text-center">{trophy.name}</span>
                </div>
              ))
            ) : (
              // Placeholder trophies
              <>
                <div className="flex-shrink-0 w-20 flex flex-col items-center opacity-40">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-1 shadow-md border-2 border-gray-300">
                    <i className="ri-question-mark text-2xl text-gray-400"></i>
                  </div>
                  <span className="text-xs text-center">???</span>
                </div>
                <div className="flex-shrink-0 w-20 flex flex-col items-center opacity-40">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-1 shadow-md border-2 border-gray-300">
                    <i className="ri-question-mark text-2xl text-gray-400"></i>
                  </div>
                  <span className="text-xs text-center">???</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default HomePage;
