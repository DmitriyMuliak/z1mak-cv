'use client';

import { useResumeEditorStore } from '../../store/resumeEditorStore';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from './RichTextEditor';

export function SummaryForm() {
  const summary = useResumeEditorStore((s) => s.document.summary);
  const updateField = useResumeEditorStore((s) => s.updateField);

  return (
    <div className="space-y-1.5">
      <Label>Professional Summary</Label>
      <RichTextEditor
        value={summary}
        onChange={(html) => updateField('/summary', html)}
        placeholder="A brief overview of your professional background, key skills, and career goals…"
      />
      <p className="text-xs text-muted-foreground">
        2–4 sentences work best. Focus on your value proposition.
      </p>
    </div>
  );
}
