import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import useIndexedDB from '@/hooks/use-indexeddb';
import { User, LearningStat, Achievement, ParentSettings } from '@shared/schema';

interface UserContextType {
  currentUser: User | null;
  users: User[];
  learningStats: LearningStat[];
  achievements: Achievement[];
  parentSettings: ParentSettings | null;
  initializeDb: () => Promise<void>;
  setCurrentUser: (user: User | null) => void;
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => Promise<User>;
  updateUser: (user: User) => Promise<User>;
  addLearningStat: (stat: Omit<LearningStat, 'id' | 'date'>) => Promise<LearningStat>;
  addAchievement: (achievement: Omit<Achievement, 'id' | 'dateEarned'>) => Promise<Achievement>;
  updateParentSettings: (settings: Partial<ParentSettings>) => Promise<ParentSettings>;
  validatePin: (pin: string) => boolean;
  refreshUserData: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

const defaultParentSettings: ParentSettings = {
  id: 1,
  pin: '1234',
  dailyGoal: 20,
  notifications: true,
  soundEffects: true
};

export const UserProvider = ({ children }: UserProviderProps) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [learningStats, setLearningStats] = useState<LearningStat[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [parentSettings, setParentSettings] = useState<ParentSettings | null>(null);

  const { 
    initDB, 
    addItem, 
    getAllItems, 
    updateItem,
    getItem
  } = useIndexedDB({
    dbName: 'mias-englischwelt',
    version: 1,
    stores: [
      { 
        name: 'users', 
        keyPath: 'id',
        indices: [{ name: 'username', keyPath: 'username' }]
      },
      { 
        name: 'learningStats', 
        keyPath: 'id',
        indices: [{ name: 'userId', keyPath: 'userId' }]
      },
      { 
        name: 'achievements', 
        keyPath: 'id',
        indices: [{ name: 'userId', keyPath: 'userId' }]
      },
      { 
        name: 'parentSettings', 
        keyPath: 'id' 
      }
    ]
  });

  const initializeDb = useCallback(async () => {
    await initDB();
    
    // Load all data
    await refreshUserData();
    
    // Create default parent settings if none exist
    const allSettings = await getAllItems<ParentSettings>('parentSettings');
    if (allSettings.length === 0) {
      await addItem('parentSettings', defaultParentSettings);
      setParentSettings(defaultParentSettings);
    } else {
      setParentSettings(allSettings[0]);
    }
  }, [initDB, addItem, getAllItems]);

  const refreshUserData = useCallback(async () => {
    const loadedUsers = await getAllItems<User>('users');
    setUsers(loadedUsers);
    
    const loadedStats = await getAllItems<LearningStat>('learningStats');
    setLearningStats(loadedStats);
    
    const loadedAchievements = await getAllItems<Achievement>('achievements');
    setAchievements(loadedAchievements);
    
    // If there's a current user, refresh its data
    if (currentUser) {
      const refreshedUser = await getItem<User>('users', currentUser.id);
      if (refreshedUser) {
        setCurrentUser(refreshedUser);
      }
    }
  }, [getAllItems, currentUser, getItem]);

  const addUser = useCallback(async (userData: Omit<User, 'id' | 'createdAt'>): Promise<User> => {
    const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
    const newUser: User = {
      ...userData,
      id: newId,
      createdAt: new Date()
    };
    
    await addItem('users', newUser);
    await refreshUserData();
    return newUser;
  }, [addItem, users, refreshUserData]);

  const updateUser = useCallback(async (user: User): Promise<User> => {
    await updateItem('users', user);
    await refreshUserData();
    return user;
  }, [updateItem, refreshUserData]);

  const addLearningStat = useCallback(async (statData: Omit<LearningStat, 'id' | 'date'>): Promise<LearningStat> => {
    const newId = learningStats.length > 0 ? Math.max(...learningStats.map(s => s.id)) + 1 : 1;
    const newStat: LearningStat = {
      ...statData,
      id: newId,
      date: new Date()
    };
    
    await addItem('learningStats', newStat);
    await refreshUserData();
    return newStat;
  }, [addItem, learningStats, refreshUserData]);

  const addAchievement = useCallback(async (achievementData: Omit<Achievement, 'id' | 'dateEarned'>): Promise<Achievement> => {
    const newId = achievements.length > 0 ? Math.max(...achievements.map(a => a.id)) + 1 : 1;
    const newAchievement: Achievement = {
      ...achievementData,
      id: newId,
      dateEarned: new Date()
    };
    
    await addItem('achievements', newAchievement);
    await refreshUserData();
    return newAchievement;
  }, [addItem, achievements, refreshUserData]);

  const updateParentSettings = useCallback(async (settingsData: Partial<ParentSettings>): Promise<ParentSettings> => {
    if (!parentSettings) {
      throw new Error('Parent settings not initialized');
    }
    
    const updatedSettings: ParentSettings = {
      ...parentSettings,
      ...settingsData
    };
    
    await updateItem('parentSettings', updatedSettings);
    setParentSettings(updatedSettings);
    
    // Update local storage for sound effects preference
    if (settingsData.soundEffects !== undefined) {
      localStorage.setItem('soundEffects', String(settingsData.soundEffects));
    }
    
    return updatedSettings;
  }, [parentSettings, updateItem]);

  const validatePin = useCallback((pin: string): boolean => {
    return parentSettings?.pin === pin;
  }, [parentSettings]);

  const value = {
    currentUser,
    users,
    learningStats,
    achievements,
    parentSettings,
    initializeDb,
    setCurrentUser,
    addUser,
    updateUser,
    addLearningStat,
    addAchievement,
    updateParentSettings,
    validatePin,
    refreshUserData
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
};
