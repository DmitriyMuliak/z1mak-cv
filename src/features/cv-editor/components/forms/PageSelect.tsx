'use client';

import { useState } from 'react';
import { Settings2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useTemplateSettingsStore } from '../../store/templateSettingsStore';
import type { SectionKey } from '../../store/templateSettingsStore';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

// ---------------------------------------------------------------------------
// Options modal
// ---------------------------------------------------------------------------

function SectionOptionsModal({
  open,
  onClose,
  pageIndex,
  sectionKey,
}: {
  open: boolean;
  onClose: () => void;
  pageIndex: number;
  sectionKey: SectionKey;
}) {
  const t = useTranslations('cvEditor');
  const settings = useTemplateSettingsStore((s) => s.sectionSettings[pageIndex]?.[sectionKey]);
  const setSectionSetting = useTemplateSettingsStore((s) => s.setSectionSetting);
  const hideTitle = settings?.hideTitle ?? false;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {t('sectionOptions.title')} — {t('sectionOptions.page')} {pageIndex + 1}
          </DialogTitle>
          <DialogDescription className="sr-only">{t('sectionOptions.title')}</DialogDescription>
        </DialogHeader>
        <div className="py-2">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="hide-section-title"
              checked={hideTitle}
              onChange={(e) =>
                setSectionSetting(pageIndex, sectionKey, { hideTitle: e.target.checked })
              }
              className="h-4 w-4 rounded border-border accent-primary cursor-pointer"
            />
            <Label htmlFor="hide-section-title" className="cursor-pointer font-normal">
              {t('sectionOptions.hideTitle')}
            </Label>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// PageSelect
// ---------------------------------------------------------------------------

interface PageSelectProps {
  selectedPage: number;
  onSelect: (page: number) => void;
  /** When provided, an Options button appears that opens the section settings modal. */
  sectionKey?: SectionKey;
}

export function PageSelect({ selectedPage, onSelect, sectionKey }: PageSelectProps) {
  const t = useTranslations('cvEditor');
  const pageCount = useTemplateSettingsStore((s) => s.pageCount);
  const [optionsOpen, setOptionsOpen] = useState(false);

  const showPageSelect = pageCount > 1;
  const showOptions = !!sectionKey;

  if (!showPageSelect && !showOptions) return null;

  return (
    <>
      <div className="flex items-center gap-2 mb-3">
        {showPageSelect && (
          <>
            <span className="text-xs text-muted-foreground">{t('sectionOptions.page')}:</span>
            <Select value={String(selectedPage)} onValueChange={(v) => onSelect(Number(v))}>
              <SelectTrigger className="w-full max-w-15">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {Array.from({ length: pageCount }, (_, i) => (
                    <SelectItem key={i} value={String(i)}>
                      {i + 1}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </>
        )}

        {showOptions && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setOptionsOpen(true)}
            className="ml-auto gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <Settings2 size={13} />
            {t('sectionOptions.options')}
          </Button>
        )}
      </div>

      {showOptions && sectionKey && (
        <SectionOptionsModal
          open={optionsOpen}
          onClose={() => setOptionsOpen(false)}
          pageIndex={selectedPage}
          sectionKey={sectionKey}
        />
      )}
    </>
  );
}
