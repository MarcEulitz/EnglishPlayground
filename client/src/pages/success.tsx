import React, { useState, useEffect } from 'react';
import { useLocation, useParams } from 'wouter';
import { useUserContext } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import CelebrationEffect from '@/components/CelebrationEffect';
import useAudio from '@/hooks/use-audio';

const SuccessPage: React.FC = () => {
  const params = useParams<{ topic: string }>();
  const [, navigate] = useLocation();
  const { currentUser, learningStats, achievements, addAchievement } = useUserContext();
  const { playAudio } = useAudio();
  
  const [showCelebration, setShowCelebration] = useState(true);
  const [newAchievement, setNewAchievement] = useState<string | null>(null);
  const [newAchievementDesc, setNewAchievementDesc] = useState<string | null>(null);

  // Get the latest learning stat for this topic
  const latestStat = learningStats
    .filter(stat => stat.userId === currentUser?.id && stat.topic === params.topic)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  
  // Calculate score
  const score = latestStat?.score || 0;
  const total = 5; // Assuming 5 questions per exercise
  const percentage = Math.round((score / total) * 100);

  useEffect(() => {
    if (!currentUser) {
      navigate('/');
      return;
    }
    
    // Check if user earned an achievement
    const checkForAchievements = async () => {
      if (!currentUser || !latestStat) return;
      
      const userStats = learningStats.filter(
        stat => stat.userId === currentUser.id && stat.topic === params.topic
      );
      
      const userAchievements = achievements.filter(
        a => a.userId === currentUser.id
      );
      
      // Check if we should award a new achievement
      if (latestStat.score >= 4 && !userAchievements.some(a => a.name === `${params.topic}Experte`)) {
        // Award "Expert" trophy
        try {
          await addAchievement({
            userId: currentUser.id,
            type: 'trophy',
            name: `${params.topic}Experte`,
            description: `Du kennst jetzt viele Wörter zum Thema ${params.topic}!`
          });
          
          setNewAchievement(`${params.topic}Experte`);
          setNewAchievementDesc(`Du kennst jetzt viele Wörter zum Thema ${params.topic}!`);
        } catch (error) {
          console.error('Failed to add achievement', error);
        }
      } else if (userStats.length >= 3 && !userAchievements.some(a => a.name === `${params.topic}Fleißig`)) {
        // Award "Diligent" sticker for completing 3 exercises in this topic
        try {
          await addAchievement({
            userId: currentUser.id,
            type: 'sticker',
            name: `${params.topic}Fleißig`,
            description: `Du hast 3 Übungen zum Thema ${params.topic} gemacht!`
          });
          
          setNewAchievement(`${params.topic}Fleißig`);
          setNewAchievementDesc(`Du hast 3 Übungen zum Thema ${params.topic} gemacht!`);
        } catch (error) {
          console.error('Failed to add achievement', error);
        }
      }
    };
    
    checkForAchievements();
  }, [currentUser, latestStat, learningStats, achievements, addAchievement, navigate, params.topic]);

  if (!currentUser || !latestStat) {
    return null;
  }

  const handleRepeat = () => {
    playAudio('click');
    navigate(`/vocabulary/${params.topic}`);
  };

  const handleContinue = () => {
    playAudio('click');
    navigate('/home');
  };

  return (
    <>
      <CelebrationEffect active={showCelebration} onComplete={() => setShowCelebration(false)} />
      
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="text-center mb-8">
          <div className="w-32 h-32 mx-auto mb-6 bg-success rounded-full flex items-center justify-center">
            <i className="ri-check-line text-white text-6xl"></i>
          </div>
          <h2 className="text-3xl font-bold text-primary mb-2">Super gemacht!</h2>
          <p className="text-lg">Du hast {score} von {total} Punkten erreicht.</p>
        </div>
        
        {/* New Trophy/Achievement */}
        {newAchievement && (
          <div className="bg-white rounded-xl p-6 shadow-lg mb-8 w-full max-w-sm">
            <h3 className="text-xl font-bold text-center mb-4">
              {newAchievement.includes('trophy') ? 'Neue Trophäe erhalten!' : 'Neuer Sticker erhalten!'}
            </h3>
            <div className="flex justify-center mb-4">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-md border-4 border-secondary animate-bounce-short">
                <i className={`ri-${newAchievement.includes('trophy') ? 'trophy' : 'price-tag-3'}-fill text-4xl text-secondary`}></i>
              </div>
            </div>
            <p className="text-center font-bold">{newAchievement}</p>
            <p className="text-center text-sm text-gray-500">{newAchievementDesc}</p>
          </div>
        )}
        
        <div className="flex gap-4 w-full">
          <Button
            onClick={handleRepeat}
            variant="outline"
            className="flex-1 py-4 px-6 rounded-xl font-bold text-lg border-2 border-primary text-primary"
          >
            Wiederholen
          </Button>
          <Button
            onClick={handleContinue}
            className="flex-1 bg-accent text-white py-4 px-6 rounded-xl font-bold text-lg shadow-md"
          >
            Weiter
          </Button>
        </div>
      </div>
    </>
  );
};

export default SuccessPage;
