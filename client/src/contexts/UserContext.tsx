import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import useIndexedDB from '@/hooks/use-indexeddb';
import { User, LearningStat, Achievement, ParentSettings } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';

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
  validatePin: (pin: string) => Promise<boolean>;
  refreshUserData: () => Promise<void>;
  isLoading: boolean;
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

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [learningStats, setLearningStats] = useState<LearningStat[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [parentSettings, setParentSettings] = useState<ParentSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

  const fetchUsers = async () => {
    try {
      const response = await apiRequest<User[]>('/api/users');
      if (response) {
        setUsers(response);
        // Also store in IndexedDB for offline use
        for (const user of response) {
          await addItem('users', user);
        }
      }
    } catch (error) {
      console.log('Using local IndexedDB data for users');
      const localUsers = await getAllItems('users');
      setUsers(localUsers as User[]);
    }
  };

  const fetchParentSettings = async () => {
    try {
      const response = await apiRequest<ParentSettings>('/api/parent-settings');
      if (response) {
        setParentSettings(response);
        // Store in IndexedDB
        await addItem('parentSettings', response);
      }
    } catch (error) {
      console.log('Using local IndexedDB data for parent settings');
      const localSettings = await getAllItems('parentSettings');
      if (localSettings && localSettings.length > 0) {
        setParentSettings(localSettings[0] as ParentSettings);
      } else {
        // Initialize with defaults
        setParentSettings(defaultParentSettings);
        await addItem('parentSettings', defaultParentSettings);
      }
    }
  };

  const fetchUserData = async (userId: number) => {
    if (!userId) return;

    try {
      // Fetch learning stats
      const stats = await apiRequest<LearningStat[]>(`/api/users/${userId}/learning-stats`);
      if (stats) {
        setLearningStats(stats);
        // Store in IndexedDB
        for (const stat of stats) {
          await addItem('learningStats', stat);
        }
      }

      // Fetch achievements
      const achievements = await apiRequest<Achievement[]>(`/api/users/${userId}/achievements`);
      if (achievements) {
        setAchievements(achievements);
        // Store in IndexedDB
        for (const achievement of achievements) {
          await addItem('achievements', achievement);
        }
      }
    } catch (error) {
      console.log('Using local IndexedDB data for user stats and achievements');
      
      // Load from IndexedDB
      const localStats = await getAllItems('learningStats');
      const userStats = (localStats as LearningStat[]).filter(stat => stat.userId === userId);
      setLearningStats(userStats);
      
      const localAchievements = await getAllItems('achievements');
      const userAchievements = (localAchievements as Achievement[]).filter(a => a.userId === userId);
      setAchievements(userAchievements);
    }
  };

  const refreshUserData = useCallback(async () => {
    setIsLoading(true);
    try {
      await fetchUsers();
      await fetchParentSettings();
      
      if (currentUser) {
        await fetchUserData(currentUser.id);
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  const initializeDb = useCallback(async () => {
    setIsLoading(true);
    try {
      await initDB();
      await refreshUserData();
    } catch (error) {
      console.error('Error initializing database:', error);
      
      // Fall back to local data
      const localUsers = await getAllItems('users');
      setUsers(localUsers as User[]);
      
      const localSettings = await getAllItems('parentSettings');
      if (localSettings && localSettings.length > 0) {
        setParentSettings(localSettings[0] as ParentSettings);
      } else {
        // Initialize with defaults
        setParentSettings(defaultParentSettings);
        await addItem('parentSettings', defaultParentSettings);
      }
      
      if (currentUser) {
        const localStats = await getAllItems('learningStats');
        const userStats = (localStats as LearningStat[]).filter(stat => stat.userId === currentUser.id);
        setLearningStats(userStats);
        
        const localAchievements = await getAllItems('achievements');
        const userAchievements = (localAchievements as Achievement[]).filter(a => a.userId === currentUser.id);
        setAchievements(userAchievements);
      }
    } finally {
      setIsLoading(false);
    }
  }, [initDB, currentUser]);

  // Effect to fetch user data when current user changes
  useEffect(() => {
    if (currentUser) {
      fetchUserData(currentUser.id);
    } else {
      setLearningStats([]);
      setAchievements([]);
    }
  }, [currentUser]);

  const addUser = useCallback(async (userData: Omit<User, 'id' | 'createdAt'>): Promise<User> => {
    try {
      // Try API first
      const newUser = await apiRequest<User>('/api/users', 'POST', userData);
      if (newUser) {
        await addItem('users', newUser);
        await refreshUserData();
        return newUser;
      }
      throw new Error('Failed to create user via API');
    } catch (error) {
      console.log('Using IndexedDB for user creation (offline mode)');
      
      // Fall back to local creation
      const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
      const newUser: User = {
        ...userData,
        id: newId,
        createdAt: new Date()
      };
      
      await addItem('users', newUser);
      const updatedUsers = [...users, newUser];
      setUsers(updatedUsers);
      
      return newUser;
    }
  }, [users, addItem, refreshUserData]);

  const updateUser = useCallback(async (user: User): Promise<User> => {
    // Currently we don't have an API endpoint for updating users
    await updateItem('users', user);
    
    // Update local state
    const updatedUsers = users.map(u => u.id === user.id ? user : u);
    setUsers(updatedUsers);
    
    if (currentUser && currentUser.id === user.id) {
      setCurrentUser(user);
    }
    
    return user;
  }, [users, updateItem, currentUser]);

  const addLearningStat = useCallback(async (statData: Omit<LearningStat, 'id' | 'date'>): Promise<LearningStat> => {
    try {
      // Try API first
      const newStat = await apiRequest<LearningStat>('/api/learning-stats', 'POST', statData);
      if (newStat) {
        await addItem('learningStats', newStat);
        const updatedStats = [...learningStats, newStat];
        setLearningStats(updatedStats);
        return newStat;
      }
      throw new Error('Failed to create learning stat via API');
    } catch (error) {
      console.log('Using IndexedDB for stat creation (offline mode)');
      
      // Fall back to local creation
      const newId = learningStats.length > 0 ? Math.max(...learningStats.map(s => s.id)) + 1 : 1;
      const newStat: LearningStat = {
        ...statData,
        id: newId,
        date: new Date()
      };
      
      await addItem('learningStats', newStat);
      const updatedStats = [...learningStats, newStat];
      setLearningStats(updatedStats);
      
      return newStat;
    }
  }, [learningStats, addItem]);

  const addAchievement = useCallback(async (achievementData: Omit<Achievement, 'id' | 'dateEarned'>): Promise<Achievement> => {
    try {
      // Try API first
      const newAchievement = await apiRequest<Achievement>('/api/achievements', 'POST', achievementData);
      if (newAchievement) {
        await addItem('achievements', newAchievement);
        const updatedAchievements = [...achievements, newAchievement];
        setAchievements(updatedAchievements);
        return newAchievement;
      }
      throw new Error('Failed to create achievement via API');
    } catch (error) {
      console.log('Using IndexedDB for achievement creation (offline mode)');
      
      // Fall back to local creation
      const newId = achievements.length > 0 ? Math.max(...achievements.map(a => a.id)) + 1 : 1;
      const newAchievement: Achievement = {
        ...achievementData,
        id: newId,
        dateEarned: new Date()
      };
      
      await addItem('achievements', newAchievement);
      const updatedAchievements = [...achievements, newAchievement];
      setAchievements(updatedAchievements);
      
      return newAchievement;
    }
  }, [achievements, addItem]);

  const updateParentSettings = useCallback(async (settingsData: Partial<ParentSettings>): Promise<ParentSettings> => {
    if (!parentSettings) {
      throw new Error('Parent settings not initialized');
    }
    
    try {
      // Try API first
      const updatedSettings = await apiRequest<ParentSettings>(`/api/parent-settings/${parentSettings.id}`, 'PUT', settingsData);
      if (updatedSettings) {
        await updateItem('parentSettings', updatedSettings);
        setParentSettings(updatedSettings);
        
        // Update local storage for sound effects preference
        if (settingsData.soundEffects !== undefined) {
          localStorage.setItem('soundEffects', String(settingsData.soundEffects));
        }
        
        return updatedSettings;
      }
      throw new Error('Failed to update parent settings via API');
    } catch (error) {
      console.log('Using IndexedDB for settings update (offline mode)');
      
      // Fall back to local update
      const newSettings: ParentSettings = {
        ...parentSettings,
        ...settingsData
      };
      
      await updateItem('parentSettings', newSettings);
      setParentSettings(newSettings);
      
      // Update local storage for sound effects preference
      if (settingsData.soundEffects !== undefined) {
        localStorage.setItem('soundEffects', String(settingsData.soundEffects));
      }
      
      return newSettings;
    }
  }, [parentSettings, updateItem]);

  const validatePin = useCallback(async (pin: string): Promise<boolean> => {
    try {
      // Try API first
      const response = await apiRequest<{valid: boolean}>('/api/validate-pin', 'POST', { pin });
      return response.valid;
    } catch (error) {
      console.log('Using local PIN validation (offline mode)');
      // Fall back to local validation
      return parentSettings?.pin === pin;
    }
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
    refreshUserData,
    isLoading
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export function useUserContext() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
}
