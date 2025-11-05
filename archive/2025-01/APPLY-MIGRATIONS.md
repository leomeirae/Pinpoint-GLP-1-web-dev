# 🚀 Aplicar Migrations - Guia Rápido

**NOTA:** Este arquivo foi atualizado. Para instruções completas e detalhadas, consulte:

👉 **[APPLY-MIGRATIONS-GUIDE.md](./APPLY-MIGRATIONS-GUIDE.md)** - Guia completo e detalhado
👉 **[MIGRATIONS-QUICK-REFERENCE.md](./MIGRATIONS-QUICK-REFERENCE.md)** - Referência rápida

---

## ⚡ Quick Start (5 Migrações: 003-007)

### 1. Abra o Supabase Dashboard

1. Acesse: https://app.supabase.com
2. Selecione seu projeto
3. Vá em **SQL Editor** (menu lateral)
4. Clique em **+ New Query**

### 2. Execute as Migrations em Ordem

**IMPORTANTE:** As migrações devem ser executadas em sequência: 003 → 004 → 005 → 006 → 007

#### Migration 003: Avatar System
```
Arquivo: supabase/migrations/003_personalization_avatar.sql
Cria: user_avatars table
```

#### Migration 004: Goals System
```
Arquivo: supabase/migrations/004_personalization_goals.sql
Cria: user_goals table
```

#### Migration 005: Communication Preferences
```
Arquivo: supabase/migrations/005_personalization_communication.sql
Cria: communication_preferences table
```

#### Migration 006: Insights System
```
Arquivo: supabase/migrations/006_insights_system.sql
Cria: user_insights, detected_patterns, health_scores tables
```

#### Migration 007: Pain & Medication Tracking
```
Arquivo: supabase/migrations/007_add_pain_medication_fields.sql
Adiciona: pain_level e medication_type columns
```

### 3. Para cada migration:

1. Copie todo o conteúdo do arquivo SQL
2. Cole no SQL Editor do Supabase
3. Clique em **Run** (botão inferior direito)
4. Aguarde mensagem "Success"
5. Execute query de verificação (veja guia completo)

### 4. Verifique

Execute esta query após todas as migrações:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'user_avatars',
    'user_goals',
    'communication_preferences',
    'user_insights',
    'detected_patterns',
    'health_scores'
  )
ORDER BY table_name;
```

Deve retornar **6 tabelas**.

---

## ✅ Checklist

Após aplicar todas as migrações:

- [ ] Migration 003 aplicada (user_avatars criada)
- [ ] Migration 004 aplicada (user_goals criada)
- [ ] Migration 005 aplicada (communication_preferences criada)
- [ ] Migration 006 aplicada (3 tabelas de insights criadas)
- [ ] Migration 007 aplicada (colunas pain_level e medication_type adicionadas)
- [ ] Query de verificação retorna 6 tabelas
- [ ] Sem erros no Supabase logs

---

## 🎯 O que cada migration habilita no app:

| Migration | Feature |
|-----------|---------|
| 003 | Personalização de avatar no onboarding |
| 004 | Sistema de metas e progresso |
| 005 | Estilo de comunicação personalizado |
| 006 | Insights automatizados e health score |
| 007 | Tracking de nível de dor e tipo de medicação |

---

## 📚 Documentação Completa

Para instruções detalhadas, troubleshooting, e queries de verificação completas:

- **[APPLY-MIGRATIONS-GUIDE.md](./APPLY-MIGRATIONS-GUIDE.md)** - Guia completo com screenshots, troubleshooting e rollback
- **[MIGRATIONS-QUICK-REFERENCE.md](./MIGRATIONS-QUICK-REFERENCE.md)** - Referência rápida de uma página

---

## 🆘 Problemas?

### "relation 'profiles' does not exist"
→ Aplique migrations 001 e 002 primeiro

### "permission denied"
→ Verifique se você está logado como owner do projeto

### Outros erros
→ Consulte seção de Troubleshooting no guia completo

---

## Pronto!

Após aplicar as migrations:

1. Faça logout do app
2. Crie nova conta para testar onboarding
3. Verifique personalização de avatar
4. Teste criação de metas
5. Configure preferências de comunicação

O app agora terá o sistema completo de personalização! 🎉
