import React from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark' | 'system';

const THEME_KEY = '@mounjaro_tracker:theme_mode';

class ThemeManager {
  private listeners: ((mode: ThemeMode) => void)[] = [];
  private mode: ThemeMode = 'system';
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;

    try {
      const saved = await AsyncStorage.getItem(THEME_KEY);
      if (saved && (saved === 'light' || saved === 'dark' || saved === 'system')) {
        this.mode = saved as ThemeMode;
      } else {
        this.mode = 'system';
        await AsyncStorage.setItem(THEME_KEY, 'system');
      }
    } catch (error) {
      console.error('Error loading theme:', error);
      this.mode = 'system';
    }

    this.isInitialized = true;
    this.notifyListeners();
  }

  async getMode(): Promise<ThemeMode> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return this.mode;
  }

  getEffectiveMode(): 'light' | 'dark' {
    if (this.mode === 'system') {
      return Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';
    }
    return this.mode;
  }

  async setMode(mode: ThemeMode) {
    this.mode = mode;
    await AsyncStorage.setItem(THEME_KEY, mode);
    this.notifyListeners();
  }

  subscribe(listener: (mode: ThemeMode) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.mode));
  }
}

export const themeManager = new ThemeManager();

// Hook para usar no React
export function useTheme() {
  const [mode, setModeState] = React.useState<ThemeMode>('system');
  const [effectiveMode, setEffectiveMode] = React.useState<'light' | 'dark'>(
    themeManager.getEffectiveMode()
  );

  React.useEffect(() => {
    themeManager.initialize().then(async () => {
      const currentMode = await themeManager.getMode();
      setModeState(currentMode);
      setEffectiveMode(themeManager.getEffectiveMode());
    });

    const unsubscribe = themeManager.subscribe((newMode) => {
      setModeState(newMode);
      setEffectiveMode(themeManager.getEffectiveMode());
    });

    // Listen to system theme changes
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      if (themeManager.mode === 'system') {
        setEffectiveMode(colorScheme === 'dark' ? 'dark' : 'light');
      }
    });

    return () => {
      unsubscribe();
      subscription.remove();
    };
  }, []);

  const setMode = React.useCallback(async (newMode: ThemeMode) => {
    await themeManager.setMode(newMode);
  }, []);

  return {
    mode,
    effectiveMode,
    setMode,
  };
}

