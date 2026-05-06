'use client';

import { useTranslations } from 'next-intl';
import { useResumeEditorStore } from '../../store/resumeEditorStore';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from './RichTextEditor';

export function SummaryForm() {
  const t = useTranslations('cvEditor');
  const summary = useResumeEditorStore((s) => s.document.summary);
  const updateField = useResumeEditorStore((s) => s.updateField);

  return (
    <div className="space-y-1.5">
      <Label>{t('summary.title')}</Label>
      <RichTextEditor
        value={summary}
        onChange={(html) => updateField('/summary', html)}
        placeholder={t('summary.placeholder')}
      />
      <p className="text-xs text-muted-foreground">{t('summary.hint')}</p>
    </div>
  );
}
