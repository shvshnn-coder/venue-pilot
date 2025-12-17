import { createContext, useContext, useState, useEffect, useLayoutEffect, ReactNode } from "react";

export type Theme = 'sci-fi' | 'basic-white' | 'wild-flowers';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  themes: { id: Theme; name: string; description: string }[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'aura-theme';

const themes: { id: Theme; name: string; description: string }[] = [
  { id: 'sci-fi', name: 'Sci-Fi', description: 'Futuristic dark with teal & gold' },
  { id: 'basic-white', name: 'Basic White', description: 'Clean, minimal light theme' },
  { id: 'wild-flowers', name: 'Wild Flowers', description: 'Nature-inspired soft colors' },
];

function getStoredTheme(): Theme {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    if (stored && themes.some(t => t.id === stored)) {
      return stored;
    }
  }
  return 'sci-fi';
}

if (typeof window !== 'undefined') {
  document.documentElement.setAttribute('data-theme', getStoredTheme());
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getStoredTheme);

  useLayoutEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
