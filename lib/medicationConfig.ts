// lib/medicationConfig.ts
// Sistema de Remote Config para medicamentos (Supabase + fallback local)

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import { createLogger } from '@/lib/logger';
import {
  MedicationConfig,
  getEnabledMedications,
} from '@/constants/medications';

const logger = createLogger('MedicationConfig');

const CACHE_KEY = '@mounjaro:medication_configs';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 horas

interface CachedConfig {
  configs: MedicationConfig[];
  timestamp: number;
}

/**
 * Busca configurações de medicamentos do Supabase
 * Retorna null se houver erro ou se não houver internet
 */
async function fetchFromSupabase(): Promise<MedicationConfig[] | null> {
  try {
    const { data, error } = await supabase
      .from('medication_configs')
      .select('*')
      .eq('enabled', true)
      .order('featured', { ascending: false })
      .order('name', { ascending: true });

    if (error) {
      logger.warn('Error fetching medication configs from Supabase', error);
      return null;
    }

    if (!data || data.length === 0) {
      logger.debug('No medication configs found in Supabase, using fallback');
      return null;
    }

    // Converter formato do Supabase para formato local
    const configs: MedicationConfig[] = data.map((row) => ({
      id: row.id,
      name: row.name,
      genericName: row.generic_name,
      availableDoses: row.available_doses || [],
      unit: row.unit || 'mg',
      frequency: row.frequency || 'weekly',
      featured: row.featured || false,
      enabled: row.enabled !== false,
    }));

    logger.info(`Fetched ${configs.length} medication configs from Supabase`);
    return configs;
  } catch (error) {
    logger.error('Exception fetching medication configs from Supabase', error as Error);
    return null;
  }
}

/**
 * Salva configurações no cache local
 */
async function saveToCache(configs: MedicationConfig[]): Promise<void> {
  try {
    const cached: CachedConfig = {
      configs,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cached));
  } catch (error) {
    logger.warn('Error saving medication configs to cache', error as Error);
  }
}

/**
 * Carrega configurações do cache local
 * Retorna null se cache expirado ou não existir
 */
async function loadFromCache(): Promise<MedicationConfig[] | null> {
  try {
    const cachedStr = await AsyncStorage.getItem(CACHE_KEY);
    if (!cachedStr) {
      return null;
    }

    const cached: CachedConfig = JSON.parse(cachedStr);
    const age = Date.now() - cached.timestamp;

    if (age > CACHE_TTL_MS) {
      logger.debug('Medication config cache expired');
      return null;
    }

    logger.debug(`Loaded ${cached.configs.length} medication configs from cache`);
    return cached.configs;
  } catch (error) {
    logger.warn('Error loading medication configs from cache', error as Error);
    return null;
  }
}

/**
 * Busca configurações de medicamentos
 * Prioridade: Cache → Supabase → Fallback local
 */
export async function getMedicationConfigs(): Promise<MedicationConfig[]> {
  // 1. Tentar carregar do cache
  const cached = await loadFromCache();
  if (cached) {
    // Tentar atualizar em background (não bloqueia)
    fetchFromSupabase()
      .then((remote) => {
        if (remote) {
          saveToCache(remote);
        }
      })
      .catch(() => {
        // Ignorar erros em background
      });
    return cached;
  }

  // 2. Tentar buscar do Supabase
  const remote = await fetchFromSupabase();
  if (remote) {
    await saveToCache(remote);
    return remote;
  }

  // 3. Fallback para configuração local
  logger.info('Using local fallback medication configs');
  const fallback = getEnabledMedications();
  await saveToCache(fallback);
  return fallback;
}

/**
 * Busca um medicamento específico por ID
 */
export async function getMedicationById(id: string): Promise<MedicationConfig | null> {
  const configs = await getMedicationConfigs();
  return configs.find((med) => med.id === id) || null;
}

/**
 * Busca medicamentos destacados (featured)
 */
export async function getFeaturedMedications(): Promise<MedicationConfig[]> {
  const configs = await getMedicationConfigs();
  return configs.filter((med) => med.featured);
}

/**
 * Força atualização do cache (busca do Supabase e atualiza cache)
 */
export async function refreshMedicationConfigs(): Promise<MedicationConfig[]> {
  const remote = await fetchFromSupabase();
  if (remote) {
    await saveToCache(remote);
    return remote;
  }

  // Se falhar, retornar fallback
  return getEnabledMedications();
}

