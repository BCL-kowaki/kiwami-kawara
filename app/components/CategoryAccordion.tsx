"use client";

import { useState, ReactNode } from "react";

interface CategoryAccordionProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  badge?: string; // 入力状況バッジ（例：「入力済（2件）」/「未入力」）
}

export default function CategoryAccordion({
  title,
  children,
  defaultOpen = false,
  badge,
}: CategoryAccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="rounded-[2px] mb-2 hover:shadow-lg transition-all duration-300 overflow-hidden" style={{ background: '#1a1a1a', border: '1px solid #3a3a3a' }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-5 flex justify-between items-center transition-all duration-300 rounded-t-[2px]"
        style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #252525 100%)' }}
      >
        <div className="flex items-center gap-3">
          <h3 className="text-base font-bold text-white">{title}</h3>
          {badge && (
            <span className={`px-2 py-0.5 text-xs font-bold rounded-full`} style={
              badge.includes("入力済") 
                ? { background: 'linear-gradient(135deg, #2a2a1a, #3a3a2a)', color: '#FFD700', border: '1px solid #B8860B' }
                : { background: '#2a2a2a', color: '#888888', border: '1px solid #4a4a4a' }
            }>
              {badge}
            </span>
          )}
        </div>
        <div className={`transform transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#ffffff' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      {isOpen && (
        <div className="p-4 rounded-b-[2px] animate-fade-in" style={{ background: '#0f0f0f', borderTop: '1px solid #3a3a3a' }}>
          {children}
        </div>
      )}
    </div>
  );
}
