const memoryStore = new Map<string, string>();

let nativeLib: {
  getItemAsync: (key: string) => Promise<string | null>;
  setItemAsync: (key: string, value: string) => Promise<void>;
  deleteItemAsync: (key: string) => Promise<void>;
} | null = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  nativeLib = require('expo-secure-store');
} catch {
  nativeLib = null;
}

const KNOWN_KEYS = ['auth_token', 'auth_user'];

async function safeSet(key: string, value: string): Promise<void> {
  if (nativeLib) {
    try {
      await nativeLib.setItemAsync(key, value);
      return;
    } catch {
      nativeLib = null;
    }
  }
  memoryStore.set(key, value);
}

async function safeGet(key: string): Promise<string | null> {
  if (nativeLib) {
    try {
      return await nativeLib.getItemAsync(key);
    } catch {
      nativeLib = null;
    }
  }
  return memoryStore.get(key) ?? null;
}

async function safeDelete(key: string): Promise<void> {
  if (nativeLib) {
    try {
      await nativeLib.deleteItemAsync(key);
      return;
    } catch {
      nativeLib = null;
    }
  }
  memoryStore.delete(key);
}

export const storage = {
  set: safeSet,
  get: safeGet,
  remove: safeDelete,
  async clear(): Promise<void> {
    await Promise.all(KNOWN_KEYS.map((key) => safeDelete(key)));
  },
};
