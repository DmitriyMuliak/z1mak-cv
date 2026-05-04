'use client';

import { useResumeEditorStore } from '../../store/resumeEditorStore';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

/**
 * Single textarea for the CV professional summary section.
 */
export function SummaryForm() {
  const summary = useResumeEditorStore((s) => s.document.summary);
  const updateField = useResumeEditorStore((s) => s.updateField);

  return (
    <div className="space-y-1.5">
      <Label htmlFor="summary-textarea">Professional Summary</Label>
      <Textarea
        id="summary-textarea"
        placeholder="A brief overview of your professional background, key skills, and career goals..."
        className="min-h-32 resize-y"
        value={summary ?? ''}
        onChange={(e) => updateField('/summary', e.target.value || undefined)}
      />
      <p className="text-xs text-muted-foreground">
        2–4 sentences work best. Focus on your value proposition.
      </p>
    </div>
  );
}
