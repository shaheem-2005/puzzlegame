/**
 * IndexedDB storage for storing original full-resolution photos
 * without localStorage size limit (5MB) constraints.
 */

const DB_NAME = 'LegendPuzzlePhotoDB';
const DB_VERSION = 1;
const STORE_NAME = 'original_photos';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveOriginalPhoto(id: string, dataUrl: string, fileName?: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put({ id, dataUrl, fileName, updatedAt: Date.now() });

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to save photo to IndexedDB', err);
    // Fallback to localStorage
    try {
      localStorage.setItem(`legend_photo_${id}`, dataUrl);
    } catch {
      // ignore
    }
  }
}

export async function getOriginalPhoto(id: string): Promise<string | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);

      req.onsuccess = () => {
        if (req.result && req.result.dataUrl) {
          resolve(req.result.dataUrl);
        } else {
          // Check localStorage fallback
          const local = localStorage.getItem(`legend_photo_${id}`);
          resolve(local || null);
        }
      };

      req.onerror = () => {
        const local = localStorage.getItem(`legend_photo_${id}`);
        resolve(local || null);
      };
    });
  } catch {
    const local = localStorage.getItem(`legend_photo_${id}`);
    return local || null;
  }
}

export async function getAllOriginalPhotos(): Promise<Record<string, string>> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();

      req.onsuccess = () => {
        const map: Record<string, string> = {};
        if (req.result && Array.isArray(req.result)) {
          req.result.forEach((item) => {
            if (item && item.id && item.dataUrl) {
              map[item.id] = item.dataUrl;
            }
          });
        }
        resolve(map);
      };

      req.onerror = () => resolve({});
    });
  } catch {
    return {};
  }
}

export async function deleteOriginalPhoto(id: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);

      req.onsuccess = () => {
        localStorage.removeItem(`legend_photo_${id}`);
        resolve();
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    localStorage.removeItem(`legend_photo_${id}`);
  }
}
