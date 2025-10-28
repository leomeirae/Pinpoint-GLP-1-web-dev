# TASK-03: Setup Supabase Database

## OBJETIVO
Configurar Supabase como banco de dados, criar schema completo para tracking de medicação e peso, implementar Row Level Security e integrar com Clerk Auth.

## PRÉ-REQUISITOS
- TASK-02 completa e funcionando (Clerk Auth)
- Conta Supabase criada em: https://supabase.com/dashboard
- Terminal aberto na pasta `/Users/user/Desktop/mounjaro-tracker`

---

## PASSO 1: Criar projeto no Supabase

Acesse: https://supabase.com/dashboard

1. Clique em **"New Project"**
2. **Organization**: Escolha ou crie uma
3. **Name**: `mounjaro-tracker`
4. **Database Password**: Crie uma senha forte (anote!)
5. **Region**: `South America (São Paulo)` (mais próximo do Brasil)
6. Clique em **"Create new project"**
7. **Aguarde ~2 minutos** enquanto o projeto é provisionado

---

## PASSO 2: Obter chaves da API

No dashboard do Supabase:

1. Vá em **Settings** (⚙️) → **API**
2. **COPIE** as seguintes chaves:
   - `Project URL`
   - `anon/public` key

---

## PASSO 3: Adicionar variáveis ao .env.local

Abrir arquivo `.env.local` e **ADICIONAR** no final:

\`\`\`env
# Supabase (NOVO)
EXPO_PUBLIC_SUPABASE_URL=https://xxxxxxxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
\`\`\`

**IMPORTANTE**: Substituir pelos valores reais copiados do Supabase.

---

## PASSO 4: Instalar Supabase SDK

Execute no terminal:
\`\`\`bash
npx expo install @supabase/supabase-js
\`\`\`

---

## PASSO 5: Criar schema do banco de dados

No Supabase Dashboard:

1. Clique em **SQL Editor** (no menu lateral)
2. Clique em **"New Query"**
3. **COLE** o SQL abaixo e clique em **"Run"**

---

## PASSO 6: Configurar JWT Template no Clerk

1. Acesse: https://dashboard.clerk.com/
2. Selecione seu app "Mounjaro Tracker"
3. Vá em **JWT Templates** (no menu lateral)
4. Clique em **"+ New template"**
5. Escolha: **"Supabase"**
6. Nome: `supabase`
7. Em **Claims**, adicione: `{"sub": "{{user.id}}"}`
8. Clique em **"Save"**

---

## PASSO 7: Testar

Execute no terminal:
\`\`\`bash
npx expo start
\`\`\`

### Fluxo de teste:

1. ✅ Fazer login com conta existente
2. ✅ App deve mostrar tela de loading "Carregando perfil..."
3. ✅ Após ~1-2 segundos, mostrar dados do Clerk e Supabase
4. ✅ Verificar no Supabase Dashboard → **Table Editor** → `users`

---

## VALIDAÇÃO

- [ ] Projeto Supabase criado
- [ ] SQL schema executado sem erros
- [ ] Variáveis em .env.local configuradas
- [ ] JWT Template "supabase" criado no Clerk
- [ ] App compila sem erros
- [ ] Usuário criado automaticamente no Supabase

---

## RESULTADO ESPERADO

✅ Supabase completamente configurado
✅ Database schema criado (5 tabelas)
✅ Row Level Security (RLS) ativo
✅ Clerk + Supabase integrados
✅ Usuário criado automaticamente no primeiro login
✅ Pronto para TASK-04 (CRUD Operations + UI)

---

## PRÓXIMOS PASSOS

Agora que o Supabase está configurado, você deve executar os comandos do Cursor AI para criar os arquivos de código necessários. Consulte o log do Cursor AI para as instruções de implementação.
