'use client';

import { useTranslations } from 'next-intl';
import { Plus, Trash2 } from 'lucide-react';
import { useTemplateSettingsStore } from '../../store/templateSettingsStore';
import { useResumeEditorStore } from '../../store/resumeEditorStore';
import { Button } from '@/components/ui/button';

export function PagesForm() {
  const t = useTranslations('cvEditor');
  const pageCount = useTemplateSettingsStore((s) => s.pageCount);
  const addPage = useTemplateSettingsStore((s) => s.addPage);
  const deletePage = useTemplateSettingsStore((s) => s.deletePage);
  const reassignEntriesFromPage = useResumeEditorStore((s) => s.reassignEntriesFromPage);

  const handleDeletePage = (index: number) => {
    reassignEntriesFromPage(index);
    deletePage(index);
  };

  return (
    <div className="space-y-3">
      {Array.from({ length: pageCount }, (_, i) => (
        <div key={i} className="rounded-md border border-border overflow-hidden">
          <div className="flex items-center justify-between bg-muted/50 px-3 py-2">
            <span className="text-sm font-medium">
              {t('pages.page')} {i + 1}
            </span>
            {pageCount > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => handleDeletePage(i)}
                className="text-muted-foreground hover:text-destructive"
                aria-label={t('pages.deletePage')}
              >
                <Trash2 size={14} />
              </Button>
            )}
          </div>
        </div>
      ))}

      <div className="flex justify-end">
        <Button type="button" variant="outline" size="sm" onClick={addPage} className="gap-1.5">
          <Plus size={14} />
          {t('pages.addPage')}
        </Button>
      </div>
    </div>
  );
}
