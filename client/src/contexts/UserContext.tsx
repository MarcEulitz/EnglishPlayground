import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import useIndexedDB from '@/hooks/use-indexeddb';
import { User, LearningStat, Achievement, ParentSettings } from '@shared/schema';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';

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
  isOnline: boolean;
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
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [learningStats, setLearningStats] = useState<LearningStat[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [parentSettings, setParentSettings] = useState<ParentSettings | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  
  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

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

  // Queries
  const { 
    data: apiUsers, 
    isLoading: isLoadingUsers,
    error: usersError
  } = useQuery({
    queryKey: ['/api/users'],
    enabled: isOnline
  });

  const {
    data: apiParentSettings,
    isLoading: isLoadingParentSettings,
    error: parentSettingsError
  } = useQuery({
    queryKey: ['/api/parent-settings'],
    enabled: isOnline
  });

  // Loading state
  const isLoading = isLoadingUsers || isLoadingParentSettings;

  // Load stats and achievements only for current user
  const {
    data: apiLearningStats,
    isLoading: isLoadingStats
  } = useQuery({
    queryKey: ['/api/users', currentUser?.id, 'learning-stats'],
    enabled: !!currentUser && isOnline
  });

  const {
    data: apiAchievements,
    isLoading: isLoadingAchievements
  } = useQuery({
    queryKey: ['/api/users', currentUser?.id, 'achievements'],
    enabled: !!currentUser && isOnline
  });

  // Mutations
  const createUserMutation = useMutation({
    mutationFn: (user: Omit<User, 'id' | 'createdAt'>) => 
      apiRequest('/api/users', 'POST', user),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
    }
  });

  const createStatMutation = useMutation({
    mutationFn: (stat: Omit<LearningStat, 'id' | 'date'>) => 
      apiRequest('/api/learning-stats', 'POST', stat),
    onSuccess: () => {
      if (currentUser) {
        queryClient.invalidateQueries({ 
          queryKey: ['/api/users', currentUser.id, 'learning-stats'] 
        });
      }
    }
  });

  const createAchievementMutation = useMutation({
    mutationFn: (achievement: Omit<Achievement, 'id' | 'dateEarned'>) => 
      apiRequest('/api/achievements', 'POST', achievement),
    onSuccess: () => {
      if (currentUser) {
        queryClient.invalidateQueries({ 
          queryKey: ['/api/users', currentUser.id, 'achievements'] 
        });
      }
    }
  });

  const updateParentSettingsMutation = useMutation({
    mutationFn: ({ id, settings }: { id: number, settings: Partial<ParentSettings> }) => 
      apiRequest(`/api/parent-settings/${id}`, 'PUT', settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/parent-settings'] });
    }
  });

  const validatePinMutation = useMutation({
    mutationFn: (pin: string) => 
      apiRequest('/api/validate-pin', 'POST', { pin })
  });

  // Effect to update local state from API data when online
  useEffect(() => {
    if (isOnline) {
      if (apiUsers && !usersError) {
        setUsers(apiUsers);
      }
      
      if (apiParentSettings && !parentSettingsError) {
        setParentSettings(apiParentSettings);
      }
      
      if (apiLearningStats && currentUser) {
        setLearningStats(apiLearningStats);
      }
      
      if (apiAchievements && currentUser) {
        setAchievements(apiAchievements);
      }
    }
  }, [
    isOnline, 
    apiUsers, 
    apiParentSettings, 
    apiLearningStats, 
    apiAchievements,
    currentUser,
    usersError,
    parentSettingsError
  ]);

  const initializeDb = useCallback(async () => {
    // Initialize IndexedDB
    await initDB();
    
    if (isOnline) {
      // If online, we rely on React Query to fetch the data
      await refreshUserData();
    } else {
      // If offline, we load from IndexedDB
      const loadedUsers = await getAllItems<User>('users');
      setUsers(loadedUsers);
      
      const loadedStats = await getAllItems<LearningStat>('learningStats');
      setLearningStats(loadedStats);
      
      const loadedAchievements = await getAllItems<Achievement>('achievements');
      setAchievements(loadedAchievements);
      
      // Create or get parent settings
      const allSettings = await getAllItems<ParentSettings>('parentSettings');
      if (allSettings.length === 0) {
        await addItem('parentSettings', defaultParentSettings);
        setParentSettings(defaultParentSettings);
      } else {
        setParentSettings(allSettings[0]);
      }
    }
  }, [initDB, addItem, getAllItems, isOnline, refreshUserData]);

  const refreshUserData = useCallback(async () => {
    if (isOnline) {
      // Invalidate and refetch all queries
      await queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/parent-settings'] });
      
      if (currentUser) {
        await queryClient.invalidateQueries({ 
          queryKey: ['/api/users', currentUser.id, 'learning-stats'] 
        });
        await queryClient.invalidateQueries({ 
          queryKey: ['/api/users', currentUser.id, 'achievements'] 
        });
      }
    } else {
      // Offline mode - load from IndexedDB
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
    }
  }, [
    getAllItems, 
    currentUser, 
    getItem, 
    isOnline, 
    queryClient
  ]);

  const addUser = useCallback(async (userData: Omit<User, 'id' | 'createdAt'>): Promise<User> => {
    if (isOnline) {
      // Use API
      const newUser = await createUserMutation.mutateAsync(userData);
      
      // Also save to IndexedDB for offline access
      await addItem('users', newUser);
      
      // Refresh data
      await refreshUserData();
      
      return newUser;
    } else {
      // Offline mode - use IndexedDB
      const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
      const newUser: User = {
        ...userData,
        id: newId,
        createdAt: new Date()
      };
      
      await addItem('users', newUser);
      await refreshUserData();
      return newUser;
    }
  }, [
    createUserMutation, 
    addItem, 
    users, 
    refreshUserData, 
    isOnline
  ]);

  const updateUser = useCallback(async (user: User): Promise<User> => {
    // We don't have an API endpoint for updating users yet,
    // so we'll just update in IndexedDB for now
    await updateItem('users', user);
    await refreshUserData();
    return user;
  }, [updateItem, refreshUserData]);

  const addLearningStat = useCallback(async (statData: Omit<LearningStat, 'id' | 'date'>): Promise<LearningStat> => {
    if (isOnline) {
      // Use API
      const newStat = await createStatMutation.mutateAsync(statData);
      
      // Also save to IndexedDB for offline access
      await addItem('learningStats', newStat);
      
      // Refresh data
      await refreshUserData();
      
      return newStat;
    } else {
      // Offline mode - use IndexedDB
      const newId = learningStats.length > 0 ? Math.max(...learningStats.map(s => s.id)) + 1 : 1;
      const newStat: LearningStat = {
        ...statData,
        id: newId,
        date: new Date()
      };
      
      await addItem('learningStats', newStat);
      await refreshUserData();
      return newStat;
    }
  }, [
    createStatMutation, 
    addItem, 
    learningStats, 
    refreshUserData, 
    isOnline
  ]);

  const addAchievement = useCallback(async (achievementData: Omit<Achievement, 'id' | 'dateEarned'>): Promise<Achievement> => {
    if (isOnline) {
      // Use API
      const newAchievement = await createAchievementMutation.mutateAsync(achievementData);
      
      // Also save to IndexedDB for offline access
      await addItem('achievements', newAchievement);
      
      // Refresh data
      await refreshUserData();
      
      return newAchievement;
    } else {
      // Offline mode - use IndexedDB
      const newId = achievements.length > 0 ? Math.max(...achievements.map(a => a.id)) + 1 : 1;
      const newAchievement: Achievement = {
        ...achievementData,
        id: newId,
        dateEarned: new Date()
      };
      
      await addItem('achievements', newAchievement);
      await refreshUserData();
      return newAchievement;
    }
  }, [
    createAchievementMutation, 
    addItem, 
    achievements, 
    refreshUserData, 
    isOnline
  ]);

  const updateParentSettings = useCallback(async (settingsData: Partial<ParentSettings>): Promise<ParentSettings> => {
    if (!parentSettings) {
      throw new Error('Parent settings not initialized');
    }
    
    if (isOnline) {
      // Use API
      const updatedSettings = await updateParentSettingsMutation.mutateAsync({
        id: parentSettings.id,
        settings: settingsData
      });
      
      // Also update in IndexedDB
      await updateItem('parentSettings', updatedSettings);
      setParentSettings(updatedSettings);
      
      // Update local storage for sound effects preference
      if (settingsData.soundEffects !== undefined) {
        localStorage.setItem('soundEffects', String(settingsData.soundEffects));
      }
      
      return updatedSettings;
    } else {
      // Offline mode - use IndexedDB
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
    }
  }, [
    parentSettings, 
    updateItem, 
    updateParentSettingsMutation, 
    isOnline
  ]);

  const validatePin = useCallback(async (pin: string): Promise<boolean> => {
    if (isOnline) {
      try {
        const response = await validatePinMutation.mutateAsync(pin);
        return response.valid;
      } catch (error) {
        console.error('Failed to validate PIN:', error);
        // Fallback to local validation
        return parentSettings?.pin === pin;
      }
    } else {
      // Offline mode - use local validation
      return parentSettings?.pin === pin;
    }
  }, [parentSettings, validatePinMutation, isOnline]);

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
    isLoading,
    isOnline
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
