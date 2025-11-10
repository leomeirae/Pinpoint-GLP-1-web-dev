## Onboarding Questions Overview

| Ordem | Pergunta | Tipo de Seleção | Opções / Entrada |
| --- | --- | --- | --- |
| 1 | Você já está tomando algum medicamento com GLP-1? | Lista de botões (radio) | Já estou tomando GLP-1 · Eu ainda não comecei a usar GLP-1 |
| 2 | Qual medicamento com GLP-1 você planeja usar? | Lista de botões (radio) | Zepbound® · Mounjaro® · Ozempic® · Wegovy® · Tirzepatida · Semaglutida |
| 3 | Você sabe sua dose inicial recomendada? | Lista de botões (radio) | 2.5mg · 5mg · 7.5mg · 10mg · 12.5mg · 15mg · Outro |
| 4 | Que tipo de dispositivo você usa? | Cartões clicáveis (radio) | Caneta pré-preenchida · Seringa · Auto-injetor |
| 5 | Com que frequência você tomará suas injeções? | Lista de botões (radio) | Todos os dias · A cada 7 dias (mais comum) · A cada 14 dias · Personalizado · Não tenho certeza, ainda estou descobrindo |
| 6 | Aceitar aviso de saúde | Alternância (switch) | Aceitar aviso de saúde (obrigatório) |
| 7 | Sua altura | Rolagem com snapping (picker vertical) | Intervalo contínuo de 150cm a 199cm |
| 8 | Seu peso atual | Rolagem com snapping (picker vertical) | Intervalo contínuo de 50kg a 149kg |
| 9 | Conte-nos como você estava quando começou. | Cartão de exibição + seletor de data | Peso inicial pré-preenchido · Data de início (seleção de calendário) |
|10 | Peso meta | Slider contínuo | Intervalo de 70kg a 80kg (passo de 1kg) |
|11 | Qual velocidade de perda de peso você espera? | Cartões clicáveis (radio) | Lento e constante (0,5 kg/semana) · Moderado (1 kg/semana) · Rápido (1,5 kg/semana) |
|12 | Como você descreveria seu nível de atividade física? | Cartões clicáveis (radio) | Sedentário · Levemente ativo · Moderadamente ativo · Muito ativo · Extremamente ativo |
|13 | Em qual dia da semana você costuma ter mais "food noise"? | Cartões clicáveis (radio) | Segunda-feira · Terça-feira · Quarta-feira · Quinta-feira · Sexta-feira · Sábado · Domingo · Não tenho um dia específico |
|14 | Quais efeitos colaterais mais te preocupam (se houver)? | Cartões com checkboxes (seleção múltipla) | Náusea · Azia · Fadiga · Queda de cabelo · Prisão de ventre · Perda de massa muscular |
|15 | O que te motiva a usar GLP-1? | Cartões clicáveis (radio) | Saúde geral · Perder peso · Controlar diabetes · Qualidade de vida · Recomendação médica |

### Observações adicionais
- As cinco primeiras perguntas utilizam componentes `TouchableOpacity` com estilo de opção única; o botão “Próximo” habilita apenas após seleção.
- O aviso de saúde exige que o usuário ative o `Switch` para liberar o botão “Continuar”.
- Altura e peso atual usam listas roláveis com _snap_ e feedback tátil (`expo-haptics`) ao selecionar um valor.
- Peso inicial é exibido em cartão informativo; a data de início é escolhida via `DateTimePicker` nativo.
- A meta de peso usa `Slider` contínuo com feedback háptico a cada alteração.
- Para velocidade de perda de peso, nível de atividade, food noise e motivação, a seleção muda a cor do cartão e exibe ícone de confirmação.
- A tela de efeitos colaterais aceita múltiplas seleções, exigindo pelo menos uma antes de avançar.

