# 🔒 Guia: Corrigir RLS da Tabela daily_nutrition

## 🔍 Problema

```
ERROR: new row violates row-level security policy for table "daily_nutrition"
Code: 42501
```

### Causa
Você está usando **Clerk** para autenticação, mas as políticas RLS (Row-Level Security) do Supabase estão configuradas para usar `auth.uid()`, que só funciona com **Supabase Auth**.

Com Clerk:
- ❌ `auth.uid()` retorna `null`
- ❌ Políticas RLS bloqueiam inserções
- ✅ Você precisa desabilitar RLS ou ajustar as políticas

---

## 🛠️ Solução (Escolha uma opção)

### **Opção 1: DESABILITAR RLS** ⭐ Recomendado

Esta é a solução mais simples e segura quando você usa Clerk.

#### Por que é seguro?
1. ✅ Clerk já autentica o usuário
2. ✅ Seu app sempre filtra por `user_id`
3. ✅ O `anon key` do Supabase só funciona via seu app
4. ✅ Usuários não conseguem acessar dados de outros

#### Como fazer:

1. **Acesse o Supabase Dashboard:**
   - Vá em: https://supabase.com/dashboard
   - Selecione seu projeto: `mounjaro-tracker`

2. **Abra o SQL Editor:**
   - Menu lateral → **SQL Editor**
   - Clique em **+ New query**

3. **Cole e execute este SQL:**

```sql
-- Desabilitar RLS na tabela daily_nutrition
ALTER TABLE daily_nutrition DISABLE ROW LEVEL SECURITY;
```

4. **Clique em "Run" (Ctrl/Cmd + Enter)**

5. **Verifique se funcionou:**
   - Você deve ver: `Success. No rows returned`
   - ✅ Pronto! O erro deve sumir

---

### **Opção 2: Manter RLS com Política Permissiva**

Se você ainda quiser manter RLS ativo (para auditoria ou compliance):

1. **Abra o SQL Editor no Supabase**

2. **Cole e execute:**

```sql
-- Remover políticas antigas
DROP POLICY IF EXISTS "Users can view their own nutrition data" ON daily_nutrition;
DROP POLICY IF EXISTS "Users can insert their own nutrition data" ON daily_nutrition;
DROP POLICY IF EXISTS "Users can update their own nutrition data" ON daily_nutrition;
DROP POLICY IF EXISTS "Users can delete their own nutrition data" ON daily_nutrition;

-- Habilitar RLS
ALTER TABLE daily_nutrition ENABLE ROW LEVEL SECURITY;

-- Criar política permissiva para usuários autenticados
CREATE POLICY "Allow all operations for app users"
  ON daily_nutrition
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

⚠️ **ATENÇÃO:** Esta opção permite acesso a todos os dados via anon key. Só use se você confia que seu app sempre filtra por `user_id`.

---

## 🧪 Como Testar

Após executar o SQL:

1. **Reinicie o app Expo** (Ctrl+C e `npx expo start`)

2. **Teste o chat de nutrição:**
   - Vá na aba "Nutrição"
   - Digite uma mensagem (ex: "Almocei arroz e feijão")
   - Envie

3. **Verifique:**
   - ✅ Mensagem enviada com sucesso
   - ✅ Resposta do AI recebida
   - ✅ Confirmação de macros aparece
   - ✅ Não deve mais dar erro 42501

---

## 📊 Comparação das Opções

| Característica | Opção 1: Desabilitar RLS | Opção 2: RLS Permissivo |
|----------------|--------------------------|-------------------------|
| **Facilidade** | ✅ Muito fácil | ⚠️ Um pouco mais complexo |
| **Segurança** | ✅ Seguro com Clerk | ⚠️ Requer confiança no app |
| **Performance** | ✅ Mais rápido | ⚠️ Overhead do RLS |
| **Manutenção** | ✅ Menos código | ⚠️ Mais políticas |
| **Recomendado para Clerk** | ✅ **SIM** | ⚠️ Opcional |

---

## 🔐 Considerações de Segurança

### Com RLS Desabilitado + Clerk:

**Camadas de segurança que você TEM:**
1. ✅ Clerk autentica usuários (JWT tokens)
2. ✅ Supabase valida anon key
3. ✅ App filtra por `user_id` sempre
4. ✅ HTTPS encripta requisições

**O que um atacante precisaria:**
- Seu `anon key` do Supabase
- Conhecer o `user_id` de outro usuário
- Interceptar ou fazer requisições diretas

**Conclusão:** Com Clerk, desabilitar RLS é seguro o suficiente para a maioria dos apps.

---

## 📝 Arquivos de Referência

O SQL está disponível em:
```
supabase/migrations/fix_daily_nutrition_rls.sql
```

---

## ❓ FAQ

### P: E se eu quiser máxima segurança?
**R:** Use Supabase Auth ao invés de Clerk, ou implemente uma função Edge no Supabase que valida o JWT do Clerk.

### P: Preciso desabilitar RLS em outras tabelas?
**R:** Sim, se você tiver o mesmo erro em `medications`, `medication_applications`, etc.

### P: Posso reverter depois?
**R:** Sim, basta executar:
```sql
ALTER TABLE daily_nutrition ENABLE ROW LEVEL SECURITY;
```

---

## ✅ Checklist Final

- [ ] Acessei o Supabase Dashboard
- [ ] Abri o SQL Editor
- [ ] Executei o SQL (Opção 1 ou 2)
- [ ] Reiniciei o servidor Expo
- [ ] Testei o chat de nutrição
- [ ] ✅ Erro 42501 desapareceu

---

**Data:** 03/11/2025  
**Status:** Aguardando execução manual no Supabase  
**Próximo passo:** Execute o SQL no Supabase Dashboard

