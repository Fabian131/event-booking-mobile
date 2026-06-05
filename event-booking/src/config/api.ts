import { Platform } from 'react-native';
import Constants from 'expo-constants';

function getDevApiUrl(): string {
  const debuggerHost = Constants.expoConfig?.hostUri;

  if (debuggerHost) {
    const host = debuggerHost.split(':')[0];
    return `http://${host}:8000`;
  }

  return Platform.select({
    android: 'http://10.0.2.2:8000',
    ios: 'http://localhost:8000',
    default: 'http://localhost:8000',
  })!;
}

export const API_BASE_URL = getDevApiUrl();
