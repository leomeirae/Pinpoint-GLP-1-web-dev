import { ClerkProvider, useAuth as useClerkAuth } from '@clerk/clerk-expo';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Token cache que funciona tanto na web quanto em mobile
const tokenCache = {
  async getToken(key: string) {
    try {
      if (Platform.OS === 'web') {
        // Na web, usar localStorage
        return localStorage.getItem(key);
      }
      // Em mobile, usar SecureStore
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error('Token cache get error:', error);
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      if (Platform.OS === 'web') {
        // Na web, usar localStorage
        localStorage.setItem(key, value);
        return;
      }
      // Em mobile, usar SecureStore
      return await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error('Token cache set error:', error);
    }
  },
};

// Exportar provider configurado
export { ClerkProvider, tokenCache };

// Re-exportar hooks de auth
export { useClerkAuth as useAuth };
export { useUser, useSignIn, useSignUp, useAuth as useClerkAuthFull } from '@clerk/clerk-expo';

// Validar publishable key
export function validateClerkKey() {
  const key = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!key) {
    throw new Error(
      'EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY não encontrada em .env.local'
    );
  }
  return key;
}
