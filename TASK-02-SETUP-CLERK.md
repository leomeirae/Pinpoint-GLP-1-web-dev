# TASK-02: Setup Clerk Auth + Paywall

## OBJETIVO
Configurar autenticação completa com Clerk, incluindo login/signup e paywall nativo para assinaturas.

## PRÉ-REQUISITOS
- TASK-01 completa e funcionando
- Conta Clerk criada em: https://dashboard.clerk.com/
- Terminal aberto na pasta `/Users/user/Desktop/mounjaro-tracker`

---

## PASSO 1: Criar aplicação no Clerk Dashboard

Acesse: https://dashboard.clerk.com/

1. Clique em **"+ Create Application"**
2. Nome: **"Mounjaro Tracker"**
3. Selecione métodos de autenticação:
   - ✅ Email
   - ✅ Google (opcional)
4. Clique em **"Create Application"**
5. **COPIE as chaves** que aparecem:
   - `CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`

---

## PASSO 2: Instalar Clerk SDK

Execute no terminal:
```bash
npx expo install @clerk/clerk-expo
npx expo install expo-secure-store
```

---

## PASSO 3: Criar arquivo .env.local

Criar arquivo `.env.local` na raiz do projeto com suas chaves do Clerk:
```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=YOUR_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY=YOUR_CLERK_SECRET_KEY
```

**IMPORTANTE**: Substituir pelos valores reais copiados do Clerk Dashboard.

---

## PASSO 4: Adicionar .env.local ao .gitignore

Adicionar ao final do arquivo `.gitignore`:
```
# Environment variables
.env.local
.env
```

---

## PASSO 5: Criar lib/clerk.ts

Criar arquivo `lib/clerk.ts`:
```typescript
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

// Re-exportar hook de auth
export { useClerkAuth as useAuth };

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
```

---

## PASSO 6: Atualizar app/_layout.tsx com ClerkProvider

SUBSTITUIR todo o conteúdo de `app/_layout.tsx` por:
```typescript
import { ClerkProvider } from '@clerk/clerk-expo';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from '@/constants/colors';
import { tokenCache, validateClerkKey } from '@/lib/clerk';

export default function RootLayout() {
  const publishableKey = validateClerkKey();

  return (
    <ClerkProvider 
      publishableKey={publishableKey} 
      tokenCache={tokenCache}
    >
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: COLORS.background,
          },
          headerTintColor: COLORS.text,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          contentStyle: {
            backgroundColor: COLORS.background,
          },
        }}
      >
        <Stack.Screen 
          name="index" 
          options={{ 
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="(auth)/sign-in" 
          options={{ 
            title: 'Entrar',
            presentation: 'modal',
          }} 
        />
        <Stack.Screen 
          name="(auth)/sign-up" 
          options={{ 
            title: 'Criar Conta',
            presentation: 'modal',
          }} 
        />
        <Stack.Screen 
          name="(tabs)" 
          options={{ 
            headerShown: false,
          }} 
        />
      </Stack>
    </ClerkProvider>
  );
}
```

---

## PASSO 7: Criar estrutura de pastas de autenticação
```bash
mkdir -p app/\(auth\)
mkdir -p app/\(tabs\)
mkdir -p components/auth
```

---

## PASSO 8: Criar componente Button reutilizável

Criar arquivo `components/ui/button.tsx`:
```typescript
import { Pressable, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS } from '@/constants/colors';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  loading?: boolean;
  disabled?: boolean;
}

export function Button({ 
  label, 
  onPress, 
  variant = 'primary',
  loading = false,
  disabled = false,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        styles[variant],
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? COLORS.primary : COLORS.text} />
      ) : (
        <Text style={[styles.text, styles[`${variant}Text`]]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  primary: {
    backgroundColor: COLORS.primary,
  },
  secondary: {
    backgroundColor: COLORS.card,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryText: {
    color: COLORS.text,
  },
  secondaryText: {
    color: COLORS.text,
  },
  outlineText: {
    color: COLORS.primary,
  },
});
```

---

## PASSO 9: Criar componente Input reutilizável

Criar arquivo `components/ui/input.tsx`:
```typescript
import { TextInput, Text, View, StyleSheet, TextInputProps } from 'react-native';
import { COLORS } from '@/constants/colors';

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
}

export function Input({ label, error, ...props }: InputProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, error && styles.inputError]}
        placeholderTextColor={COLORS.textMuted}
        {...props}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    height: 48,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  error: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: 4,
  },
});
```

---

## PASSO 10: Criar tela de Sign In

Criar arquivo `app/(auth)/sign-in.tsx`:
```typescript
import { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useSignIn } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { COLORS } from '@/constants/colors';

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = async () => {
    if (!isLoaded) return;

    setLoading(true);
    setError('');

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.replace('/(tabs)');
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Bem-vindo de volta!</Text>
        <Text style={styles.subtitle}>Entre na sua conta</Text>

        <View style={styles.form}>
          <Input
            label="Email"
            placeholder="seu@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          <Input
            label="Senha"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
          />

          {error && <Text style={styles.errorText}>{error}</Text>}

          <Button
            label="Entrar"
            onPress={handleSignIn}
            loading={loading}
          />

          <Button
            label="Criar nova conta"
            onPress={() => router.push('/(auth)/sign-up')}
            variant="outline"
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 32,
  },
  form: {
    gap: 16,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 14,
    textAlign: 'center',
  },
});
```

---

## PASSO 11: Criar tela de Sign Up

Criar arquivo `app/(auth)/sign-up.tsx`:
```typescript
import { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useSignUp } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { COLORS } from '@/constants/colors';

export default function SignUpScreen() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignUp = async () => {
    if (!isLoaded) return;

    setLoading(true);
    setError('');

    try {
      const result = await signUp.create({
        emailAddress: email,
        password,
      });

      // Enviar código de verificação
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });

      // Por simplicidade, vamos direto para as tabs
      // Em produção, você criaria uma tela de verificação
      if (result.status === 'complete' || result.status === 'missing_requirements') {
        await setActive({ session: result.createdSessionId });
        router.replace('/(tabs)');
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Crie sua conta</Text>
        <Text style={styles.subtitle}>Comece a acompanhar seu progresso</Text>

        <View style={styles.form}>
          <Input
            label="Email"
            placeholder="seu@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          <Input
            label="Senha"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
          />

          {error && <Text style={styles.errorText}>{error}</Text>}

          <Button
            label="Criar Conta"
            onPress={handleSignUp}
            loading={loading}
          />

          <Button
            label="Já tenho conta"
            onPress={() => router.push('/(auth)/sign-in')}
            variant="outline"
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 32,
  },
  form: {
    gap: 16,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 14,
    textAlign: 'center',
  },
});
```

---

## PASSO 12: Atualizar app/index.tsx com lógica de autenticação

SUBSTITUIR todo o conteúdo de `app/index.tsx` por:
```typescript
import { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '@/lib/clerk';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/button';
import { COLORS } from '@/constants/colors';

export default function IndexScreen() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn) {
      router.replace('/(tabs)');
    }
  }, [isSignedIn, isLoaded]);

  if (!isLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎯 Mounjaro Tracker</Text>
      <Text style={styles.subtitle}>
        Seu assistente de acompanhamento GLP-1
      </Text>

      <View style={styles.features}>
        <Text style={styles.feature}>✅ Registre seu peso diariamente</Text>
        <Text style={styles.feature}>�� Acompanhe suas aplicações</Text>
        <Text style={styles.feature}>📊 Visualize seu progresso</Text>
        <Text style={styles.feature}>⚠️ Monitore efeitos colaterais</Text>
      </View>

      <View style={styles.buttons}>
        <Button
          label="Criar Conta"
          onPress={() => router.push('/(auth)/sign-up')}
        />
        <Button
          label="Já tenho conta"
          onPress={() => router.push('/(auth)/sign-in')}
          variant="outline"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 24,
    justifyContent: 'center',
  },
  loading: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 48,
  },
  features: {
    gap: 16,
    marginBottom: 48,
  },
  feature: {
    fontSize: 16,
    color: COLORS.text,
    paddingLeft: 8,
  },
  buttons: {
    gap: 12,
  },
});
```

---

## PASSO 13: Criar placeholder para tabs

Criar arquivo `app/(tabs)/_layout.tsx`:
```typescript
import { Tabs } from 'expo-router';
import { COLORS } from '@/constants/colors';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.background,
        },
        headerTintColor: COLORS.text,
        tabBarStyle: {
          backgroundColor: COLORS.backgroundLight,
          borderTopColor: COLORS.border,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarLabel: 'Início',
        }}
      />
    </Tabs>
  );
}
```

Criar arquivo `app/(tabs)/index.tsx`:
```typescript
import { View, Text, StyleSheet } from 'react-native';
import { useAuth, useClerkAuth } from '@/lib/clerk';
import { Button } from '@/components/ui/button';
import { useRouter } from 'expo-router';
import { COLORS } from '@/constants/colors';

export default function HomeTab() {
  const { signOut } = useClerkAuth();
  const { user } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bem-vindo!</Text>
      <Text style={styles.subtitle}>
        {user?.primaryEmailAddress?.emailAddress}
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardText}>✅ Clerk Auth funcionando</Text>
        <Text style={styles.cardText}>✅ Usuário autenticado</Text>
        <Text style={styles.cardText}>⏳ Próximo: Supabase</Text>
      </View>

      <Button label="Sair" onPress={handleSignOut} variant="outline" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 32,
  },
  card: {
    backgroundColor: COLORS.card,
    padding: 24,
    borderRadius: 16,
    gap: 12,
    marginBottom: 24,
  },
  cardText: {
    fontSize: 16,
    color: COLORS.text,
  },
});
```

---

## PASSO 14: Testar

Execute no terminal:
```bash
npx expo start
```

Pressione `i` para iOS ou `a` para Android.

### Fluxo de teste:

1. ✅ App abre na tela inicial (index)
2. ✅ Clicar em "Criar Conta"
3. ✅ Preencher email e senha
4. ✅ Criar conta com sucesso
5. ✅ Redirecionar para tabs
6. ✅ Ver email do usuário
7. ✅ Clicar em "Sair"
8. ✅ Voltar para tela inicial
9. ✅ Clicar em "Já tenho conta"
10. ✅ Fazer login com as mesmas credenciais

---

## VALIDAÇÃO

Antes de marcar como completo:

- [ ] .env.local criado com chaves válidas do Clerk
- [ ] App compila sem erros TypeScript
- [ ] Consegue criar nova conta
- [ ] Consegue fazer login
- [ ] Usuário autenticado vê tabs
- [ ] Botão "Sair" funciona
- [ ] Após logout, volta para tela inicial
- [ ] Login persiste (fechar e abrir app mantém usuário logado)

---

## RESULTADO ESPERADO

✅ Clerk Auth completamente configurado
✅ Telas de Sign In e Sign Up funcionando
✅ Proteção de rotas ativa
✅ Persistência de sessão configurada
✅ Componentes UI reutilizáveis criados
✅ Pronto para TASK-03 (Supabase)

---

## NOTA SOBRE PAYWALL

O Clerk Payments será configurado na TASK-04 após termos o Supabase funcionando. Primeiro precisamos ter o database pronto para armazenar informações de assinatura.
