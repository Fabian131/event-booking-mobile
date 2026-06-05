import * as SecureStore from 'expo-secure-store';

const KNOWN_KEYS = ['auth_token', 'auth_user'];

export const storage = {
  set(key: string, value: string): Promise<void> {
    return SecureStore.setItemAsync(key, value);
  },

  get(key: string): Promise<string | null> {
    return SecureStore.getItemAsync(key);
  },

  remove(key: string): Promise<void> {
    return SecureStore.deleteItemAsync(key);
  },

  async clear(): Promise<void> {
    await Promise.all(KNOWN_KEYS.map((key) => SecureStore.deleteItemAsync(key)));
  },
};
