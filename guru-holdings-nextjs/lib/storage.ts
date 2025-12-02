const unavailableError = new Error('localStorage is unavailable');

interface StorageResult<T> {
  value: T | null;
  error: Error | null;
}

interface WriteResult {
  success: boolean;
  error: Error | null;
}

const resolveStorage = (): { storage: Storage | null; error: Error | null } => {
  if (typeof window === 'undefined') {
    return { storage: null, error: unavailableError };
  }

  try {
    return { storage: window.localStorage, error: null };
  } catch (error) {
    return { storage: null, error: error as Error };
  }
};

export const readStorageValue = (key: string): StorageResult<string> => {
  const { storage, error } = resolveStorage();

  if (!storage) {
    return { value: null, error };
  }

  try {
    return { value: storage.getItem(key), error: null };
  } catch (readError) {
    return { value: null, error: readError as Error };
  }
};

export const writeStorageValue = (key: string, value: string): WriteResult => {
  const { storage, error } = resolveStorage();

  if (!storage) {
    return { success: false, error };
  }

  try {
    storage.setItem(key, value);
    return { success: true, error: null };
  } catch (writeError) {
    return { success: false, error: writeError as Error };
  }
};

export const readStorageJSON = <T>(key: string, fallbackValue: T): StorageResult<T> => {
  const { value, error } = readStorageValue(key);

  if (error || value === null) {
    return { value: fallbackValue, error };
  }

  try {
    return { value: JSON.parse(value) as T, error: null };
  } catch (parseError) {
    return { value: fallbackValue, error: parseError as Error };
  }
};

export const writeStorageJSON = <T>(key: string, data: T): WriteResult => {
  try {
    const serialized = JSON.stringify(data);
    return writeStorageValue(key, serialized);
  } catch (stringifyError) {
    return { success: false, error: stringifyError as Error };
  }
};

