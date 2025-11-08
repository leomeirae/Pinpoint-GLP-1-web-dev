/**
 * Sistema de Cores por Dosagem
 * Baseado no Shotsy - cada dosagem tem uma cor específica
 *
 * Este sistema permite visualização consistente de dosagens em:
 * - Gráficos de peso
 * - Histórico de injeções
 * - Legendas e indicadores
 * - Progress rings específicos
 */

// ============================================
// CORES POR DOSAGEM (mg)
// ============================================

/**
 * Mapa de cores para dosagens de GLP-1
 * Cada dosagem recebe uma cor única para fácil identificação visual
 */
export const DOSAGE_COLORS: Record<number, string> = {
  // Dosagens iniciais (tons frios - cinza, azul claro)
  0.25: '#D1D5DB', // Cinza claro (dose inicial muito baixa)
  0.5: '#9CA3AF', // Cinza médio
  1: '#6B7280', // Cinza escuro
  1.5: '#94A3B8', // Slate

  // Dosagens baixas (tons roxo/violeta)
  2.5: '#A855F7', // Roxo (primeira dose padrão Ozempic/Mounjaro)
  5: '#8B5CF6', // Violeta

  // Dosagens médias (tons azul/ciano)
  7.5: '#06B6D4', // Ciano
  10: '#3B82F6', // Azul royal

  // Dosagens altas (tons rosa/laranja)
  12.5: '#EC4899', // Rosa
  15: '#F97316', // Laranja

  // Dosagens muito altas (Wegovy, Mounjaro altas)
  17.5: '#EF4444', // Vermelho
  20: '#DC2626', // Vermelho escuro
  22.5: '#991B1B', // Vermelho muito escuro

  // Dosagens especiais Mounjaro
  25: '#10B981', // Verde (dose máxima comum)
  30: '#059669', // Verde escuro
} as const;

// ============================================
// CORES ALTERNATIVAS (para gráficos com múltiplas linhas)
// ============================================

/**
 * Paleta alternativa para quando precisamos de mais variação
 * Útil em gráficos com muitas dosagens simultâneas
 */
export const DOSAGE_COLORS_ALT: Record<number, string> = {
  0.25: '#F3F4F6',
  0.5: '#E5E7EB',
  1: '#D1D5DB',
  1.5: '#B0B8C4',
  2.5: '#C084FC', // Roxo claro
  5: '#A78BFA', // Violeta claro
  7.5: '#22D3EE', // Ciano claro
  10: '#60A5FA', // Azul claro
  12.5: '#F472B6', // Rosa claro
  15: '#FB923C', // Laranja claro
  17.5: '#F87171', // Vermelho claro
  20: '#EF4444',
  22.5: '#DC2626',
  25: '#34D399', // Verde claro
  30: '#10B981',
} as const;

// ============================================
// OPACIDADES PARA GRADIENTES
// ============================================

/**
 * Opacidades para criar efeitos de gradiente em gráficos
 */
export const DOSAGE_OPACITY = {
  solid: 1.0,
  medium: 0.7,
  light: 0.4,
  subtle: 0.2,
  ghost: 0.1,
} as const;

// ============================================
// HELPERS
// ============================================

/**
 * Obtém a cor de uma dosagem específica
 * @param dosage - Dosagem em mg (ex: 2.5, 5, 7.5)
 * @param useAlt - Se true, usa paleta alternativa
 * @returns Código hexadecimal da cor
 */
export function getDosageColor(dosage: number, useAlt = false): string {
  const colorMap = useAlt ? DOSAGE_COLORS_ALT : DOSAGE_COLORS;
  return colorMap[dosage] || '#6B7280'; // Retorna cinza como fallback
}

/**
 * Obtém a cor com opacidade aplicada
 * @param dosage - Dosagem em mg
 * @param opacity - Nível de opacidade (0-1 ou chave de DOSAGE_OPACITY)
 * @param useAlt - Se true, usa paleta alternativa
 * @returns Cor em formato rgba
 */
export function getDosageColorWithOpacity(
  dosage: number,
  opacity: number | keyof typeof DOSAGE_OPACITY = 1,
  useAlt = false
): string {
  const color = getDosageColor(dosage, useAlt);
  const opacityValue = typeof opacity === 'number' ? opacity : DOSAGE_OPACITY[opacity];

  // Converte hex para rgba
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);

  return `rgba(${r}, ${g}, ${b}, ${opacityValue})`;
}

/**
 * Retorna um array de cores para um conjunto de dosagens
 * @param dosages - Array de dosagens
 * @param useAlt - Se true, usa paleta alternativa
 * @returns Array de cores
 */
export function getDosageColorsArray(dosages: number[], useAlt = false): string[] {
  return dosages.map((d) => getDosageColor(d, useAlt));
}

/**
 * Retorna o gradiente de cores para o progress ring
 * Baseado no Shotsy (laranja → amarelo → verde → azul → ciano)
 * @returns Array de cores para gradiente
 */
export function getProgressRingGradient(): string[] {
  return [
    '#F97316', // Laranja
    '#FBBF24', // Amarelo
    '#10B981', // Verde
    '#3B82F6', // Azul
    '#06B6D4', // Ciano
  ];
}

/**
 * Retorna cores para o gráfico de área (Estimated Levels)
 * Gradiente azul como no Shotsy
 * @returns Objeto com start e end colors
 */
export function getEstimatedLevelsGradient(): { start: string; end: string } {
  return {
    start: '#3B82F6', // Azul
    end: '#06B6D4', // Ciano
  };
}

// ============================================
// MAPA DE NOMES DE DOSAGENS
// ============================================

/**
 * Descrições amigáveis para cada dosagem
 */
export const DOSAGE_LABELS: Record<number, string> = {
  0.25: '0.25mg (Inicial)',
  0.5: '0.5mg',
  1: '1mg',
  1.5: '1.5mg',
  2.5: '2.5mg (Padrão)',
  5: '5mg',
  7.5: '7.5mg',
  10: '10mg',
  12.5: '12.5mg',
  15: '15mg',
  17.5: '17.5mg',
  20: '20mg',
  22.5: '22.5mg',
  25: '25mg (Máxima)',
  30: '30mg (Máxima+)',
} as const;

/**
 * Obtém o label amigável de uma dosagem
 * @param dosage - Dosagem em mg
 * @returns Label formatado
 */
export function getDosageLabel(dosage: number): string {
  return DOSAGE_LABELS[dosage] || `${dosage}mg`;
}

// ============================================
// VALIDAÇÃO DE DOSAGENS
// ============================================

/**
 * Dosagens válidas/conhecidas
 */
export const VALID_DOSAGES = Object.keys(DOSAGE_COLORS).map(Number);

/**
 * Verifica se uma dosagem é válida
 * @param dosage - Dosagem a validar
 * @returns true se a dosagem é conhecida
 */
export function isValidDosage(dosage: number): boolean {
  return VALID_DOSAGES.indexOf(dosage) !== -1;
}

/**
 * Encontra a dosagem válida mais próxima
 * @param dosage - Dosagem aproximada
 * @returns Dosagem válida mais próxima
 */
export function getNearestValidDosage(dosage: number): number {
  return VALID_DOSAGES.reduce((prev, curr) =>
    Math.abs(curr - dosage) < Math.abs(prev - dosage) ? curr : prev
  );
}

// ============================================
// EXPORTAÇÃO DEFAULT
// ============================================

export default {
  DOSAGE_COLORS,
  DOSAGE_COLORS_ALT,
  DOSAGE_OPACITY,
  DOSAGE_LABELS,
  VALID_DOSAGES,
  getDosageColor,
  getDosageColorWithOpacity,
  getDosageColorsArray,
  getProgressRingGradient,
  getEstimatedLevelsGradient,
  getDosageLabel,
  isValidDosage,
  getNearestValidDosage,
};
