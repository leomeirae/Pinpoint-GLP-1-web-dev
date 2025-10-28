# TASK-GOOGLE-OAUTH: Implementar Login com Google

## 🎯 OBJETIVO
Adicionar autenticação com Google OAuth usando Clerk seguindo as melhores práticas oficiais.

**Benefícios:**
- Login em 1 clique
- Sem necessidade de senha
- UX moderna e confiável
- Menos fricção no onboarding

---

## 📋 PRÉ-REQUISITOS
- Conta no Clerk Dashboard
- Terminal aberto em `/Users/user/Desktop/mounjaro-tracker`

---

# ⚙️ FASE 1: CONFIGURAR CLERK DASHBOARD

## PASSO 1.1: Habilitar Google OAuth

1. Acesse [Clerk Dashboard](https://dashboard.clerk.com)
2. Selecione seu projeto "Mounjaro Tracker"
3. No menu lateral, clique em **SSO Connections**
4. Clique em **Add connection**
5. Selecione **For all users**
6. No dropdown, selecione **Google**
7. Clique em **Add connection**

> **IMPORTANTE**: Para desenvolvimento, o Clerk usa credenciais compartilhadas. Para produção, você precisará criar suas próprias credenciais no Google Cloud Console.

## PASSO 1.2: Configurar Redirect URLs para Expo

1. No Clerk Dashboard, vá em **Native Applications**
2. Role até **Allowlist for mobile SSO redirect**
3. Adicione: `mounjarotracker://sso-callback`
4. Clique em **Save**

---

# 📦 FASE 2: INSTALAR DEPENDÊNCIAS

## PASSO 2.1: Instalar pacotes necessários

\`\`\`bash
# Instalar expo-web-browser para OAuth flow
npx expo install expo-web-browser

# Instalar expo-linking para deep linking
npx expo install expo-linking
\`\`\`

---

# 🔧 FASE 3: CONFIGURAR APP.JSON

## PASSO 3.1: Adicionar scheme no app.json

\`\`\`bash
# Usar o Cursor AI para adicionar no app.json
\`\`\`

Cole no Cursor AI:

\`\`\`
INSTRUÇÕES: No arquivo app.json, adicione o campo "scheme" dentro de "expo":

{
  "expo": {
    "name": "Mounjaro Tracker",
    "slug": "mounjaro-tracker",
    "scheme": "mounjarotracker",
    ... resto do conteúdo existente
  }
}

IMPORTANTE: Não remova nenhum campo existente, apenas adicione "scheme".
\`\`\`

---

# 🪝 FASE 4: CRIAR HOOK DE WARM UP BROWSER

## PASSO 4.1: Criar hook useWarmUpBrowser

\`\`\`bash
cat > hooks/useWarmUpBrowser.ts << 'WARMUP_EOF'
import { useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';

/**
 * Hook para otimizar performance do OAuth em Android
 * Pré-carrega o browser antes do fluxo de autenticação
 */
export function useWarmUpBrowser() {
  useEffect(() => {
    // Pré-aquece o browser (melhora UX em Android)
    void WebBrowser.warmUpAsync();
    
    return () => {
      // Limpa recursos quando componente desmonta
      void WebBrowser.coolDownAsync();
    };
  }, []);
}
WARMUP_EOF
\`\`\`

---

# 🎨 FASE 5: CRIAR BOTÃO DE GOOGLE OAUTH

## PASSO 5.1: Componente GoogleOAuthButton

\`\`\`bash
cat > components/auth/GoogleOAuthButton.tsx << 'GOOGLE_BUTTON_EOF'
import React, { useCallback } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { useOAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useWarmUpBrowser } from '@/hooks/useWarmUpBrowser';
import { COLORS } from '@/constants/colors';

// Necessário para fechar o browser após OAuth
WebBrowser.maybeCompleteAuthSession();

interface GoogleOAuthButtonProps {
  mode?: 'signin' | 'signup';
}

export function GoogleOAuthButton({ mode = 'signin' }: GoogleOAuthButtonProps) {
  useWarmUpBrowser();
  
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  const onPress = useCallback(async () => {
    try {
      setLoading(true);

      const { createdSessionId, signIn, signUp, setActive } = await startOAuthFlow({
        redirectUrl: Linking.createURL('/(tabs)', {
          scheme: 'mounjarotracker',
        }),
      });

      if (createdSessionId) {
        await setActive!({ session: createdSessionId });
        router.replace('/(tabs)');
      } else {
        // Usuário precisa completar passos adicionais
        // (ex: preencher informações adicionais)
        console.log('OAuth flow requires additional steps');
        
        if (signUp && signUp.status === 'missing_requirements') {
          // Redirecionar para completar cadastro se necessário
          router.push('/(onboarding)');
        }
      }
    } catch (err: any) {
      console.error('OAuth error:', err);
      
      // Tratar erros específicos
      if (err.errors && err.errors[0]) {
        const errorCode = err.errors[0].code;
        
        if (errorCode === 'not_allowed_access') {
          alert('Esta conta Google não tem permissão de acesso.');
        } else if (errorCode === 'oauth_access_denied') {
          // Usuário cancelou o fluxo
          console.log('User cancelled OAuth flow');
        } else {
          alert('Erro ao fazer login com Google. Tente novamente.');
        }
      }
    } finally {
      setLoading(false);
    }
  }, [startOAuthFlow, router]);

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
GOOGLE_BUTTON_EOF
\`\`\`

---

# 📱 FASE 6: ADICIONAR BOTÃO NAS TELAS DE AUTH

## PASSO 6.1: Atualizar Sign In

Cole no Cursor AI:

\`\`\`
INSTRUÇÕES: No arquivo app/(auth)/sign-in.tsx, adicione o botão do Google:

1. Importar no topo:
import { GoogleOAuthButton } from '@/components/auth/GoogleOAuthButton';

2. Adicionar ANTES do formulário de email/senha:

<GoogleOAuthButton mode="signin" />

{/* Divider */}
<View style={styles.divider}>
  <View style={styles.dividerLine} />
  <Text style={styles.dividerText}>OU</Text>
  <View style={styles.dividerLine} />
</View>

3. Adicionar estes estilos:

divider: {
  flexDirection: 'row',
  alignItems: 'center',
  marginVertical: 24,
},
dividerLine: {
  flex: 1,
  height: 1,
  backgroundColor: COLORS.border,
},
dividerText: {
  marginHorizontal: 16,
  fontSize: 14,
  color: COLORS.textMuted,
  fontWeight: '600',
},
\`\`\`

## PASSO 6.2: Atualizar Sign Up

Cole no Cursor AI:

\`\`\`
INSTRUÇÕES: No arquivo app/(auth)/sign-up.tsx, adicione o botão do Google:

1. Importar:
import { GoogleOAuthButton } from '@/components/auth/GoogleOAuthButton';

2. Adicionar ANTES do formulário:

<GoogleOAuthButton mode="signup" />

{/* Divider */}
<View style={styles.divider}>
  <View style={styles.dividerLine} />
  <Text style={styles.dividerText}>OU</Text>
  <View style={styles.dividerLine} />
</View>

3. Usar os mesmos estilos do divider do sign-in
\`\`\`

---

# ✅ FASE 7: TESTAR

## PASSO 7.1: Executar o app

\`\`\`bash
npx expo start
\`\`\`

### Checklist de Testes:

**TESTE 1: Sign In com Google**
1. ✅ Abrir tela de login
2. ✅ Ver botão "Continuar com Google"
3. ✅ Clicar no botão
4. ✅ Browser abre com tela do Google
5. ✅ Selecionar conta Google
6. ✅ Autorizar acesso
7. ✅ Retornar ao app automaticamente
8. ✅ Usuário logado com sucesso

**TESTE 2: Sign Up com Google**
1. ✅ Abrir tela de cadastro
2. ✅ Ver botão "Cadastrar com Google"
3. ✅ Fluxo igual ao sign-in
4. ✅ Usuário criado e logado

**TESTE 3: Tratamento de Erros**
1. ✅ Cancelar no meio do fluxo
2. ✅ App não trava
3. ✅ Pode tentar novamente

**TESTE 4: Deep Linking**
1. ✅ Após OAuth, retorna para o app
2. ✅ Não fica preso no browser

---

## 🎨 FASE 8: MELHORIAS VISUAIS (OPCIONAL)

### Adicionar ícone do Google real

Se quiser usar o ícone oficial do Google:

\`\`\`bash
# Baixar SVG do Google Icon
# Colocar em assets/google-icon.svg
# Usar react-native-svg

# Ou usar emoji conforme implementado acima (mais simples)
\`\`\`

---

## 🚀 RESULTADO FINAL

✅ Login com Google funcional
✅ Sign up com Google funcional
✅ Deep linking configurado
✅ Tratamento de erros
✅ UX otimizada (warm up browser)
✅ Botão estilizado
✅ Compatível com iOS e Android

---

## 📝 NOTAS IMPORTANTES

### Para Produção:

1. **Criar credenciais próprias no Google Cloud**:
   - Acessar [Google Cloud Console](https://console.cloud.google.com)
   - Criar OAuth Client ID
   - Adicionar redirect URIs do Clerk
   - Atualizar no Clerk Dashboard

2. **App Store / Play Store**:
   - ⚠️ Se adicionar "Sign in with Google", Apple exige "Sign in with Apple"
   - Configure "Sign in with Apple" também

3. **Testar em dispositivos reais**:
   - OAuth pode ter comportamento diferente em simulador vs device

---

## 🔐 SEGURANÇA

- ✅ Tokens armazenados com `expo-secure-store`
- ✅ Redirect URLs na allowlist do Clerk
- ✅ OAuth 2.0 com PKCE
- ✅ Sessões gerenciadas pelo Clerk

---

**Tempo de implementação: ~10-15 minutos** ⚡

**PRONTO PARA PRODUÇÃO!** 🎯
