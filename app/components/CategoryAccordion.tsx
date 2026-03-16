"use client";

import { useState, ReactNode } from "react";
import { useTheme } from "./ThemeContext";

interface CategoryAccordionProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  badge?: string; // 入力状況バッジ（例：「入力済（2件）」/「未入力」）
}

const darkStyles = {
  container: { background: '#1a1a1a', border: '1px solid #3a3a3a' },
  header: { background: 'linear-gradient(135deg, #1a1a1a 0%, #252525 100%)' },
  titleColor: 'text-white',
  badgeFilled: { background: 'linear-gradient(135deg, #1a1a3a, #2a2a4a)', color: '#2db8f9', border: '1px solid #7b5cfa' },
  badgeEmpty: { background: '#2a2a2a', color: '#888888', border: '1px solid #4a4a4a' },
  arrowColor: { color: '#ffffff' },
  content: { background: '#0f0f0f', borderTop: '1px solid #3a3a3a' },
};

const lightStyles = {
  container: { background: '#ffffff', border: '1px solid #e0e0e0' },
  header: { background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)' },
  titleColor: 'text-gray-800',
  badgeFilled: { background: 'linear-gradient(135deg, #e6f9fb, #dbeafe)', color: '#2483f8', border: '1px solid #7dd3fc' },
  badgeEmpty: { background: '#f3f4f6', color: '#9ca3af', border: '1px solid #d1d5db' },
  arrowColor: { color: '#374151' },
  content: { background: '#fafafa', borderTop: '1px solid #e0e0e0' },
};

export default function CategoryAccordion({
  title,
  children,
  defaultOpen = false,
  badge,
}: CategoryAccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const theme = useTheme();
  const s = theme === "light" ? lightStyles : darkStyles;

  return (
    <div className="rounded-[2px] mb-2 hover:shadow-lg transition-all duration-300 overflow-hidden" style={s.container}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-5 flex justify-between items-center transition-all duration-300 rounded-t-[2px]"
        style={s.header}
      >
        <div className="flex items-center gap-3">
          <h3 className={`text-base font-bold text-left ${s.titleColor}`}>{title}</h3>
          {badge && (
            <span className={`px-2 py-0.5 text-xs font-bold rounded-full`} style={
              badge.includes("入力済") ? s.badgeFilled : s.badgeEmpty
            }>
              {badge}
            </span>
          )}
        </div>
        <div className={`transform transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={s.arrowColor}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      {isOpen && (
        <div className="p-4 rounded-b-[2px] animate-fade-in" style={s.content}>
          {children}
        </div>
      )}
    </div>
  );
}
