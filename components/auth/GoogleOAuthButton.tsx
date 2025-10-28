import React, { useCallback, useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { useSSO } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import * as AuthSession from 'expo-auth-session';
import { useWarmUpBrowser } from '@/hooks/useWarmUpBrowser';
import { COLORS } from '@/constants/colors';

// Handle any pending authentication sessions
import * as WebBrowser from 'expo-web-browser';
WebBrowser.maybeCompleteAuthSession();

interface GoogleOAuthButtonProps {
  mode?: 'signin' | 'signup';
}

export function GoogleOAuthButton({ mode = 'signin' }: GoogleOAuthButtonProps) {
  useWarmUpBrowser();
  
  const { startSSOFlow } = useSSO();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onPress = useCallback(async () => {
    try {
      setLoading(true);

      // Start the authentication process
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: 'oauth_google',
        // For native, you must pass a scheme
        redirectUrl: AuthSession.makeRedirectUri({}),
      });

      // If sign in was successful, set the active session
      if (createdSessionId) {
        await setActive!({
          session: createdSessionId,
          // Check for session tasks
          navigate: async ({ session }) => {
            if (session?.currentTask) {
              console.log('Session task:', session.currentTask);
              return;
            }
          },
        });
        
        // Navigate to home after successful login
        router.replace('/(tabs)');
      } else {
        // If there is no createdSessionId, there are missing requirements
        console.log('OAuth requires additional steps');
      }
    } catch (err: any) {
      console.error('OAuth error:', err);
      
      // Tratar erros específicos
      if (err.errors && err.errors[0]) {
        const errorCode = err.errors[0].code;
        
        if (errorCode === 'not_allowed_access') {
          console.error('Esta conta Google não tem permissão de acesso.');
        } else if (errorCode === 'oauth_access_denied') {
          // Usuário cancelou o fluxo
          console.log('Usuário cancelou o fluxo OAuth');
        } else {
          console.error('Erro ao fazer login com Google:', errorCode);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [startSSOFlow, router]);

  const buttonText = mode === 'signin' 
    ? 'Continuar com Google' 
    : 'Cadastrar com Google';

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={COLORS.text} />
      ) : (
        <View style={styles.content}>
          <Text style={styles.icon}>🔐</Text>
          <Text style={styles.text}>{buttonText}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 56,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  icon: {
    fontSize: 24,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
});


