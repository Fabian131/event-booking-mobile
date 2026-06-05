import { Platform } from 'react-native';
import Constants from 'expo-constants';

function getDevApiUrl(): string {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;

  if (envUrl) {
    return envUrl;
  }

  const debuggerHost = Constants.expoConfig?.hostUri;

  if (debuggerHost) {
    const host = debuggerHost.split(':')[0];
    const port = process.env.EXPO_PUBLIC_API_PORT || '8000';
    return `http://${host}:${port}`;
  }

  const port = process.env.EXPO_PUBLIC_API_PORT || '8000';

  return Platform.select({
    android: `http://10.0.2.2:${port}`,
    ios: `http://localhost:${port}`,
    default: `http://localhost:${port}`,
  })!;
}

export const API_BASE_URL = getDevApiUrl();
