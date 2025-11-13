// components/coachmarks/CoachmarkSystem.tsx
// Sistema de coachmarks para guiar usuários em features principais

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createLogger } from '@/lib/logger';

const logger = createLogger('CoachmarkSystem');

const STORAGE_KEY = '@mounjaro:coachmarks_seen';

export interface CoachmarkElement {
  id: string;
  title: string;
  description: string;
  order: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CoachmarkContextType {
  // Estado
  seenCoachmarks: string[];
  currentCoachmark: CoachmarkElement | null;
  isShowingTour: boolean;
  registeredElements: Map<string, Omit<CoachmarkElement, 'x' | 'y' | 'width' | 'height'>>;

  // Funções de controle
  startTour: () => void;
  skipTour: () => void;
  nextCoachmark: () => void;
  prevCoachmark: () => void;
  completeCoachmark: (id: string) => void;

  // Registro de elementos
  registerElement: (
    id: string,
    title: string,
    description: string,
    order: number
  ) => void;
  updateElementPosition: (id: string, x: number, y: number, width: number, height: number) => void;

  // Verificação
  shouldShowCoachmark: (id: string) => boolean;
}

const CoachmarkContext = createContext<CoachmarkContextType | undefined>(undefined);

interface CoachmarkProviderProps {
  children: ReactNode;
}

export function CoachmarkProvider({ children }: CoachmarkProviderProps) {
  const [seenCoachmarks, setSeenCoachmarks] = useState<string[]>([]);
  const [registeredElements, setRegisteredElements] = useState<
    Map<string, Omit<CoachmarkElement, 'x' | 'y' | 'width' | 'height'>>
  >(new Map());
  const [elementPositions, setElementPositions] = useState<
    Map<string, { x: number; y: number; width: number; height: number }>
  >(new Map());
  const [currentCoachmarkIndex, setCurrentCoachmarkIndex] = useState<number>(-1);
  const [isShowingTour, setIsShowingTour] = useState(false);

  // Carregar coachmarks vistos do AsyncStorage
  useEffect(() => {
    loadSeenCoachmarks();
  }, []);

  const loadSeenCoachmarks = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const seen = JSON.parse(stored);
        setSeenCoachmarks(seen);
        logger.info('Loaded seen coachmarks', { count: seen.length });
      }
    } catch (error) {
      logger.error('Failed to load seen coachmarks', error as Error);
    }
  };

  const saveSeenCoachmark = async (id: string) => {
    try {
      const updated = [...seenCoachmarks, id];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setSeenCoachmarks(updated);
      logger.info('Saved coachmark as seen', { id });
    } catch (error) {
      logger.error('Failed to save coachmark', error as Error, { id });
    }
  };

  const registerElement = useCallback(
    (id: string, title: string, description: string, order: number) => {
      setRegisteredElements((prev) => {
        const updated = new Map(prev);
        updated.set(id, { id, title, description, order });
        return updated;
      });
    },
    []
  );

  const updateElementPosition = useCallback(
    (id: string, x: number, y: number, width: number, height: number) => {
      setElementPositions((prev) => {
        const updated = new Map(prev);
        updated.set(id, { x, y, width, height });
        return updated;
      });
    },
    []
  );

  const shouldShowCoachmark = useCallback(
    (id: string) => {
      return !seenCoachmarks.includes(id);
    },
    [seenCoachmarks]
  );

  // Obter lista ordenada de coachmarks disponíveis para o tour
  const getAvailableCoachmarks = useCallback((): CoachmarkElement[] => {
    const elements: CoachmarkElement[] = [];

    registeredElements.forEach((element) => {
      const position = elementPositions.get(element.id);
      if (position && !seenCoachmarks.includes(element.id)) {
        elements.push({
          ...element,
          ...position,
        });
      }
    });

    // Ordenar por order
    return elements.sort((a, b) => a.order - b.order);
  }, [registeredElements, elementPositions, seenCoachmarks]);

  const currentCoachmark = currentCoachmarkIndex >= 0 ? getAvailableCoachmarks()[currentCoachmarkIndex] : null;

  const startTour = useCallback(() => {
    const available = getAvailableCoachmarks();
    if (available.length > 0) {
      setCurrentCoachmarkIndex(0);
      setIsShowingTour(true);
      logger.info('Starting coachmark tour', { totalCoachmarks: available.length });
    } else {
      logger.info('No coachmarks available for tour');
    }
  }, [getAvailableCoachmarks]);

  const skipTour = useCallback(async () => {
    const available = getAvailableCoachmarks();
    // Marcar todos os coachmarks como vistos
    for (const coachmark of available) {
      await saveSeenCoachmark(coachmark.id);
    }
    setIsShowingTour(false);
    setCurrentCoachmarkIndex(-1);
    logger.info('Skipped coachmark tour');
  }, [getAvailableCoachmarks]);

  const nextCoachmark = useCallback(() => {
    const available = getAvailableCoachmarks();
    if (currentCoachmarkIndex < available.length - 1) {
      setCurrentCoachmarkIndex((prev) => prev + 1);
    } else {
      // Tour completo
      setIsShowingTour(false);
      setCurrentCoachmarkIndex(-1);
      logger.info('Completed coachmark tour');
    }
  }, [currentCoachmarkIndex, getAvailableCoachmarks]);

  const prevCoachmark = useCallback(() => {
    if (currentCoachmarkIndex > 0) {
      setCurrentCoachmarkIndex((prev) => prev - 1);
    }
  }, [currentCoachmarkIndex]);

  const completeCoachmark = useCallback(
    async (id: string) => {
      await saveSeenCoachmark(id);
      nextCoachmark();
    },
    [nextCoachmark]
  );

  const value: CoachmarkContextType = {
    seenCoachmarks,
    currentCoachmark,
    isShowingTour,
    registeredElements,
    startTour,
    skipTour,
    nextCoachmark,
    prevCoachmark,
    completeCoachmark,
    registerElement,
    updateElementPosition,
    shouldShowCoachmark,
  };

  return <CoachmarkContext.Provider value={value}>{children}</CoachmarkContext.Provider>;
}

export function useCoachmarks() {
  const context = useContext(CoachmarkContext);
  if (!context) {
    throw new Error('useCoachmarks must be used within CoachmarkProvider');
  }
  return context;
}

