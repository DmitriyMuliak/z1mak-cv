import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

type Props = {
  isExpanded: boolean;
  onToggle: () => void;
  showAllLabel: string;
  showLessLabel: string;
};

export const ExpandToggle: React.FC<Props> = ({
  isExpanded,
  onToggle,
  showAllLabel,
  showLessLabel,
}) => (
  <button
    onClick={onToggle}
    className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
    aria-expanded={isExpanded}
  >
    {isExpanded ? (
      <>
        {showLessLabel} <ChevronUp className="w-3.5 h-3.5" />
      </>
    ) : (
      <>
        {showAllLabel} <ChevronDown className="w-3.5 h-3.5" />
      </>
    )}
  </button>
);
