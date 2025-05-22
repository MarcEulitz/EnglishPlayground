import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useUserContext } from '@/contexts/UserContext';
import PinEntry from '@/components/PinEntry';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import ProgressBar from '@/components/ProgressBar';
import { formatTime } from '@/lib/utils';
import useAudio from '@/hooks/use-audio';

const ParentAreaPage: React.FC = () => {
  const [, navigate] = useLocation();
  const { users, currentUser, learningStats, parentSettings, updateParentSettings } = useUserContext();
  const [authenticated, setAuthenticated] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const { playAudio, audioEnabled, toggleAudio } = useAudio();

  useEffect(() => {
    // Set the first user as default if there are users
    if (users.length > 0 && !selectedUserId) {
      setSelectedUserId(users[0].id.toString());
    }
  }, [users, selectedUserId]);

  const handleBackClick = () => {
    playAudio('click');
    navigate('/');
  };

  const handleDailyGoalChange = async (value: string) => {
    if (!parentSettings) return;
    
    playAudio('click');
    try {
      await updateParentSettings({
        ...parentSettings,
        dailyGoal: parseInt(value, 10)
      });
    } catch (error) {
      console.error('Failed to update daily goal', error);
    }
  };

  const handleNotificationsChange = async (checked: boolean) => {
    if (!parentSettings) return;
    
    playAudio('click');
    try {
      await updateParentSettings({
        ...parentSettings,
        notifications: checked
      });
    } catch (error) {
      console.error('Failed to update notifications setting', error);
    }
  };

  const handleSoundEffectsChange = async (checked: boolean) => {
    if (!parentSettings) return;
    
    try {
      await updateParentSettings({
        ...parentSettings,
        soundEffects: checked
      });
      toggleAudio();
    } catch (error) {
      console.error('Failed to update sound effects setting', error);
    }
  };

  const handleChangePinClick = () => {
    playAudio('click');
    // In a real app, this would open a PIN change dialog
    alert('Diese Funktion ist noch nicht verfügbar.');
  };

  // Calculate user statistics
  const getUserStats = (userId: number) => {
    const userLearningStats = learningStats.filter(stat => stat.userId === userId);
    
    // Total learning time in seconds
    const totalTime = userLearningStats.reduce((total, stat) => total + stat.duration, 0);
    
    // Active days
    const days = new Set(userLearningStats.map(stat => {
      const date = new Date(stat.date);
      return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    })).size;
    
    // Average score
    const avgScore = userLearningStats.length > 0
      ? Math.round(userLearningStats.reduce((total, stat) => total + stat.score, 0) / userLearningStats.length * 20)
      : 0;
    
    // Topic progress
    const topics = ['animals', 'colors', 'numbers', 'family'];
    const topicProgress = topics.map(topic => {
      const topicStats = userLearningStats.filter(stat => stat.topic === topic);
      const completed = topicStats.length;
      const totalPossible = 3; // Assuming 3 is full completion
      const percentage = Math.min(Math.round((completed / totalPossible) * 100), 100);
      
      return {
        topic,
        percentage,
        colorClass: topic === 'animals' 
          ? 'bg-secondary' 
          : topic === 'colors' 
          ? 'bg-accent' 
          : topic === 'numbers' 
          ? 'bg-primary' 
          : 'bg-destructive'
      };
    });
    
    return {
      totalTime,
      days,
      avgScore,
      topicProgress
    };
  };

  const selectedUserStats = selectedUserId ? getUserStats(parseInt(selectedUserId, 10)) : null;

  return (
    <div className="min-h-screen">
      {/* Header with Navigation */}
      <div className="bg-primary text-white p-4">
        <div className="flex items-center">
          <button 
            className="p-1 rounded-full hover:bg-white/20 mr-3"
            onClick={handleBackClick}
          >
            <i className="ri-arrow-left-line text-2xl"></i>
          </button>
          <h2 className="font-bold text-xl">Elternbereich</h2>
        </div>
      </div>
      
      {authenticated ? (
        <div className="p-6">
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-4 text-primary">Lernfortschritt</h3>
            
            {/* User Selector */}
            <div className="bg-white rounded-xl p-4 shadow-md mb-6">
              <label htmlFor="userSelect" className="block text-sm font-medium mb-2">Kind auswählen:</label>
              <Select 
                value={selectedUserId}
                onValueChange={(value) => setSelectedUserId(value)}
              >
                <SelectTrigger className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                  <SelectValue placeholder="Kind auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Learning Stats */}
            {selectedUserStats && (
              <div className="bg-white rounded-xl p-4 shadow-md">
                <div className="mb-4 pb-4 border-b border-gray-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Lernzeit gesamt</span>
                    <span className="font-bold">{formatTime(selectedUserStats.totalTime)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Tage aktiv</span>
                    <span className="font-bold">{selectedUserStats.days} Tage</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Durchschnittliche Note</span>
                    <span className="font-bold">{selectedUserStats.avgScore}%</span>
                  </div>
                </div>
                
                <h4 className="font-bold mb-2">Themenfortschritt</h4>
                <div className="space-y-3">
                  {selectedUserStats.topicProgress.map((topic) => (
                    <div key={topic.topic}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm capitalize">{topic.topic}</span>
                        <span className="text-sm font-bold">{topic.percentage}%</span>
                      </div>
                      <div className="bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className={`${topic.colorClass} h-full rounded-full`} 
                          style={{ width: `${topic.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* App Settings */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-primary">Einstellungen</h3>
            <div className="bg-white rounded-xl p-4 shadow-md">
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <div>
                  <h4 className="font-bold">Tägliches Lernziel</h4>
                  <p className="text-sm text-gray-500">Wie lange soll dein Kind täglich lernen?</p>
                </div>
                <Select 
                  value={parentSettings?.dailyGoal.toString()} 
                  onValueChange={handleDailyGoalChange}
                >
                  <SelectTrigger className="w-24 p-2 border border-gray-300 rounded-lg">
                    <SelectValue placeholder="20 min" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 min</SelectItem>
                    <SelectItem value="20">20 min</SelectItem>
                    <SelectItem value="30">30 min</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <div>
                  <h4 className="font-bold">Benachrichtigungen</h4>
                  <p className="text-sm text-gray-500">Erinnerungen an Lernzeiten</p>
                </div>
                <Switch 
                  checked={parentSettings?.notifications || false} 
                  onCheckedChange={handleNotificationsChange}
                />
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <div>
                  <h4 className="font-bold">Sound-Effekte</h4>
                  <p className="text-sm text-gray-500">Klänge bei richtigen/falschen Antworten</p>
                </div>
                <Switch 
                  checked={audioEnabled} 
                  onCheckedChange={handleSoundEffectsChange}
                />
              </div>
              
              <div className="flex justify-between items-center py-3">
                <div>
                  <h4 className="font-bold">PIN ändern</h4>
                  <p className="text-sm text-gray-500">Elternbereich-Zugangscode ändern</p>
                </div>
                <button 
                  className="p-2 bg-primary text-white rounded-lg"
                  onClick={handleChangePinClick}
                >
                  Ändern
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <PinEntry onSuccess={() => setAuthenticated(true)} />
      )}
    </div>
  );
};

export default ParentAreaPage;
