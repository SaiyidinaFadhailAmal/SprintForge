import { useCallback, useEffect, useState } from 'react';
import type { ThemeMode } from '../types';
import { loadThemeMode, saveThemeMode } from '../utils/storage';

export function useTheme() {
  const [theme, setTheme] = useState<ThemeMode>(() => loadThemeMode());

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    saveThemeMode(theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  return {
    theme,
    setTheme,
    toggleTheme,
  };
}
