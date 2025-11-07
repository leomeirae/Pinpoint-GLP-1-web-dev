import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { useSignUp } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useColors } from '@/constants/colors';
import { createLogger } from '@/lib/logger';

const logger = createLogger('Verify-email');

export default function VerifyEmailScreen() {
  const colors = useColors();
  const { signUp, setActive, isLoaded } = useSignUp();
  const router = useRouter();

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    logger.debug('SignUp state', {
      isLoaded,
      hasSignUp: !!signUp,
      emailAddress: signUp?.emailAddress,
      status: signUp?.status,
    });

    // Se não tiver signUp, redirecionar
    if (isLoaded && !signUp) {
      Alert.alert('Erro', 'Sessão de cadastro expirou. Por favor, cadastre-se novamente.', [
        { text: 'OK', onPress: () => router.replace('/(auth)/sign-up') },
      ]);
    }
  }, [isLoaded, signUp]);

  const handleVerify = async () => {
    if (!isLoaded || !signUp) {
      Alert.alert('Erro', 'Sessão de cadastro não encontrada. Por favor, cadastre-se novamente.');
      router.replace('/(auth)/sign-up');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Remover espaços em branco e limpar o código
      const cleanCode = code.trim().replace(/\s/g, '');

      logger.debug('Attempting verification', { code: cleanCode });

      const result = await signUp.attemptEmailAddressVerification({
        code: cleanCode,
      });

      logger.info('Verification result', { status: result.status });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });

        logger.info('Email verified successfully, session created');

        // Aguardar um pouco para garantir que o usuário foi criado no Supabase
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // ✅ CRITICAL FIX: Let app/index.tsx decide routing based on onboarding_completed
        // Don't hardcode redirect to onboarding - this was causing returning users
        // to be forced through onboarding again
        logger.info('Redirecting to root - app/index.tsx will handle routing based on user state');
        router.replace('/');
      } else {
        setError(`Verificação incompleta. Status: ${result.status}`);
      }
    } catch (err: any) {
      logger.error('Verification error', err as Error);
      const errorMessage =
        err.errors?.[0]?.longMessage || err.errors?.[0]?.message || 'Código inválido';
      setError(errorMessage);
      Alert.alert('Erro', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!isLoaded || !signUp) return;

    setResendLoading(true);
    try {
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      Alert.alert('Sucesso', 'Código reenviado para seu email!');
    } catch (err: any) {
      Alert.alert('Erro', err.errors?.[0]?.message || 'Erro ao reenviar código');
    } finally {
      setResendLoading(false);
    }
  };

  const styles = getStyles(colors);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={100}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <Text style={styles.icon}>📧</Text>
            <Text style={styles.title}>Verifique seu email</Text>
            <Text style={styles.subtitle}>
              Enviamos um código de 6 dígitos para{'\n'}
              <Text style={styles.email}>{signUp?.emailAddress}</Text>
            </Text>

            <View style={styles.form}>
              <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                  💡 O código tem 6 dígitos e foi enviado para seu email. Pode levar alguns minutos
                  para chegar.
                </Text>
              </View>

              <Input
                label="Código de verificação"
                placeholder="000000"
                value={code}
                onChangeText={(text) => {
                  const cleaned = text.replace(/\D/g, '');
                  setCode(cleaned);
                  // Auto-verificar quando tiver 6 dígitos
                  if (cleaned.length === 6) {
                    Keyboard.dismiss();
                  }
                }}
                keyboardType="number-pad"
                maxLength={6}
                autoComplete="one-time-code"
                autoFocus
                returnKeyType="done"
                onSubmitEditing={() => {
                  if (code.length === 6) {
                    handleVerify();
                  }
                }}
              />

              {error && <Text style={styles.errorText}>{error}</Text>}

              <Button
                label="Verificar"
                onPress={handleVerify}
                loading={loading}
                disabled={code.length !== 6}
              />

              <Button
                label="Reenviar código"
                onPress={handleResendCode}
                variant="outline"
                loading={resendLoading}
              />

              <Button label="Voltar" onPress={() => router.back()} variant="secondary" />
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const getStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
    },
    content: {
      padding: 24,
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100%',
    },
    icon: {
      fontSize: 64,
      marginBottom: 16,
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      marginBottom: 32,
      textAlign: 'center',
      lineHeight: 24,
    },
    email: {
      color: colors.primary,
      fontWeight: '600',
    },
    form: {
      gap: 16,
      width: '100%',
    },
    infoBox: {
      backgroundColor: colors.card,
      padding: 16,
      borderRadius: 12,
      borderLeftWidth: 4,
      borderLeftColor: colors.primary,
    },
    infoText: {
      color: colors.textSecondary,
      fontSize: 14,
      lineHeight: 20,
    },
    errorText: {
      color: colors.error,
      fontSize: 14,
      textAlign: 'center',
    },
  });
