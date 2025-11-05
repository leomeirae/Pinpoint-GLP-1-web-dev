# Mounjaro Tracker - Product Requirements Document (PRD)

**Versão:** 1.0  
**Data:** Janeiro 2025  
**Autor:** Leonardo Meira  
**Tipo:** Aplicativo Mobile React Native  

---

## 📋 Visão Geral do Produto

### Propósito
O **Mounjaro Tracker** é um aplicativo mobile desenvolvido em React Native/Expo que permite aos usuários acompanhar de forma completa e intuitiva o uso de medicamentos GLP-1 (Mounjaro, Ozempic, Saxenda, Wegovy), incluindo registro de aplicações, monitoramento de progresso de peso, controle de efeitos colaterais e análise nutricional com IA.

### Problema Resolvido
- **Falta de controle:** Usuários de medicamentos GLP-1 precisam de um sistema organizado para acompanhar aplicações, doses e progresso
- **Dispersão de dados:** Informações ficam espalhadas em diferentes apps ou anotações manuais
- **Ausência de insights:** Falta de análise inteligente sobre padrões e progresso do tratamento
- **Complexidade de uso:** Apps existentes são complexos ou não focam especificamente em GLP-1

### Público-Alvo
- **Primário:** Adultos (25-55 anos) em tratamento com medicamentos GLP-1
- **Secundário:** Profissionais de saúde que acompanham pacientes
- **Terciário:** Pessoas interessadas em iniciar tratamento GLP-1

---

## 🎯 Objetivos do Produto

### Objetivos Primários
1. **Simplicidade:** Interface intuitiva que qualquer usuário consegue usar
2. **Completude:** Cobertura total do ciclo de tratamento GLP-1
3. **Insights:** Análise inteligente de dados para melhor acompanhamento
4. **Confiabilidade:** Sistema estável e seguro para dados de saúde

### Métricas de Sucesso
- **Retenção:** 70% dos usuários ativos após 30 dias
- **Engajamento:** 5+ interações por semana por usuário ativo
- **Completude:** 80% dos usuários completam onboarding
- **Satisfação:** NPS > 50

---

## ⚡ Funcionalidades Principais

### 1. Autenticação e Onboarding
**Descrição:** Sistema completo de entrada no app com configuração personalizada

**Funcionalidades:**
- Login via Google OAuth (Clerk)
- Onboarding em 23 telas com configuração completa
- Coleta de dados: medicamento, dose, objetivos, preferências
- Configuração de perfil e avatar personalizado
- Seleção de tema visual (8 opções disponíveis)

**Critérios de Aceitação:**
- ✅ Login funciona em iOS e Android
- ✅ Onboarding pode ser pausado e retomado
- ✅ Dados são salvos progressivamente
- ✅ Validação de campos obrigatórios

### 2. Dashboard Principal
**Descrição:** Visão geral centralizada do progresso e próximas ações

**Funcionalidades:**
- Resumo de progresso de peso (gráfico)
- Próxima aplicação programada
- Níveis estimados de medicação no sangue
- Estatísticas de aderência ao tratamento
- Acesso rápido às principais funcionalidades
- Conquistas e marcos alcançados

**Critérios de Aceitação:**
- ✅ Carregamento em < 3 segundos
- ✅ Dados atualizados em tempo real
- ✅ Gráficos responsivos e interativos
- ✅ Navegação intuitiva para outras seções

### 3. Registro de Aplicações
**Descrição:** Sistema completo para registrar injeções de medicamento

**Funcionalidades:**
- Seleção de medicamento e dosagem
- Escolha de local de aplicação (diagrama corporal interativo)
- Registro de data/hora da aplicação
- Notas opcionais sobre a aplicação
- Histórico completo de aplicações
- Lembretes automáticos

**Critérios de Acritação:**
- ✅ Formulário simples e rápido (< 30 segundos)
- ✅ Validação de dados obrigatórios
- ✅ Sincronização com calendário
- ✅ Backup automático dos dados

### 4. Monitoramento de Peso
**Descrição:** Acompanhamento detalhado da evolução do peso

**Funcionalidades:**
- Registro rápido de peso
- Gráficos de evolução temporal
- Metas de peso personalizáveis
- Análise de tendências
- Exportação de dados
- Integração futura com Apple Health/Google Fit

**Critérios de Aceitação:**
- ✅ Entrada de dados em múltiplas unidades (kg, lbs)
- ✅ Gráficos claros e informativos
- ✅ Cálculo automático de progresso
- ✅ Validação de valores realistas

### 5. Calendário e Histórico
**Descrição:** Visualização temporal de todas as atividades

**Funcionalidades:**
- Calendário mensal com eventos marcados
- Histórico detalhado de aplicações
- Filtros por tipo de evento
- Busca por período específico
- Exportação de relatórios
- Visualização de padrões

**Critérios de Aceitação:**
- ✅ Interface de calendário intuitiva
- ✅ Performance otimizada para grandes volumes
- ✅ Sincronização entre dispositivos
- ✅ Backup de dados históricos

### 6. IA Nutricional (Gemini)
**Descrição:** Chat inteligente para análise e orientação nutricional

**Funcionalidades:**
- Chat conversacional com IA
- Análise de refeições por foto ou descrição
- Sugestões personalizadas de alimentação
- Histórico de conversas
- Integração com progresso de peso
- Dicas baseadas no medicamento usado

**Critérios de Aceitação:**
- ✅ Respostas em < 5 segundos
- ✅ Contexto personalizado por usuário
- ✅ Histórico persistente
- ✅ Moderação de conteúdo médico

### 7. Configurações e Personalização
**Descrição:** Controle completo da experiência do usuário

**Funcionalidades:**
- 8 temas visuais diferentes
- Configurações de notificações
- Preferências de unidades (métrico/imperial)
- Configurações de privacidade
- Backup e sincronização
- Exportação de dados

**Critérios de Aceitação:**
- ✅ Mudanças aplicadas instantaneamente
- ✅ Persistência entre sessões
- ✅ Sincronização entre dispositivos
- ✅ Configurações acessíveis

---

## 🏗️ Arquitetura Técnica

### Stack Tecnológica
- **Frontend:** React Native + Expo SDK 54+
- **Linguagem:** TypeScript (strict mode)
- **Autenticação:** Clerk (OAuth Google)
- **Database:** Supabase (PostgreSQL)
- **IA:** Google Gemini API
- **Estilo:** StyleSheet nativo (sem bibliotecas externas)
- **Navegação:** Expo Router (file-based routing)

### Estrutura de Dados
```typescript
// Usuário
interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  onboarding_completed: boolean;
  created_at: string;
}

// Aplicação de Medicamento
interface MedicationApplication {
  id: string;
  user_id: string;
  medication_type: 'mounjaro' | 'ozempic' | 'saxenda' | 'wegovy';
  dosage: string;
  injection_site: string;
  applied_at: string;
  notes?: string;
}

// Registro de Peso
interface WeightLog {
  id: string;
  user_id: string;
  weight: number;
  unit: 'kg' | 'lbs';
  recorded_at: string;
  notes?: string;
}
```

### Segurança e Privacidade
- **Autenticação:** OAuth 2.0 via Clerk
- **Dados:** Criptografia em trânsito e repouso
- **Compliance:** LGPD/GDPR ready
- **Backup:** Automático e criptografado
- **Acesso:** Row Level Security (RLS) no Supabase

---

## 🎨 Design e UX

### Princípios de Design
1. **Simplicidade:** Interface limpa e minimalista
2. **Acessibilidade:** Suporte a leitores de tela e alto contraste
3. **Consistência:** Padrões visuais unificados
4. **Performance:** Transições fluidas e carregamento rápido

### Temas Visuais
- **8 temas disponíveis:** Azul, Verde, Rosa, Roxo, Laranja, Vermelho, Cinza, Escuro
- **Modo escuro:** Disponível em todos os temas
- **Personalização:** Cores de destaque configuráveis

### Fluxos de Usuário Principais
1. **Primeiro uso:** Welcome → Login → Onboarding → Dashboard
2. **Uso diário:** Dashboard → Registrar aplicação → Visualizar progresso
3. **Análise:** Dashboard → Calendário → Relatórios → IA Nutricional

---

## 📱 Plataformas e Compatibilidade

### Plataformas Suportadas
- **iOS:** 13.0+ (iPhone e iPad)
- **Android:** API 21+ (Android 5.0+)
- **Web:** Suporte limitado via Expo Web

### Dispositivos Testados
- iPhone 12/13/14/15 (todas as variantes)
- iPad Air/Pro (compatibilidade tablet)
- Samsung Galaxy S20+, Google Pixel 6+
- Diversos dispositivos Android mid-range

### Performance
- **Startup:** < 3 segundos em dispositivos modernos
- **Navegação:** 60 FPS em transições
- **Memória:** < 150MB de uso médio
- **Bateria:** Otimizado para uso prolongado

---

## 🚀 Roadmap e Fases

### ✅ Fase 1 - P0 (Concluída - Janeiro 2025)
- [x] Sistema de autenticação completo
- [x] Onboarding em 23 telas
- [x] Dashboard principal funcional
- [x] Registro de aplicações
- [x] Monitoramento de peso básico
- [x] Calendário e histórico
- [x] 8 temas visuais
- [x] IA nutricional (Gemini)

### 🚧 Fase 2 - P1 (Em Desenvolvimento)
- [ ] Sistema de assinaturas (Clerk Payments)
- [ ] FAQ integrado e help center
- [ ] Notificações push inteligentes
- [ ] Exportação avançada de dados (PDF)
- [ ] Widgets iOS/Android
- [ ] Modo offline básico

### 📋 Fase 3 - P2 (Planejado)
- [ ] Integração Apple Health / Google Fit
- [ ] Compartilhamento social de progresso
- [ ] Relatórios médicos avançados
- [ ] Modo offline completo
- [ ] Apple Watch / Wear OS apps
- [ ] Telemedicina integrada

---

## 📊 Analytics e Métricas

### Eventos Rastreados
- **Onboarding:** Progresso por tela, taxa de abandono
- **Engajamento:** Sessões, tempo de uso, features mais usadas
- **Conversão:** Registro de aplicações, uso da IA
- **Retenção:** D1, D7, D30 retention rates
- **Performance:** Tempos de carregamento, crashes

### KPIs Principais
- **MAU (Monthly Active Users):** Meta 10k usuários
- **Retention Rate D30:** Meta 70%
- **Session Duration:** Meta 5+ minutos
- **Feature Adoption:** Meta 80% para features core
- **Crash Rate:** < 0.1%

---

## 🔒 Compliance e Regulamentações

### Privacidade de Dados
- **LGPD:** Compliance total com lei brasileira
- **GDPR:** Suporte para usuários europeus
- **HIPAA:** Considerações para dados de saúde (futuro)
- **Consentimento:** Opt-in explícito para coleta de dados

### Segurança
- **Criptografia:** AES-256 para dados sensíveis
- **Autenticação:** MFA disponível via Clerk
- **Auditoria:** Logs completos de acesso
- **Backup:** Redundância geográfica

---

## 🎯 Critérios de Sucesso do Produto

### Funcionalidade
- ✅ Todas as features core funcionam sem bugs críticos
- ✅ Performance consistente em dispositivos suportados
- ✅ Sincronização de dados 99.9% confiável
- ✅ Interface responsiva e acessível

### Negócio
- 📈 Crescimento orgânico de usuários
- 💰 Modelo de monetização sustentável
- ⭐ Rating 4.5+ nas app stores
- 🔄 Baixa taxa de churn (< 30% mensal)

### Técnico
- 🚀 Deploy automatizado e confiável
- 📊 Monitoramento completo de performance
- 🔧 Manutenibilidade do código
- 📱 Compatibilidade cross-platform

---

## 📞 Contato e Suporte

**Desenvolvedor:** Leonardo Meira  
**Email:** leo@mounjarotracker.app  
**Website:** [mounjarotracker.app](https://mounjarotracker.app)  

**Repositório:** GitHub (privado)  
**Documentação:** `/docs` folder  
**Issues:** GitHub Issues  

---

*Este documento é atualizado continuamente conforme o produto evolui. Última atualização: Janeiro 2025*





