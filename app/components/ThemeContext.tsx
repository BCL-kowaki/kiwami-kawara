"use client";

import { createContext, useContext } from "react";

export type ThemeVariant = "dark" | "light";

const ThemeContext = createContext<ThemeVariant>("dark");

export function ThemeProvider({ theme, children }: { theme: ThemeVariant; children: React.ReactNode }) {
  return (
    <ThemeContext.Provider value={theme}>
      <div className={theme === "light" ? "theme-light" : ""}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

// 共通テーマスタイル
export function getThemeStyles(theme: ThemeVariant) {
  if (theme === "light") {
    return {
      cardBg: { background: '#ffffff', border: '1px solid #e0e0e0' },
      headerBg: { background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)' },
      contentBg: { background: '#fafafa', borderTop: '1px solid #e0e0e0' },
      inputBg: { background: '#f2f2f2', border: '1px solid #d1d5db', color: '#1a1a1a' },
      selectBg: { background: '#f2f2f2', border: '1px solid #d1d5db', color: '#1a1a1a' },
      optionBg: { background: '#f2f2f2', color: '#1a1a1a' },
      labelColor: { color: '#6b7280' },
      headingColor: { color: '#1a1a1a' },
      subTextColor: { color: '#6b7280' },
      deleteColor: { color: '#ef4444' },
      maxTextColor: { color: '#9ca3af' },
      addBtnBg: { background: 'linear-gradient(90deg, #1be7f5 0%, #2483f8 100%)', color: '#ffffff' },
    };
  }
  return {
    cardBg: { background: '#1a1a1a', border: '1px solid #3a3a3a' },
    headerBg: { background: 'linear-gradient(135deg, #1a1a1a 0%, #252525 100%)' },
    contentBg: { background: '#0f0f0f', borderTop: '1px solid #3a3a3a' },
    inputBg: { background: '#2a2a2a', border: '1px solid #4a4a4a', color: 'white' },
    selectBg: { background: '#2a2a2a', border: '1px solid #4a4a4a', color: 'white' },
    optionBg: { background: '#2a2a2a', color: 'white' },
    labelColor: { color: '#a0a0a0' },
    headingColor: { color: '#ffffff' },
    subTextColor: { color: '#666666' },
    deleteColor: { color: '#f87171' },
    maxTextColor: { color: '#666666' },
    addBtnBg: { background: 'linear-gradient(135deg, #2db8f9 0%, #aa30ff 100%)', color: '#ffffff' },
  };
}
