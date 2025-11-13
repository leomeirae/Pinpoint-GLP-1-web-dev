# C4 - Financeiro (MVP)

## Contexto

Implementar sistema de controle financeiro para rastrear compras de medicamentos e calcular custos (total, R$/semana, R$/kg quando opt-in e houver dados).

**Estimativa:** 25 horas  
**Branch:** `feature/finance-mvp`  
**Base:** `refactor/onboarding-5-core` (após C1)

**Dependências:**
- C1 (Onboarding) - completo

---

## Feature Flag

**Flag:** `FF_FINANCE_MVP` (default: `false`)

**Comportamento:**
- Quando `FF_FINANCE_MVP === false`:
  - Aba "Custos" oculta da navegação
  - Rotas `/finance/*` retornam 404 ou redirecionam para dashboard
  - Card de Quick Actions não mostra ação "+Compra"
- Quando `FF_FINANCE_MVP === true`:
  - Aba "Custos" visível (ícone: `CurrencyCircleDollar`)
  - Rotas `/finance/*` acessíveis
  - Card de Quick Actions inclui "+Compra"

**Rollout:**
1. Testar internamente com flag ativada
2. Habilitar para 10% dos usuários (A/B test)
3. Monitorar por 1 semana
4. Expandir para 50%, depois 100%

---

## Fase 1: Schema de Dados (2h)

### 1.1 Criar Tabela purchases (1h)
- [ ] Criar migration `supabase/migrations/XXX_create_purchases.sql`:
  ```sql
  create table purchases (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users(id) not null,
    
    -- Medicação
    medication text not null,
    brand text,
    dosage numeric not null,
    unit text not null default 'mg',
    
    -- Embalagem
    package_form text not null default 'pen',
    package_qty int not null check (package_qty >= 1),
    quantity int not null default 1,
    
    -- Preço
    currency text not null default 'BRL',
    total_price_cents int not null,
    unit_price_cents int generated always as (total_price_cents/nullif(quantity,0)) stored,
    price_source text,
    purchase_notes text,
    
    -- Metadata
    purchase_date timestamptz not null,
    location text,
    receipt_url text,
    notes text,
    
    created_at timestamptz default now(),
    updated_at timestamptz default now()
  );
  
  alter table purchases enable row level security;
  
  create policy "own-select" on purchases for select using (auth.uid()=user_id);
  create policy "own-insert" on purchases for insert with check (auth.uid()=user_id);
  create policy "own-update" on purchases for update using (auth.uid()=user_id);
  create policy "own-delete" on purchases for delete using (auth.uid()=user_id);
  
  create index on purchases(user_id, purchase_date desc);
  create index on purchases(user_id, medication);
  ```

### 1.2 Adicionar Campo de Opt-in (1h)
- [ ] Adicionar campo `finance_opt_in` em `users`:
  ```sql
  alter table users add column if not exists finance_opt_in boolean default false;
  ```
- [ ] Executar migrations em development
- [ ] Testar RLS (inserir, buscar, atualizar, deletar)

---

## Fase 2: Storage de Recibos (2h)

### 2.1 Configurar Supabase Storage (1h)
- [ ] Criar bucket `receipts` (privado, RLS habilitado)
- [ ] Configurar RLS policies:
  ```sql
  create policy "users_own_receipts_select" on storage.objects for select
    using (bucket_id = 'receipts' and (storage.foldername(name))[1] = auth.uid()::text);
  create policy "users_own_receipts_insert" on storage.objects for insert
    with check (bucket_id = 'receipts' and (storage.foldername(name))[1] = auth.uid()::text);
  create policy "users_own_receipts_delete" on storage.objects for delete
    using (bucket_id = 'receipts' and (storage.foldername(name))[1] = auth.uid()::text);
  ```
- [ ] Configurar limites: max 5MB por arquivo
- [ ] Whitelist MIME types: `image/jpeg`, `image/png`, `application/pdf`

### 2.2 Implementar Upload (1h)
- [ ] Criar `lib/storage.ts`:
  - Função `uploadReceipt(file, userId, purchaseId)`
  - Validar MIME type
  - Sanitizar filename
  - Path: `{user_id}/{purchase_id}/{filename}.{ext}`
  - Retornar URL pública

---

## Fase 3: Hook de Dados (3h)

### 3.1 Criar usePurchases Hook (2h)
- [ ] Criar `hooks/usePurchases.ts`:
  - `usePurchases()`: retornar lista de compras do usuário
  - `addPurchase(data)`: inserir nova compra
  - `updatePurchase(id, data)`: atualizar compra
  - `deletePurchase(id)`: deletar compra
  - Usar Supabase real-time subscriptions para updates
  - Gerenciar loading e error states

### 3.2 Criar Funções de Cálculo (1h)
- [ ] Criar `lib/finance.ts`:
  - `calculateTotalSpent(purchases): number` - soma total
  - `calculateWeeklySpent(purchases): number` - total / semanas desde primeira compra
  - `calculateCostPerKg(purchases, weightLoss): number | null` - se opt-in e 2+ pesagens
  - `predictNextPurchase(purchases, applications): Date | null` - baseado em média
  - `formatCurrency(cents: number): string` - formato BRL (R$ 1.234,56)

---

## Fase 4: Tela de Resumo (5h)

### 4.1 Criar Componente de Resumo (3h)
- [ ] Criar `components/finance/FinancialSummaryCard.tsx`:
  - Card com 4 métricas:
    1. Total gasto (sempre visível)
    2. R$/semana (sempre visível)
    3. Próxima compra prevista (se 2+ compras)
    4. R$/kg (se `finance_opt_in === true` AND 2+ pesagens)
  - Ícones Phosphor para cada métrica
  - Tooltip explicativo para R$/kg: "Indicador econômico, não clínico"
  - Responsivo para diferentes tamanhos de tela

### 4.2 Criar Lista de Compras (2h)
- [ ] Criar `components/finance/PurchaseListItem.tsx`:
  - Card compacto com:
    - Medicação + dosagem
    - Quantidade + preço formatado (BRL)
    - Data de compra (formato PT-BR)
    - Ações: editar (ícone lápis), deletar (ícone lixeira)
  - Swipe para deletar (opcional, UX polida)
  - Confirmação antes de deletar

### 4.3 Criar Tela Principal (2h)
- [ ] Criar `app/(tabs)/finance/index.tsx`:
  - Header: título "Custos"
  - `FinancialSummaryCard` no topo
  - Lista de compras (`PurchaseListItem`)
  - Estado vazio: ilustração + texto "Nenhuma compra registrada"
  - Botão flutuante: "+Adicionar Compra"
  - Pull-to-refresh para atualizar dados

---

## Fase 5: Tela de Adicionar/Editar Compra (4h)

### 5.1 Criar Formulário (3h)
- [ ] Criar `app/(tabs)/finance/add-purchase.tsx`:
  - Formulário com campos:
    - Medicamento (picker: buscar de `medication_configs`)
    - Marca (texto opcional)
    - Dosagem (picker condicionado por medicamento)
    - Quantidade de embalagens (number input)
    - Preço total (currency input, BRL)
    - Data de compra (date picker)
    - Local (texto opcional: farmácia, clínica, etc.)
    - Notas (textarea opcional)
  - Botões: "Salvar" / "Cancelar"
  - Validação: medication, dosage, quantity, price obrigatórios
  - Loading state ao salvar

### 5.2 Upload de Recibo (1h)
- [ ] Adicionar campo opcional: "Anexar recibo"
  - Botão: "Tirar foto" / "Escolher da galeria"
  - Preview da imagem selecionada
  - Validar tamanho (max 5MB)
  - Upload ao salvar compra (com loading indicator)
  - Exibir na lista de compras se houver

---

## Fase 6: Opt-in para R$/kg (2h)

### 6.1 Criar Modal de Opt-in (1h)
- [ ] Criar `components/finance/CostPerKgOptInModal.tsx`:
  - Título: "Calcular custo por kg perdido?"
  - Descrição detalhada:
    - "Indicador econômico, não clínico"
    - "Cada pessoa responde diferente ao tratamento"
    - "Requer pelo menos 2 pesagens"
  - Checkbox: "Entendo que este é apenas um indicador financeiro"
  - Botões: "Sim, mostrar" / "Não"
  - Persistir escolha no Supabase (`users.finance_opt_in`)

### 6.2 Integração (1h)
- [ ] Mostrar modal:
  - Na primeira vez que usuário acessar `/finance`
  - Apenas se houver 2+ pesagens registradas
  - Não mostrar novamente se já optou (sim ou não)
- [ ] Permitir alterar em Settings:
  - Link na tela de resumo: "Configurar métricas"
  - Deep-link: `/(tabs)/settings/consent-preferences`

---

## Fase 7: Navegação e Feature Flag (2h)

### 7.1 Adicionar Aba Finance (1h)
- [ ] Editar `app/(tabs)/_layout.tsx`:
  - Adicionar aba "Custos" (ícone: `CurrencyCircleDollar`)
  - Condicionada por `FF_FINANCE_MVP`:
    ```typescript
    {useFeatureFlag('FF_FINANCE_MVP') && (
      <Tabs.Screen
        name="finance"
        options={{ title: "Custos" }}
      />
    )}
    ```

### 7.2 Integrar com Quick Actions (1h)
- [ ] Editar `components/dashboard/QuickActionsCard.tsx`:
  - Adicionar ação "Adicionar Compra" condicionada por flag
  - Deep-link: `/(tabs)/finance/add-purchase`
  - Ícone: `CurrencyCircleDollar`

---

## Fase 8: Testes e Validação (2h)

### 8.1 Testes Funcionais (1h)
- [ ] Testar CRUD completo de compras
- [ ] Testar cálculos (total, R$/sem, R$/kg, próxima compra)
- [ ] Testar opt-in de R$/kg (mostrar modal, persistir escolha)
- [ ] Testar upload de recibo (foto, galeria, preview)
- [ ] Testar estados vazios
- [ ] Testar validações de formulário
- [ ] Testar feature flag (ocultar/exibir aba e ações)

### 8.2 Testes de UX (1h)
- [ ] Testar formatação BRL (R$ 1.234,56)
- [ ] Testar dark mode
- [ ] Testar responsividade
- [ ] Testar acessibilidade (contraste, labels, VoiceOver)
- [ ] Testar iOS e Android

---

## Definition of Done

- [ ] Tabela `purchases` criada com RLS
- [ ] Bucket `receipts` configurado com RLS
- [ ] Hook `usePurchases()` implementado
- [ ] Lib `finance.ts` com cálculos corretos
- [ ] Tela de resumo com 4 métricas
- [ ] Tela de adicionar/editar compra funcional
- [ ] Upload de recibos funcional
- [ ] Modal de opt-in para R$/kg implementado
- [ ] R$/kg atrás de opt-in + cópia cuidadosa
- [ ] Formatação BRL correta
- [ ] Estados vazios claros
- [ ] Validações de formulário
- [ ] Feature flag `FF_FINANCE_MVP` implementada
- [ ] Aba "Custos" condicionada por flag
- [ ] Quick Actions condicionada por flag
- [ ] Dark mode funcional
- [ ] Testes iOS/Android passando

---

## Riscos Identificados

**Médio:** Sensibilidade de dados financeiros  
**Mitigação:** RLS rigoroso, disclaimer de privacidade

**Baixo:** Cálculo de R$/kg pode ser mal interpretado (custo ≠ valor)  
**Mitigação:** Tooltip explicativo, opt-in obrigatório

**Baixo:** Upload de recibos pode falhar em conexões lentas  
**Mitigação:** Loading indicator, retry automático

---

## Arquivos a Criar/Editar

**Criar:**
- `supabase/migrations/XXX_create_purchases.sql`
- `lib/storage.ts`
- `lib/finance.ts`
- `hooks/usePurchases.ts`
- `components/finance/FinancialSummaryCard.tsx`
- `components/finance/PurchaseListItem.tsx`
- `components/finance/CostPerKgOptInModal.tsx`
- `app/(tabs)/finance/index.tsx`
- `app/(tabs)/finance/add-purchase.tsx`
- `app/(tabs)/finance/_layout.tsx`

**Editar:**
- `lib/feature-flags.ts` (adicionar `FF_FINANCE_MVP`)
- `app/(tabs)/_layout.tsx` (adicionar aba condicionada)
- `components/dashboard/QuickActionsCard.tsx` (adicionar ação condicionada)

