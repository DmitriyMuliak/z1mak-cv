'use client';

import { useCallback } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { useResumeEditorStore } from '../../store/resumeEditorStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { EducationEntry } from '../../schema/resumeDocument.schema';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createEmptyEntry(): EducationEntry {
  return {
    id: crypto.randomUUID(),
    institution: '',
    degree: '',
    field: '',
    startDate: '',
    endDate: undefined,
    gpa: undefined,
  };
}

// ---------------------------------------------------------------------------
// Single entry sub-component
// ---------------------------------------------------------------------------

interface EntryProps {
  entry: EducationEntry;
  index: number;
  onRemove: (index: number) => void;
}

function EducationEntryForm({ entry, index, onRemove }: EntryProps) {
  const updateField = useResumeEditorStore((s) => s.updateField);
  const basePath = `/education/${index}`;

  const handleOptional = (field: string, value: string) => {
    updateField(`${basePath}/${field}`, value || undefined);
  };

  return (
    <div className="border border-border rounded-md p-4 space-y-3 bg-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-muted-foreground">
          <GripVertical size={16} />
          <span className="text-sm font-medium text-foreground">
            {entry.institution || `Education ${index + 1}`}
          </span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => onRemove(index)}
          aria-label="Remove education entry"
        >
          <Trash2 size={14} className="text-destructive" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 space-y-1">
          <Label htmlFor={`edu-${index}-institution`}>Institution</Label>
          <Input
            id={`edu-${index}-institution`}
            placeholder="Massachusetts Institute of Technology"
            value={entry.institution}
            onChange={(e) => updateField(`${basePath}/institution`, e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor={`edu-${index}-degree`}>Degree</Label>
          <Input
            id={`edu-${index}-degree`}
            placeholder="Bachelor of Science"
            value={entry.degree}
            onChange={(e) => updateField(`${basePath}/degree`, e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor={`edu-${index}-field`}>Field of Study</Label>
          <Input
            id={`edu-${index}-field`}
            placeholder="Computer Science"
            value={entry.field}
            onChange={(e) => updateField(`${basePath}/field`, e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor={`edu-${index}-start`}>Start Date</Label>
          <Input
            id={`edu-${index}-start`}
            placeholder="Sep 2016"
            value={entry.startDate}
            onChange={(e) => updateField(`${basePath}/startDate`, e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor={`edu-${index}-end`}>End Date</Label>
          <Input
            id={`edu-${index}-end`}
            placeholder="May 2020"
            value={entry.endDate ?? ''}
            onChange={(e) => handleOptional('endDate', e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor={`edu-${index}-gpa`}>GPA (optional)</Label>
          <Input
            id={`edu-${index}-gpa`}
            placeholder="3.8"
            value={entry.gpa ?? ''}
            onChange={(e) => handleOptional('gpa', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main form component
// ---------------------------------------------------------------------------

/**
 * Manages the list of education entries.
 */
export function EducationForm() {
  const education = useResumeEditorStore((s) => s.document.education);
  const updateField = useResumeEditorStore((s) => s.updateField);

  const addEntry = useCallback(() => {
    const state = useResumeEditorStore.getState();
    const newList = [...state.document.education, createEmptyEntry()];
    updateField('/education', newList);
  }, [updateField]);

  const removeEntry = useCallback(
    (index: number) => {
      const state = useResumeEditorStore.getState();
      const newList = state.document.education.filter((_, i) => i !== index);
      updateField('/education', newList);
    },
    [updateField],
  );

  return (
    <div className="space-y-3">
      {education.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-6 border border-dashed border-border rounded-md">
          No education entries yet.
        </p>
      )}

      {education.map((entry, i) => (
        <EducationEntryForm key={entry.id} entry={entry} index={i} onRemove={removeEntry} />
      ))}

      <Button type="button" variant="outline" onClick={addEntry} className="w-full">
        <Plus size={16} />
        Add Education
      </Button>
    </div>
  );
}
