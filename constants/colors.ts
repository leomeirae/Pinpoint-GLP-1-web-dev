import React from 'react';
import { useTheme } from '@/lib/theme';

const DARK_COLORS = {
  // Primary
  primary: '#6366f1',
  primaryDark: '#4f46e5',
  primaryLight: '#818cf8',
  
  // Background
  background: '#0f0f1e',
  backgroundLight: '#1a1a2e',
  card: '#16213e',
  
  // Text
  text: '#ffffff',
  textSecondary: '#94a3b8',
  textMuted: '#64748b',
  
  // Status
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  
  // Border
  border: '#1e293b',
  borderLight: '#334155',
};

const LIGHT_COLORS = {
  // Primary
  primary: '#6366f1',
  primaryDark: '#4f46e5',
  primaryLight: '#818cf8',
  
  // Background
  background: '#ffffff',
  backgroundLight: '#f8f9fa',
  card: '#ffffff',
  
  // Text
  text: '#0f0f1e',
  textSecondary: '#475569',
  textMuted: '#94a3b8',
  
  // Status
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  
  // Border
  border: '#e2e8f0',
  borderLight: '#cbd5e1',
};

export function useColors() {
  const { effectiveMode } = useTheme();
  return effectiveMode === 'dark' ? DARK_COLORS : LIGHT_COLORS;
}

// Default export for backwards compatibility
export const COLORS = DARK_COLORS;

