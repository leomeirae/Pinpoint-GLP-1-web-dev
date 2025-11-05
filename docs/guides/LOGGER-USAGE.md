# Sistema de Logger - Guia de Uso

**Data de criação:** 05 de novembro de 2025
**Versão:** 1.0

---

## 📚 Visão Geral

O Mounjaro Tracker utiliza um sistema centralizado de logging que fornece logs estruturados, níveis de severidade, e suporte para monitoramento em produção.

### Benefícios

- ✅ **Logs estruturados** com metadata
- ✅ **Guards automáticos** para desenvolvimento/produção
- ✅ **Prefixos** para rastrear origem dos logs
- ✅ **4 níveis de severidade** (debug, info, warn, error)
- ✅ **Preparado para Sentry** (integração futura)

---

## 🚀 Uso Básico

### Importar o Logger

```typescript
import { logger, createLogger } from '@/lib/logger';
```

### Logger Global

Use o logger global para logs rápidos:

```typescript
logger.debug('Debugging info', { value: 123 });
logger.info('User logged in', { userId: 'abc123' });
logger.warn('Unusual activity detected');
logger.error('Failed to fetch data', error);
```

### Logger com Prefixo (Recomendado)

Crie um logger com prefixo para identificar a origem:

```typescript
// No topo do arquivo
import { createLogger } from '@/lib/logger';

const logger = createLogger('MyComponent');

// Dentro do componente
logger.info('Component mounted');
// Output: ℹ️ [MyComponent] Component mounted
```

---

## 📊 Níveis de Log

### 1. `debug()` - Debug Info

**Quando usar:** Informação de desenvolvimento, valores intermediários, fluxo de execução

**Comportamento:**
- ✅ Visível em desenvolvimento (`__DEV__ === true`)
- ❌ **NÃO** aparece em produção

**Exemplo:**
```typescript
logger.debug('Entering validation function', {
  input: data,
  step: 'validation'
});
```

---

### 2. `info()` - Informação

**Quando usar:** Eventos importantes, ações do usuário, sucesso de operações

**Comportamento:**
- ✅ Visível em desenvolvimento
- ❌ **NÃO** aparece em produção (por padrão)
- ✅ Pode ser habilitado em produção via config

**Exemplo:**
```typescript
logger.info('User completed onboarding', {
  userId: user.id,
  duration: 120 // segundos
});
```

---

### 3. `warn()` - Warning

**Quando usar:** Situações incomuns mas não críticas, dados inesperados, fallbacks

**Comportamento:**
- ✅ Sempre visível (dev e prod)
- ⚠️ Indica que algo merece atenção

**Exemplo:**
```typescript
logger.warn('Using fallback value due to missing data', {
  field: 'userName',
  fallback: 'Anonymous'
});
```

---

### 4. `error()` - Erro

**Quando usar:** Erros reais, exceções, falhas de operações

**Comportamento:**
- ✅ Sempre visível (dev e prod)
- 🚨 Será enviado para Sentry em produção (quando configurado)

**Exemplo:**
```typescript
try {
  await fetchData();
} catch (error) {
  logger.error('Failed to fetch data', error, {
    endpoint: '/api/users',
    userId: user.id
  });
}
```

---

## 🎯 Padrões e Boas Práticas

### 1. Use Loggers com Prefixo

**❌ Evite:**
```typescript
logger.info('User saved');
```

**✅ Prefira:**
```typescript
const logger = createLogger('UserService');
logger.info('User saved', { userId: '123' });
// Output: ℹ️ [UserService] User saved { userId: '123' }
```

---

### 2. Adicione Metadata Estruturada

**❌ Evite:**
```typescript
logger.info(`User ${userId} logged in at ${timestamp}`);
```

**✅ Prefira:**
```typescript
logger.info('User logged in', {
  userId,
  timestamp,
  source: 'oauth'
});
```

**Benefício:** Metadata estruturada facilita busca e análise.

---

### 3. Escolha o Nível Correto

```typescript
// Debug - informação de desenvolvimento
logger.debug('State before update', { oldState, newState });

// Info - eventos importantes
logger.info('Payment processed successfully', { amount, orderId });

// Warn - situações incomuns
logger.warn('Retry attempt due to timeout', { attemptNumber: 3 });

// Error - falhas reais
logger.error('Payment gateway error', error, { orderId });
```

---

### 4. Nunca Logue Dados Sensíveis

**❌ NUNCA:**
```typescript
logger.info('User authenticated', {
  password: user.password,  // ❌ NUNCA!
  creditCard: user.card,    // ❌ NUNCA!
  ssn: user.ssn             // ❌ NUNCA!
});
```

**✅ SEMPRE:**
```typescript
logger.info('User authenticated', {
  userId: user.id,
  email: user.email.split('@')[1], // apenas domínio
  method: 'oauth'
});
```

---

## 🔧 Exemplos por Caso de Uso

### Em Custom Hooks

```typescript
// hooks/useUser.ts
import { createLogger } from '@/lib/logger';

const logger = createLogger('useUser');

export function useUser() {
  const fetchUser = async () => {
    logger.debug('Fetching user from cache');

    const cached = getFromCache();
    if (cached) {
      logger.info('User loaded from cache', { userId: cached.id });
      return cached;
    }

    try {
      const user = await api.fetchUser();
      logger.info('User fetched successfully', { userId: user.id });
      return user;
    } catch (error) {
      logger.error('Failed to fetch user', error);
      throw error;
    }
  };

  return { fetchUser };
}
```

---

### Em Componentes React

```typescript
// components/Dashboard.tsx
import { createLogger } from '@/lib/logger';

const logger = createLogger('Dashboard');

export function Dashboard() {
  useEffect(() => {
    logger.debug('Dashboard mounted');

    return () => {
      logger.debug('Dashboard unmounted');
    };
  }, []);

  const handleAction = () => {
    logger.info('User clicked action button', {
      timestamp: Date.now()
    });
  };

  return <Button onPress={handleAction}>Action</Button>;
}
```

---

### Em Services/API

```typescript
// services/api.ts
import { createLogger } from '@/lib/logger';

const logger = createLogger('API');

export async function fetchData(endpoint: string) {
  logger.debug('API request started', { endpoint });

  try {
    const response = await fetch(endpoint);

    if (!response.ok) {
      logger.warn('API returned non-200 status', {
        endpoint,
        status: response.status
      });
    }

    const data = await response.json();
    logger.info('API request successful', {
      endpoint,
      dataSize: JSON.stringify(data).length
    });

    return data;
  } catch (error) {
    logger.error('API request failed', error, { endpoint });
    throw error;
  }
}
```

---

## 🔬 Child Loggers (Loggers Aninhados)

Para módulos complexos, use child loggers:

```typescript
const parentLogger = createLogger('Payment');

// Criar child logger
const stripeLogger = parentLogger.createChild('Stripe');
const paypalLogger = parentLogger.createChild('PayPal');

stripeLogger.info('Processing payment');
// Output: ℹ️ [Payment:Stripe] Processing payment

paypalLogger.info('Refund initiated');
// Output: ℹ️ [Payment:PayPal] Refund initiated
```

---

## ⚙️ Configuração Avançada

### Habilitar Logs em Produção

```typescript
// lib/logger.ts
const logger = new Logger({
  enableInProd: true,  // Habilita info() em produção
  sendToSentry: true,  // Envia errors para Sentry
});
```

### Integração com Sentry (Futuro)

```typescript
// lib/logger.ts
import * as Sentry from '@sentry/react-native';

export class Logger {
  error(message: string, error?: Error, metadata?: LogMetadata): void {
    console.error(`❌ ${message}`, error, metadata || '');

    // Enviar para Sentry em produção
    if (!__DEV__ && this.config.sendToSentry) {
      Sentry.captureException(error, {
        tags: { message },
        extra: metadata,
      });
    }
  }
}
```

---

## 📋 Checklist de Migração

Ao migrar código existente para o logger system:

- [ ] Importar `createLogger` no topo do arquivo
- [ ] Criar logger com prefixo descritivo
- [ ] Substituir `console.log` por `logger.debug()` ou `logger.info()`
- [ ] Substituir `console.warn` por `logger.warn()`
- [ ] Substituir `console.error` por `logger.error()`
- [ ] Adicionar metadata estruturada onde apropriado
- [ ] Remover strings de template, usar metadata
- [ ] Verificar que não há dados sensíveis sendo logados
- [ ] Testar em desenvolvimento e produção

---

## 🚫 Anti-Patterns (O que NÃO fazer)

### 1. Não use console diretamente

**❌ Evite:**
```typescript
console.log('User saved');
console.error('Error:', error);
```

**✅ Use:**
```typescript
logger.info('User saved');
logger.error('Error saving user', error);
```

---

### 2. Não use strings de template

**❌ Evite:**
```typescript
logger.info(`User ${user.id} performed ${action}`);
```

**✅ Use:**
```typescript
logger.info('User performed action', {
  userId: user.id,
  action
});
```

---

### 3. Não logue objetos enormes

**❌ Evite:**
```typescript
logger.debug('Full state', {
  state: entireReduxStore  // Pode ter centenas de KB!
});
```

**✅ Use:**
```typescript
logger.debug('State subset', {
  userCount: state.users.length,
  currentPage: state.ui.currentPage
});
```

---

## 📚 Recursos Adicionais

- **Testes:** Ver `__tests__/lib/logger.test.ts`
- **Código fonte:** Ver `lib/logger.ts`
- **Analytics:** Ver `lib/analytics.ts` (usa logger internamente)

---

**Última atualização:** 05 de novembro de 2025
**Mantenedor:** Mounjaro Tracker Team
