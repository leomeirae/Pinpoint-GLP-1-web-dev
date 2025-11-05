# 📋 Visual Audit Documentation - Mounjaro Tracker

Este diretório contém toda a documentação da auditoria visual para alinhar o Mounjaro Tracker ao design original do Shotsy.

---

## 📂 Estrutura de Documentos

### FASE 0 - PILOTO ✅ COMPLETO

**Arquivo:** `FASE-0-PILOTO-AUDIT.md`  
**Status:** 🟢 Aguardando Aprovação  
**Data:** 5 de novembro de 2025

#### Componentes Auditados:
1. ✅ **Initial Dose Screen** (Onboarding Step 6)
   - Seletor arcaico de dose inicial
   - 4 gaps visuais identificados
   - Esforço: 1h (XS)
   - Resultado: 100% fidelidade ao Shotsy

2. ✅ **Estimated Levels Chart** (Dashboard)
   - Gráfico crítico de níveis estimados
   - 5 gaps visuais identificados
   - Análise: Manter vs Migrar biblioteca
   - Esforço: 1.5h [Opção A] ou 13.5h [Opção B]
   - Resultado: 80-90% fidelidade [A] ou 100% [B]

#### Decisões Necessárias:
- [ ] Metodologia está aprovada?
- [ ] Qual opção para o gráfico? (A ou B)
- [ ] Implementar piloto agora ou continuar documentação?

---

## 📸 Screenshots de Referência

Todos os screenshots do Shotsy estão organizados em:
- **`/FIGMA-SCREENSHOTS/`** - Screenshots originais do Figma/Shotsy
- **`/COMPARISON-SCREENSHOTS/`** - Comparações lado a lado (quando disponível)

### Screenshots do Piloto:
- `shotsy-onboarding-06-initial-dose.PNG` - Initial Dose Screen
- `shotsy-dashboard-estimated-levels-chart.PNG` - Estimated Levels Chart

---

## 🎯 Metodologia Validada

### Níveis de Detalhamento

**P0 (DETALHADO) - Onboarding + Gráficos:**
- ✅ Specs técnicas completas (px, hex, weights)
- ✅ Code snippets das mudanças
- ✅ Comparação propriedade por propriedade
- ✅ Impacto UX em linguagem de negócio
- ✅ Estimativa de esforço e risco
- ✅ Critérios de aceitação testáveis

**P1/P2 (ALTO NÍVEL) - Demais Telas:**
- Layout geral (estrutura de seções)
- Hierarquia visual (problemas de contraste)
- Espaçamentos críticos
- Cores principais

### Formato de Documentação

Cada componente auditado segue o template:

```markdown
## [NOME DO COMPONENTE]

### 📸 Referências Visuais
- Shotsy (Original): screenshot + path
- Mounjaro (Atual): componente + linhas
- Comparação Side-by-Side: (se disponível)

### 🎯 Impacto UX
[Por que essa mudança importa? 1-2 frases em linguagem de negócio]

### 🔍 Gaps Visuais Identificados
[Comparação detalhada: Shotsy vs Mounjaro]

### 🛠️ Mudanças Necessárias
[Code snippets com antes/depois]

### ⚙️ Especificações Técnicas
- Arquivo, linhas, esforço, risco, dependências

### ✅ Critérios de Aceitação
- [ ] Lista testável de requisitos
```

---

## 📊 Status do Projeto

### FASE 0 - PILOTO
**Status:** ✅ Completo (Aguardando Aprovação)  
**Tempo investido:** ~3h de auditoria + documentação  
**Componentes:** 2/2 auditados

### SEMANA 1 - P0 Onboarding (Parte 1)
**Status:** ⏸️ Pendente (Aguardando aprovação do piloto)  
**Componentes:** 0/22 auditados

### SEMANA 2 - P0 Onboarding (Parte 2) + Gráficos
**Status:** ⏸️ Pendente  
**Componentes:** 0/4 gráficos auditados

### SEMANA 3 - P1 + P2
**Status:** ⏸️ Condicional (Depende de checkpoint P0)

---

## 🚀 Próximos Passos

### Opção 1: Implementar Piloto Agora
1. Revisar `FASE-0-PILOTO-AUDIT.md`
2. Aprovar metodologia
3. Decidir opção A ou B para gráfico
4. Criar branch `feature/visual-audit-pilot`
5. Implementar mudanças (~2.5h)
6. Testar e validar
7. Continuar documentação P0 completo

### Opção 2: Continuar Documentação P0
1. Revisar `FASE-0-PILOTO-AUDIT.md`
2. Aprovar metodologia
3. Mapear todos os 37 screenshots
4. Auditar 20 telas restantes de onboarding
5. Auditar 3 gráficos restantes
6. Consolidar documentos finais
7. Implementar tudo de uma vez

---

## 📝 Como Usar Esta Documentação

### Para Desenvolvedores:

1. **Leia o documento de auditoria** do componente que vai implementar
2. **Veja o screenshot de referência** para entender visualmente o gap
3. **Siga as mudanças necessárias** (code snippets prontos)
4. **Teste conforme critérios de aceitação** listados
5. **Marque checklist** conforme completa cada item

### Para Gestores/Product Owners:

1. **Leia a seção "Impacto UX"** para entender o "por quê"
2. **Veja os screenshots comparativos** para entender o "o quê"
3. **Revise a estimativa de esforço** para priorizar mudanças
4. **Aprove ou ajuste** decisões estratégicas (ex: manter vs migrar biblioteca)

### Para Designers:

1. **Use screenshots do Shotsy** como referência visual
2. **Valide se especificações** (px, colors, weights) estão corretas
3. **Sugira ajustes** se algo não estiver fiel ao design original
4. **Crie mockups de "como ficará"** se necessário

---

## 🎨 Design System Reference

### Cores Principais (Shotsy)
- Primary: `#0891B2` (cyan/teal)
- Background (Light): `#FFFFFF`
- Background (Dark): `#1F1F1F`
- Text (Light): `#0F0F1E`
- Text (Dark): `#FFFFFF`
- Border (Light): `#E5E7EB`
- Border (Dark): `#374151`

### Espaçamentos Padrão
- XS: 4px
- S: 8px
- M: 12px
- L: 16px
- XL: 20px
- XXL: 24px
- XXXL: 32px

### Border Radius
- Small: 8px
- Medium: 12px
- Large: 16px
- XLarge: 20px
- Pill: 999px

### Tipografia
- Display: 32px / 700
- H1: 26px / 700
- H2: 22px / 700
- H3: 18px / 600
- Body: 16px / 400
- Body Small: 14px / 400
- Caption: 13px / 400
- Caption Small: 11px / 500

---

## 📞 Contato & Suporte

**Dúvidas sobre a auditoria?**  
Consulte o documento `FASE-0-PILOTO-AUDIT.md` para metodologia completa.

**Precisa de clarificação em alguma spec?**  
Revise os screenshots de referência em `/FIGMA-SCREENSHOTS/`.

**Encontrou erro ou inconsistência?**  
Documente o gap e crie issue para revisão.

---

## 📈 Métricas de Progresso

### Componentes Auditados: 2 / ~50
- ✅ Initial Dose Screen (P0)
- ✅ Estimated Levels Chart (P0)
- ⏸️ 20 telas de onboarding restantes
- ⏸️ 3 gráficos restantes (Weight, BMI, Weekly Average)
- ⏸️ Dashboard (alto nível)
- ⏸️ Results (alto nível)
- ⏸️ Telas secundárias (alto nível)

### Tempo Investido: ~3h / ~90h estimado total

### Taxa de Conclusão: 4% (Piloto completo)

---

**Última atualização:** 5 de novembro de 2025  
**Versão:** 1.0 (Piloto)  
**Status:** 🟡 Aguardando Aprovação

