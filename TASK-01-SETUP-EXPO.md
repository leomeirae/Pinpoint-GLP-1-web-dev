
## OBJETIVO
Inicializar projeto Expo com TypeScript strict, configurar estrutura de pastas e criar tela inicial funcionando.

## PRÉ-REQUISITOS
- Node.js instalado
- Terminal aberto na pasta `/Users/user/Desktop/mounjaro-tracker`

---

## PASSO 1: Mover arquivos temporariamente

Execute no terminal:

```bash
mkdir temp
mv .cursorrules temp/
mv TASK-01-SETUP-EXPO.md temp/
```

---

## PASSO 2: Inicializar Expo

Execute no terminal:

```bash
npx create-expo-app@latest . --template blank-typescript
```

Se perguntar sobre sobrescrever arquivos, responda: **YES**

---

## PASSO 3: Restaurar arquivos

```bash
mv temp/.cursorrules .
mv temp/TASK-01-SETUP-EXPO.md .
rm -rf temp
```

---

## PASSO 4: Instalar dependências do Expo Router

```bash
npx expo install expo-router react-native-safe-area-context react-native-screens expo-linking expo-constants expo-status-bar
```

---

## PASSO 5: Configurar package.json

Abrir `package.json` e MODIFICAR a linha `"main"`:

ANTES:
```json
"main": "expo/AppEntry.js",
```

DEPOIS:
```json
"main": "expo-router/entry",
```

---

## PASSO 6: Configurar app.json

SUBSTITUIR todo o conteúdo de `app.json` por:

```json
{
  "expo": {
    "name": "Mounjaro Tracker",
    "slug": "mounjaro-tracker",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "scheme": "mounjarotracker",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#1a1a2e"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.mounjarotracker.app"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#1a1a2e"
      },
      "package": "com.mounjarotracker.app"
    },
    "plugins": [
      "expo-router"
    ]
  }
}
```

---

## PASSO 7: Configurar TypeScript Strict

SUBSTITUIR todo o conteúdo de `tsconfig.json` por:

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": [
    "**/*.ts",
    "**/*.tsx",
    ".expo/types/**/*.ts",
    "expo-env.d.ts"
  ]
}
```

---

## PASSO 8: Criar estrutura de pastas

Execute no terminal:

```bash
mkdir -p app
mkdir -p components/ui
mkdir -p lib
mkdir -p hooks
mkdir -p constants
```

---

## PASSO 9: Criar constants/colors.ts

Criar arquivo `constants/colors.ts`:

```typescript
export const COLORS = {
  // Primary
  primary: '#6366f1',
  primaryDark: '#4f46e5',
  primaryLight: '#818cf8',
  
  // Background
  background: '#0f0f1e',
  backgroundLight: '#1a1a2e',
  card: '#16213e',
  
  // Text
  text: '#ffffff',
  textSecondary: '#94a3b8',
  textMuted: '#64748b',
  
  // Status
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  
  // Border
  border: '#1e293b',
  borderLight: '#334155',
} as const;
```

---

## PASSO 10: Criar lib/types.ts

Criar arquivo `lib/types.ts`:

```typescript
// User types
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

// Medication types
export type MedicationType = 
  | 'mounjaro'
  | 'ozempic'
  | 'saxenda'
  | 'wegovy'
  | 'zepbound';

export interface Medication {
  id: string;
  userId: string;
  type: MedicationType;
  dosage: number;
  frequency: 'weekly' | 'daily';
  startDate: string;
}

// Weight types
export interface WeightLog {
  id: string;
  userId: string;
  weight: number;
  date: string;
  notes?: string;
}

// Side effect types
export interface SideEffect {
  id: string;
  userId: string;
  type: string;
  severity: 1 | 2 | 3 | 4 | 5;
  date: string;
  notes?: string;
}
```

---

## PASSO 11: Criar app/_layout.tsx (Layout raiz)

Criar arquivo `app/_layout.tsx`:

```typescript
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from '@/constants/colors';

export default function RootLayout() {
  return (
    <>
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
            title: 'Mounjaro Tracker',
            headerShown: true,
          }} 
        />
      </Stack>
    </>
  );
}
```

---

## PASSO 12: Criar app/index.tsx (Tela inicial)

Criar arquivo `app/index.tsx`:

```typescript
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/colors';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎯 Mounjaro Tracker</Text>
      <Text style={styles.subtitle}>
        Seu assistente de acompanhamento GLP-1
      </Text>
      <View style={styles.card}>
        <Text style={styles.cardText}>✅ Expo configurado</Text>
        <Text style={styles.cardText}>✅ TypeScript strict ativo</Text>
        <Text style={styles.cardText}>✅ Estrutura de pastas criada</Text>
        <Text style={styles.cardText}>⏳ Próximo: Clerk Auth</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
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
    textAlign: 'center',
  },
  card: {
    backgroundColor: COLORS.card,
    padding: 24,
    borderRadius: 16,
    width: '100%',
    gap: 12,
  },
  cardText: {
    fontSize: 16,
    color: COLORS.text,
  },
});
```

---

## PASSO 13: Deletar App.tsx antigo

```bash
rm -f App.tsx
```

---

## PASSO 14: Testar

Execute no terminal:

```bash
npx expo start
```

Pressione `i` para iOS ou `a` para Android.

Você deve ver uma tela escura com:
- Título "🎯 Mounjaro Tracker"
- Subtítulo
- Card com checklist

---

## VALIDAÇÃO

Antes de marcar como completo, verifique:

- [ ] App compila sem erros TypeScript
- [ ] App abre no simulador/Expo Go
- [ ] Tela inicial aparece corretamente
- [ ] Cores dark theme aplicadas
- [ ] Sem warnings críticos no console

---

## RESULTADO ESPERADO

✅ Projeto Expo inicializado
✅ TypeScript strict configurado
✅ Estrutura de pastas criada
✅ Tela inicial funcionando
✅ Pronto para TASK-02 (Clerk)

```

---



