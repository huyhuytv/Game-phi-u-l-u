import { SaveGame } from '../types';

const DB_NAME = 'TienLoKyDB';
const STORE_NAME = 'saves';
const DB_VERSION = 1;

// Define a constant for the autosave key
const AUTOSAVE_KEY = 'autosave-latest';

let db: IDBDatabase;

const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) {
      return resolve(db);
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('IndexedDB error:', request.error);
      reject('IndexedDB error');
    };

    request.onsuccess = (event) => {
      db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

export const getSaves = async (): Promise<SaveGame[]> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      // Filter out the autosave from the list of manual saves
      const allSaves = request.result;
      const manualSaves = allSaves.filter(save => save.id !== AUTOSAVE_KEY);
      resolve(manualSaves);
    };
  });
};

export const loadGameFromSlot = async (id: string): Promise<SaveGame | undefined> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
};

export const saveGameToSlot = async (saveData: SaveGame): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(saveData);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
};

export const deleteGameInSlot = async (id: string): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
};

// New functions for auto-save
export const checkAutoSave = async (): Promise<boolean> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.count(AUTOSAVE_KEY);

        request.onerror = () => {
            console.error("Error checking for autosave:", request.error);
            reject(request.error);
        };
        request.onsuccess = () => {
            resolve(request.result > 0);
        };
    });
};

export const loadAutoSave = async (): Promise<SaveGame | undefined> => {
    return loadGameFromSlot(AUTOSAVE_KEY);
};

export const saveAutoSave = async (saveData: SaveGame): Promise<void> => {
    const autoSaveData = { ...saveData, id: AUTOSAVE_KEY };
    return saveGameToSlot(autoSaveData);
};
