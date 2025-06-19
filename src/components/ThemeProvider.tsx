
"use client";

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

type Theme = "light" | "dark" | "system";

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

interface ThemeProviderState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(undefined);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "dockwatch-app-theme",
  ...props
}: ThemeProviderProps) {
  // Initialize state with defaultTheme to ensure server and initial client render match.
  const [theme, setThemeState] = useState<Theme>(defaultTheme);

  // Effect to load theme from localStorage on mount (client-side only)
  // This runs AFTER the initial server-render and client-render match.
  useEffect(() => {
    let initialTheme = defaultTheme;
    try {
      // Ensure this runs only on the client
      if (typeof window !== 'undefined') {
        const storedThemeValue = localStorage.getItem(storageKey) as Theme | null;
        if (storedThemeValue && ["light", "dark", "system"].includes(storedThemeValue)) {
          initialTheme = storedThemeValue;
        }
      }
    } catch (e) {
      console.error(`Error reading initial theme ('${storageKey}') from localStorage:`, e);
    }
    // Set the theme based on localStorage or default.
    // This ensures the state reflects the persisted preference or default.
    if (theme !== initialTheme) { // Only update if different to avoid unnecessary re-render
        setThemeState(initialTheme);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey, defaultTheme]); // Removed 'theme' from deps to prevent loop on state update


  // Effect to apply theme to DOM and listen for system changes
  useEffect(() => {
    // Ensure this only runs on client
    if (typeof window === 'undefined') return;

    const root = window.document.documentElement;
    
    const applyActualTheme = (currentThemeToApply: Theme) => {
      root.classList.remove("light", "dark");
      let resolvedTheme = currentThemeToApply;
      if (currentThemeToApply === "system") {
        resolvedTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      }
      root.classList.add(resolvedTheme);
    };

    applyActualTheme(theme); // Apply the current state theme

    let mediaQuery: MediaQueryList | undefined;
    let handleChange: (() => void) | undefined;

    if (theme === "system") {
      mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      handleChange = () => {
        applyActualTheme("system"); // Re-evaluate and apply system theme
      };
      mediaQuery.addEventListener("change", handleChange);
    }
    
    return () => {
      if (mediaQuery && handleChange) {
        mediaQuery.removeEventListener("change", handleChange);
      }
    };
  }, [theme]); // This effect runs when `theme` state changes.

  const handleSetTheme = (newTheme: Theme) => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(storageKey, newTheme);
      }
    } catch (e) {
      console.error(`Error setting theme ('${storageKey}') in localStorage:`, e);
    }
    setThemeState(newTheme);
  };

  const value = {
    theme, // Current theme state
    setTheme: handleSetTheme, // Function to change theme
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

