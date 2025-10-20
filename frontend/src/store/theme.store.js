import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Theme Store
 * SBCC Brand Colors
 */

export const SBCC_COLORS = {
  // Fill Colors (Backgrounds, Containers)
  fill: {
    white: '#FFFFFF',
    cream: '#FAFBFD',
    lightOrange: '#FFF5E1',
    orange: '#F6C67E',
    darkOrange: '#FDB54A',
  },
  
  // Font/Text Colors
  text: {
    white: '#FFFFFF',
    gray: '#A0A0A0',
    dark: '#383838',
    lightOrange: '#F6C67E',
    orange: '#FDB54A',
  },
  
  // Semantic Colors
  primary: '#FDB54A',      // Main brand orange
  secondary: '#F6C67E',    // Light orange
  accent: '#383838',       // Dark text
  
  // Status Colors
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
};

export const useThemeStore = create(
  persist(
    (set) => ({
      darkMode: false,
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      setDarkMode: (value) => set({ darkMode: value }),
    }),
    {
      name: 'sbcc-theme',
    }
  )
);