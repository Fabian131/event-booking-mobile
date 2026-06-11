import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const KNOWN_KEYS = ['auth_token', 'auth_user'];

export const storage = {
  set(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      try {
        localStorage.setItem(key, value);
        return Promise.resolve();
      } catch (e) {
        return Promise.reject(e);
      }
    }
    return SecureStore.setItemAsync(key, value);
  },

  get(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      try {
        return Promise.resolve(localStorage.getItem(key));
      } catch (e) {
        return Promise.resolve(null);
      }
    }
    return SecureStore.getItemAsync(key);
  },

  remove(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      try {
        localStorage.removeItem(key);
        return Promise.resolve();
      } catch (e) {
        return Promise.reject(e);
      }
    }
    return SecureStore.deleteItemAsync(key);
  },

  async clear(): Promise<void> {
    if (Platform.OS === 'web') {
      KNOWN_KEYS.forEach(key => localStorage.removeItem(key));
      return Promise.resolve();
    }
    await Promise.all(KNOWN_KEYS.map((key) => SecureStore.deleteItemAsync(key)));
  },
};
