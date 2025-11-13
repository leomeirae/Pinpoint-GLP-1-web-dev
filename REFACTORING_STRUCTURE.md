# Plano de Reorganização Estrutural (P2)

## Objetivo
Transformar a estrutura atual (organizada por tipo de componente) em uma estrutura baseada em features/domínios, seguindo o padrão recomendado para aplicações React Native escaláveis.

## Estrutura Proposta

```
src/
├── features/              # Módulos organizados por domínio de negócio
│   ├── medication/       # Tudo relacionado a medicação
│   │   ├── components/   # Componentes específicos de medicação
│   │   ├── hooks/        # Hooks para medicação
│   │   ├── screens/      # Telas de aplicação, histórico
│   │   └── types.ts      # Tipos relacionados a medicação
│   ├── weight/           # Tudo relacionado a peso
│   │   ├── components/   # Gráficos, cards de peso
│   │   ├── hooks/        # useWeights, etc
│   │   ├── screens/      # Telas de registro de peso
│   │   └── types.ts
│   ├── finance/          # Módulo financeiro (C4)
│   │   ├── components/   # FinancialSummaryCard, PurchaseListItem
│   │   ├── hooks/        # usePurchases
│   │   ├── screens/      # Telas de finanças
│   │   ├── lib/          # finance.ts (cálculos)
│   │   └── types.ts
│   ├── treatment/        # Pausas e controle de tratamento
│   │   ├── components/
│   │   ├── hooks/        # useTreatmentPauses
│   │   ├── screens/
│   │   └── types.ts
│   ├── habits/           # Álcool e outros hábitos
│   │   ├── components/
│   │   ├── hooks/        # useAlcoholLogs
│   │   ├── lib/          # alcoholOverlays.ts
│   │   └── types.ts
│   ├── onboarding/       # Fluxo de onboarding
│   │   ├── components/   # DayPicker, DosageSelector, etc
│   │   ├── screens/      # Welcome, Compliance, etc
│   │   ├── hooks/        # OnboardingContext
│   │   └── types.ts
│   └── dashboard/        # Dashboard e home
│       ├── components/   # Cards, widgets, gráficos
│       └── screens/      # dashboard.tsx
│
├── core/                 # Funcionalidades centrais da aplicação
│   ├── auth/             # Autenticação e autorização
│   │   ├── clerk.ts
│   │   ├── auth.ts
│   │   └── hooks/        # useUser, useUserSync
│   ├── analytics/        # Sistema de analytics
│   │   ├── analytics.ts
│   │   ├── hooks/        # useConsent
│   │   └── types.ts
│   ├── navigation/       # Configuração de rotas
│   │   └── types.ts
│   ├── notifications/    # Sistema de notificações
│   │   └── notifications.ts
│   ├── storage/          # Persistência local
│   │   └── supabase.ts
│   └── feature-flags/    # Sistema de feature flags
│       └── feature-flags.ts
│
├── ui/                   # Componentes de UI reutilizáveis
│   ├── buttons/
│   │   └── OnboardingButton.tsx
│   ├── progress/
│   │   ├── ProgressIndicator.tsx
│   │   └── ShotsyCircularProgressV2.tsx
│   ├── animations/
│   │   ├── FadeInView.tsx
│   │   └── ScalePress.tsx
│   ├── coachmarks/       # Sistema de coachmarks
│   └── icons/            # Ícones customizados
│
├── lib/                  # Utilitários gerais
│   ├── logger.ts
│   ├── pharmacokinetics.ts
│   ├── dosageColors.ts
│   └── medicationConfig.ts
│
└── constants/            # Constantes e configurações
    ├── colors.ts
    ├── shotsyDesignTokens.ts
    └── medications.ts
```

## Mapeamento de Migração

### De `components/` para `features/`

```
components/application/     → features/medication/components/
components/dashboard/       → features/dashboard/components/
components/finance/         → features/finance/components/
components/onboarding/      → features/onboarding/components/
components/results/         → features/medication/components/ (gráficos)
components/coachmarks/      → ui/coachmarks/
components/animations/      → ui/animations/
components/ui/              → ui/
```

### De `hooks/` para `features/` ou `core/`

```
hooks/useApplications.ts    → features/medication/hooks/
hooks/useWeights.ts         → features/weight/hooks/
hooks/usePurchases.ts       → features/finance/hooks/
hooks/useAlcoholLogs.ts     → features/habits/hooks/
hooks/useTreatmentPauses.ts → features/treatment/hooks/
hooks/useOnboarding.ts      → features/onboarding/hooks/
hooks/OnboardingContext.tsx → features/onboarding/hooks/
hooks/useUser.ts            → core/auth/hooks/
hooks/useUserSync.ts        → core/auth/hooks/
hooks/useConsent.ts         → core/analytics/hooks/
hooks/useProfile.ts         → core/auth/hooks/
hooks/useShotsyColors.ts    → ui/hooks/ (ou constants/)
hooks/useTheme.ts           → ui/hooks/
```

### De `lib/` para `core/` ou `features/`

```
lib/analytics.ts            → core/analytics/
lib/auth.ts                 → core/auth/
lib/clerk.ts                → core/auth/
lib/feature-flags.ts        → core/feature-flags/
lib/notifications.ts        → core/notifications/
lib/supabase.ts             → core/storage/
lib/finance.ts              → features/finance/lib/
lib/alcoholOverlays.ts      → features/habits/lib/
lib/pharmacokinetics.ts     → lib/ (utilitário geral)
lib/medicationConfig.ts     → lib/ (ou constants/)
lib/dosageColors.ts         → lib/ (ou constants/)
lib/logger.ts               → lib/ (utilitário geral)
lib/types.ts                → Dividir por feature
```

### Telas `app/(tabs)/`

```
app/(tabs)/dashboard.tsx    → features/dashboard/screens/
app/(tabs)/injections.tsx   → features/medication/screens/
app/(tabs)/results.tsx      → features/medication/screens/
app/(tabs)/finance/         → features/finance/screens/
app/(tabs)/treatment/       → features/treatment/screens/
app/(tabs)/habits/          → features/habits/screens/
```

## Estratégia de Execução

1. **Criar estrutura de diretórios primeiro**
2. **Migrar por feature** (um de cada vez para evitar quebrar tudo)
3. **Atualizar imports progressivamente**
4. **Testar após cada feature migrada**
5. **Remover diretórios antigos quando vazios**

## Benefícios

- ✅ Código organizado por domínio de negócio
- ✅ Reduz acoplamento entre módulos
- ✅ Facilita encontrar código relacionado
- ✅ Escala melhor com crescimento do app
- ✅ Torna mais fácil dividir em micro-frontends no futuro
- ✅ Alinha com best practices de React Native

## Riscos

- ⚠️ Grande número de arquivos para mover (~150+)
- ⚠️ Imports podem quebrar se não forem atualizados corretamente
- ⚠️ Pode causar conflitos em branches ativas

## Alternativa: Migração Incremental

Em vez de mover tudo de uma vez, podemos:
1. Criar nova estrutura em paralelo
2. Mover features uma por vez
3. Deixar código antigo até confirmar que novo funciona
4. Permite testar e reverter mais facilmente

**Recomendação:** Migração incremental é mais segura.
