import { ClerkProvider, useAuth as useClerkAuth } from '@clerk/clerk-expo';
import * as SecureStore from 'expo-secure-store';

// Token cache para persistência
const tokenCache = {
  async getToken(key: string) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error('SecureStore get error:', error);
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error('SecureStore set error:', error);
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
