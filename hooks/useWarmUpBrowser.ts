import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

/**
 * Hook para otimizar performance do OAuth em Android
 * Pré-carrega o browser antes do fluxo de autenticação
 * See: https://docs.expo.dev/guides/authentication/#improving-user-experience
 */
export function useWarmUpBrowser() {
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    
    // Pré-aquece o browser (melhora UX em Android)
    void WebBrowser.warmUpAsync();
    
    return () => {
      // Limpa recursos quando componente desmonta
      void WebBrowser.coolDownAsync();
    };
  }, []);
}


