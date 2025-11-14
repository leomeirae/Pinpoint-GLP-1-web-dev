# Pinpoint GLP-1

![LGPD Compliant](https://img.shields.io/badge/LGPD-Compliant-green) ![React Native](https://img.shields.io/badge/React%20Native-0.81.5-blue) ![Expo](https://img.shields.io/badge/Expo-SDK%2054-000020) ![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)

**Aplicativo para acompanhamento de medicamentos GLP-1 (Tirzepatida, Ozempic, Saxenda, Wegovy)**

---

## 📱 Sobre o Projeto

O Pinpoint GLP-1 é um aplicativo React Native desenvolvido com Expo que ajuda usuários a acompanhar suas aplicações de medicamentos GLP-1, monitorar progresso de peso, registrar efeitos colaterais e manter um histórico completo de sua jornada.

### Funcionalidades Principais

- 📊 **Dashboard Completo** - Visão geral do progresso e Quick Actions para ações rápidas
- 💉 **Registro de Aplicações** - Controle de doses semanais com lembretes inteligentes
- 📈 **Gráficos de Progresso** - Acompanhamento de peso e níveis estimados de medicação
- 📅 **Calendário** - Visualização temporal das aplicações e marcos
- 💰 **Controle Financeiro** - Rastreamento de gastos com medicação (R$/total, R$/semana, R$/kg)
- ⏸️ **Gestão de Pausas** - Controle de pausas no tratamento com desligamento automático de lembretes
- 🍷 **Tracking de Álcool** - Registro de consumo com overlays discretos em gráficos
- 🔔 **Notificações Semanais** - Lembretes confiáveis com janela de aplicação configurável
- 🎓 **Coachmarks** - Sistema de onboarding in-app para guiar usuários
- ⚙️ **Configurações Personalizáveis** - Temas, notificações, privacidade e preferências
- 🎨 **Temas Personalizados** - 8 temas visuais diferentes + Dark Mode automático
- 📱 **Onboarding Essencial** - 5 telas core focadas no essencial
- 🔒 **Privacidade e Compliance** - LGPD/GDPR compliant com opt-in obrigatório para analytics

---

## 🛠️ Stack Tecnológica

- **Framework:** Expo SDK 54+
- **Linguagem:** TypeScript (strict mode)
- **Autenticação:** Clerk
- **Database:** Supabase
- **Estilo:** StyleSheet nativo do React Native
- **Analytics:** Sistema próprio com tracking de eventos

---

## 📚 Documentação

### Documentos Principais

- **[DOCS-INDEX.md](./DOCS-INDEX.md)** - Índice completo da documentação
- **[PARITY-ANALYSIS-SUMMARY.md](./PARITY-ANALYSIS-SUMMARY.md)** - Análise de paridade com Shotsy
- **[IMPLEMENTATION-PHASES.md](./IMPLEMENTATION-PHASES.md)** - Fases de implementação
- **[DATA-MODEL-MAP.md](./DATA-MODEL-MAP.md)** - Mapeamento do modelo de dados

### Documentação Estruturada

- **[docs/README.md](./docs/README.md)** - Documentação técnica detalhada
- **[docs/guides/QUICK-START.md](./docs/guides/QUICK-START.md)** - Guia de início rápido
- **[docs/technical/ARCHITECTURE.md](./docs/technical/ARCHITECTURE.md)** - Arquitetura do sistema

### Especificações

- **[TRACKING-EVENTS-SPEC.md](./TRACKING-EVENTS-SPEC.md)** - Eventos de analytics
- **[MICROCOPY-TABLE.md](./MICROCOPY-TABLE.md)** - Textos da interface
- **[PARITY-BACKLOG.md](./PARITY-BACKLOG.md)** - Backlog de desenvolvimento

---

## 🚀 Início Rápido

### Pré-requisitos

- Node.js 18+
- Expo CLI
- Conta Supabase
- Conta Clerk

### Instalação

```bash
# Clone o repositório
git clone https://github.com/leomeirae/Pinpoint-GLP-1.git
cd Pinpoint-GLP-1

# Instale dependências
npm install

# Configure variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais

# Execute o projeto
npx expo start
```

### Configuração

1. **Supabase:** Configure as tabelas usando os scripts em `supabase/migrations/`
2. **Clerk:** Configure autenticação e webhooks

---

## 📁 Estrutura do Projeto

```
pinpoint-glp-1/
├── app/                    # Expo Router (file-based routing)
│   ├── (auth)/            # Telas de autenticação
│   ├── (tabs)/            # Telas principais (tabs)
│   └── _layout.tsx        # Layout raiz
├── components/            # Componentes reutilizáveis
│   ├── ui/               # Componentes de UI básicos
│   └── [feature]/        # Componentes específicos por feature
├── lib/                   # Configurações e utilitários
├── hooks/                 # Custom hooks
├── constants/            # Constantes (cores, temas)
├── docs/                 # Documentação estruturada
├── scripts/              # Scripts utilitários
├── supabase/             # Migrações e configurações DB
└── reference/            # Materiais de referência
```

---

## 🧪 Testes e Qualidade

### Scripts Disponíveis

- `npm start` - Inicia o servidor de desenvolvimento
- `npm run lint` - Executa linting
- `npm run type-check` - Verificação de tipos TypeScript

### Verificações

- **[scripts/verify-onboarding.sh](./scripts/verify-onboarding.sh)** - Verifica integridade do onboarding
- **[SQL-VALIDATION.sql](./archive/2025-01/SQL-VALIDATION.sql)** - Validações de banco de dados

---

## 🎯 Roadmap

### ✅ Fase 1 - P0 (Concluída)

- [x] Onboarding completo (23 telas)
- [x] Sistema de autenticação
- [x] Dashboard principal
- [x] Registro de aplicações
- [x] Gráficos básicos

### 🚧 Fase 2 - P1 (Em Andamento)

- [ ] Paywall e assinaturas
- [ ] FAQ integrado
- [ ] Exportação de dados
- [ ] Notificações push
- [ ] Widgets iOS

### 📋 Fase 3 - P2 (Planejado)

- [ ] Apple Health / Google Fit
- [ ] Compartilhamento social
- [ ] Relatórios avançados
- [ ] Modo offline

---

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Diretrizes

- Siga o TypeScript strict mode
- Mantenha arquivos com máximo 300 linhas
- Documente mudanças significativas
- Teste em iOS e Android

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

---

## 📞 Contato

- **Desenvolvedor:** Leonardo Meira
- **Email:** leo@pinpointglp1.app
- **GitHub:** [github.com/leomeirae/Pinpoint-GLP-1](https://github.com/leomeirae/Pinpoint-GLP-1)

---

## 📋 Histórico

- **2025-01-03:** Limpeza e organização do repositório
- **2024-11:** Implementação do carrossel Shotsy
- **2024-10:** Lançamento da versão P0

**Documentos históricos:** Veja `archive/2025-01/` para documentação de desenvolvimento anterior.

---

_Última atualização: Janeiro 2025_
