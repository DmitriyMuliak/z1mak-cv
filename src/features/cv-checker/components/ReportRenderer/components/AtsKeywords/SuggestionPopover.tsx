'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';

interface SuggestionPopoverProps {
  keyword: string;
  suggestion: string;
}

export const SuggestionPopover: React.FC<SuggestionPopoverProps> = ({ keyword, suggestion }) => {
  const t = useTranslations('pages.cvReport.atsKeywords');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-xs font-medium text-primary underline-offset-2 hover:underline outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 rounded-sm"
      >
        {t('addButton')}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1.5 w-64 rounded-lg border border-border bg-card p-3 shadow-lg text-xs whitespace-normal text-left">
          <div className="flex justify-between">
            <div className="font-semibold mb-1.5">💡 {t('howToAdd', { keyword })}</div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="ml-2 mb-2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
          <p className="text-muted-foreground leading-relaxed">{suggestion}</p>
        </div>
      )}
    </div>
  );
};
