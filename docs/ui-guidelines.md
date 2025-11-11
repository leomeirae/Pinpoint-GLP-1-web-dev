# Diretrizes de UI/UX - Onboarding PinpointGLP1

Este documento consolida as diretrizes de design e experiência do usuário para a refatoração do fluxo de onboarding. O objetivo é garantir consistência, acessibilidade e uma experiência acolhedora, com base nas referências textuais e na estrutura de código existente.

## 1. Princípios Gerais

- **Clareza e Foco:** Cada tela deve ter um único objetivo claro.
- **Acessibilidade:** Garantir que o aplicativo seja utilizável por todos, seguindo as diretrizes de contraste e tamanho de alvo.
- **Consistência:** Componentes, ícones e linguagem devem ser padronizados em todo o fluxo.
- **Linguagem:** PT-BR, humana, clara e sem tons de culpabilização.

---

## 2. Diretrizes de Componentes e Estilos

### Copiar / Replicar (Baseado nas referências do Shotsy)

- **Seleção de Medicação:** Implementar um componente com campo de busca que filtra uma lista de medicamentos (Mounjaro, Ozempic, etc.).
- **Seleção de Dose/Frequência:** Utilizar componentes de seleção claros e diretos, com opções bem definidas para cada tipo de medicação.
- **Pickers com "Snap":** Para altura, peso atual e peso inicial, substituir `ScrollView` por `@react-native-picker/picker` ou similar para criar um efeito "snap" preciso, onde o valor selecionado trava no centro.
- **Card de Resumo de Meta:** Apresentar a meta de peso em um card de destaque, visualmente claro e motivacional.
- **Tela de Revisão:** A tela `ReviewDataScreen` deve agrupar os dados coletados em seções (Tratamento, Dados Físicos, Meta), cada uma com um botão "Editar" que direciona para o passo correspondente.

### Manter / Padronizar

- **Layout Base:** Continuar usando `OnboardingScreenBase.tsx` para manter a estrutura padrão (título, subtítulo, área de conteúdo, botão de ação).
- **Tipografia Tokenizada:** Utilizar um sistema de tokens consistente (ex: `Title`, `Subtitle`, `Body`, `Caption`) para garantir hierarquia visual.
- **Espaçamento:** Manter um sistema de espaçamento coerente (ex: múltiplos de 8pt) para margens, paddings e entre elementos.
- **Ícones Phosphor:** **OBRIGATÓRIO:** Utilizar exclusivamente ícones da biblioteca `phosphor-react-native`. Nenhum emoji deve ser usado como ícone funcional.
- **SafeArea / StatusBar:** Garantir que o layout de todas as telas respeite a `SafeAreaView`, evitando que o conteúdo seja cortado ou sobreposto pela status bar ou notch.

### Evitar

- **Emojis como Ícones:** Remover 100% dos emojis usados em botões, listas ou como indicadores.
- **Termo "Food Noise":** Substituir em toda a aplicação, incluindo código e textos, por **"Vontade de beliscar"**.
- **Pickers em ScrollView:** Não usar `ScrollView` para seleção de valores que exigem precisão (altura, peso). Utilizar pickers nativos com "snap".
- **Coleta de Dados nos Hooks:** As telas de hook (Custos, Álcool, Pausas) são apenas promocionais. Elas **NÃO DEVEM** conter nenhum campo de input ou coletar/salvar qualquer tipo de dado.
- **Paywall no Onboarding:** Nenhum tipo de paywall ou tela de assinatura deve interromper o fluxo principal de coleta de dados.

---

## 3. Exemplos de Aplicação

1.  **Componente Picker (Altura/Peso):**
    - **Implementação:** Deve usar `@react-native-picker/picker`.
    - **Visual:** Exibe uma lista vertical de valores. O item central é destacado (ex: cor primária, fonte maior) e representa o valor selecionado. O usuário desliza a lista para cima/baixo para alterar o valor.
    - **Comportamento:** O "snap" garante que a rolagem sempre pare com um item perfeitamente alinhado no centro.

2.  **Botão de Ação Principal (CTA):**
    - **Dimensões:** Deve ter um tamanho de alvo de toque mínimo de `44x44pt` (preferencialmente ~48pt de altura) e ocupar a largura total do container principal, respeitando as margens laterais.
    - **Contraste:** A cor do texto sobre o fundo do botão deve ter uma taxa de contraste de, no mínimo, **4.5:1**.

3.  **Card de Informação (Tela de Revisão):**
    - **Estrutura:** Um card deve conter um título de seção (ex: "Seu Tratamento"), seguido por pares de `label: valor` (ex: "Medicamento: Ozempic").
    - **Ação:** Cada card deve ter um CTA secundário, como um botão "Editar" com um ícone de lápis (Phosphor), que aciona a navegação para a tela específica daquela seção.
