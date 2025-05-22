import { useCallback, useState } from 'react';

interface UseIndexedDBOptions {
  dbName: string;
  version: number;
  stores: { 
    name: string; 
    keyPath: string;
    indices?: { name: string; keyPath: string; options?: IDBIndexParameters }[];
  }[];
}

export default function useIndexedDB<T>({ dbName, version, stores }: UseIndexedDBOptions) {
  const [isReady, setIsReady] = useState(false);
  const [db, setDb] = useState<IDBDatabase | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const initDB = useCallback(async () => {
    try {
      const request = indexedDB.open(dbName, version);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores
        stores.forEach((store) => {
          if (!db.objectStoreNames.contains(store.name)) {
            const objectStore = db.createObjectStore(store.name, { keyPath: store.keyPath });
            
            // Create indices if provided
            if (store.indices) {
              store.indices.forEach((index) => {
                objectStore.createIndex(index.name, index.keyPath, index.options);
              });
            }
          }
        });
      };
      
      request.onsuccess = (event) => {
        const database = (event.target as IDBOpenDBRequest).result;
        setDb(database);
        setIsReady(true);
      };
      
      request.onerror = (event) => {
        setError(new Error(`Database error: ${(event.target as IDBOpenDBRequest).error}`));
      };
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error initializing IndexedDB'));
    }
  }, [dbName, version, stores]);

  const addItem = useCallback(async <T>(storeName: string, item: T): Promise<T> => {
    return new Promise((resolve, reject) => {
      if (!db) {
        reject(new Error('Database not initialized'));
        return;
      }
      
      try {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.add(item);
        
        request.onsuccess = () => {
          resolve(item);
        };
        
        request.onerror = () => {
          reject(new Error('Error adding item to the store'));
        };
      } catch (err) {
        reject(err);
      }
    });
  }, [db]);

  const getItem = useCallback(async (storeName: string, key: string | number): Promise<T | undefined> => {
    return new Promise((resolve, reject) => {
      if (!db) {
        reject(new Error('Database not initialized'));
        return;
      }
      
      try {
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.get(key);
        
        request.onsuccess = () => {
          resolve(request.result);
        };
        
        request.onerror = () => {
          reject(new Error('Error getting item from the store'));
        };
      } catch (err) {
        reject(err);
      }
    });
  }, [db]);

  const updateItem = useCallback(async <T>(storeName: string, item: T): Promise<T> => {
    return new Promise((resolve, reject) => {
      if (!db) {
        reject(new Error('Database not initialized'));
        return;
      }
      
      try {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.put(item);
        
        request.onsuccess = () => {
          resolve(item);
        };
        
        request.onerror = () => {
          reject(new Error('Error updating item in the store'));
        };
      } catch (err) {
        reject(err);
      }
    });
  }, [db]);

  const deleteItem = useCallback(async (storeName: string, key: string | number): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!db) {
        reject(new Error('Database not initialized'));
        return;
      }
      
      try {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.delete(key);
        
        request.onsuccess = () => {
          resolve();
        };
        
        request.onerror = () => {
          reject(new Error('Error deleting item from the store'));
        };
      } catch (err) {
        reject(err);
      }
    });
  }, [db]);

  const getAllItems = useCallback(async <T>(storeName: string): Promise<T[]> => {
    return new Promise((resolve, reject) => {
      if (!db) {
        reject(new Error('Database not initialized'));
        return;
      }
      
      try {
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();
        
        request.onsuccess = () => {
          resolve(request.result);
        };
        
        request.onerror = () => {
          reject(new Error('Error getting all items from the store'));
        };
      } catch (err) {
        reject(err);
      }
    });
  }, [db]);

  return {
    isReady,
    error,
    initDB,
    addItem,
    getItem,
    updateItem,
    deleteItem,
    getAllItems
  };
}
