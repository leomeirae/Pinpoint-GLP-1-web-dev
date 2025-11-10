/**
 * Remote Logger
 *
 * Sistema de logging persistente para debugging quando não há acesso ao console.
 * Salva logs no AsyncStorage e permite visualização posterior.
 *
 * @example
 * ```typescript
 * import { logError, getErrorLogs } from '@/lib/remote-logger';
 *
 * try {
 *   await riskyOperation();
 * } catch (error) {
 *   await logError('MyContext', error, { userId: 123 });
 * }
 *
 * const logs = await getErrorLogs();
 * console.log(logs);
 * ```
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const LOGS_KEY = '@pinpoint:error_logs';
const MAX_LOGS = 100; // Manter últimos 100 logs

export interface ErrorLog {
  timestamp: string;
  context: string;
  error: {
    message: string;
    stack?: string;
    code?: string;
    details?: any;
    hint?: string;
  };
  metadata?: any;
}

/**
 * Registra um erro de forma persistente
 *
 * @param context - Contexto onde o erro ocorreu (ex: 'useOnboarding.saveData')
 * @param error - Objeto de erro ou string
 * @param metadata - Dados adicionais úteis para debug
 */
export async function logError(
  context: string,
  error: any,
  metadata?: any
): Promise<void> {
  const logEntry: ErrorLog = {
    timestamp: new Date().toISOString(),
    context,
    error: {
      message: error?.message || String(error),
      stack: error?.stack,
      code: error?.code,
      details: error?.details,
      hint: error?.hint,
    },
    metadata,
  };

  try {
    const existingLogs = await AsyncStorage.getItem(LOGS_KEY);
    const logs: ErrorLog[] = existingLogs ? JSON.parse(existingLogs) : [];
    logs.push(logEntry);

    // Manter apenas últimos MAX_LOGS logs para não encher storage
    const trimmedLogs = logs.slice(-MAX_LOGS);
    await AsyncStorage.setItem(LOGS_KEY, JSON.stringify(trimmedLogs, null, 2));

    // TAMBÉM logar no console para desenvolvimento
    if (__DEV__) {
      console.error('🔴 REMOTE LOG SAVED:', {
        context,
        error: logEntry.error,
        metadata,
      });
    }
  } catch (e) {
    // Fallback: se não conseguir salvar, pelo menos logar no console
    console.error('❌ Failed to save remote log:', e);
    console.error('Original error:', logEntry);
  }
}

/**
 * Recupera todos os logs de erro salvos
 *
 * @returns Array de logs de erro
 */
export async function getErrorLogs(): Promise<ErrorLog[]> {
  try {
    const logs = await AsyncStorage.getItem(LOGS_KEY);
    return logs ? JSON.parse(logs) : [];
  } catch (e) {
    console.error('Failed to retrieve error logs:', e);
    return [];
  }
}

/**
 * Limpa todos os logs de erro salvos
 */
export async function clearErrorLogs(): Promise<void> {
  try {
    await AsyncStorage.removeItem(LOGS_KEY);
    console.log('✅ Error logs cleared');
  } catch (e) {
    console.error('Failed to clear error logs:', e);
  }
}

/**
 * Exporta logs como string formatada (útil para copiar/colar)
 *
 * @returns String JSON formatada com todos os logs
 */
export async function exportLogsAsString(): Promise<string> {
  try {
    const logs = await getErrorLogs();
    return JSON.stringify(logs, null, 2);
  } catch (e) {
    return `Error exporting logs: ${e}`;
  }
}

/**
 * Conta quantos logs existem
 *
 * @returns Número de logs salvos
 */
export async function getLogsCount(): Promise<number> {
  try {
    const logs = await getErrorLogs();
    return logs.length;
  } catch (e) {
    return 0;
  }
}
