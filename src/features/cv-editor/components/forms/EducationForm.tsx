'use client';

import { useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useResumeEditorStore } from '../../store/resumeEditorStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SortableItem, type DragHandleProps } from './SortableItem';
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
  dragHandleProps: DragHandleProps;
}

function EducationEntryForm({ entry, index, onRemove, dragHandleProps }: EntryProps) {
  const t = useTranslations('cvEditor');
  const updateField = useResumeEditorStore((s) => s.updateField);
  const basePath = `/education/${index}`;
  const [collapsed, setCollapsed] = useState(false);

  const handleOptional = (field: string, value: string) => {
    updateField(`${basePath}/${field}`, value || undefined);
  };

  const { listeners, ...attrs } = dragHandleProps;

  return (
    <div className="border border-border rounded-md p-4 space-y-3 bg-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors touch-none"
            aria-label={t('education.dragToReorder')}
            {...attrs}
            {...listeners}
          >
            <GripVertical size={16} />
          </button>
          <span className="text-sm font-medium text-foreground">
            {entry.institution || t('education.educationNumber', { number: index + 1 })}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? t('education.expandEntry') : t('education.collapseEntry')}
          >
            {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => onRemove(index)}
            aria-label={t('education.removeEntry')}
          >
            <Trash2 size={14} className="text-destructive" />
          </Button>
        </div>
      </div>

      {!collapsed && (
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 space-y-1">
            <Label htmlFor={`edu-${index}-institution`}>{t('education.institution')}</Label>
            <Input
              id={`edu-${index}-institution`}
              placeholder={''}
              value={entry.institution}
              onChange={(e) => updateField(`${basePath}/institution`, e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`edu-${index}-degree`}>{t('education.degree')}</Label>
            <Input
              id={`edu-${index}-degree`}
              placeholder={''}
              value={entry.degree}
              onChange={(e) => updateField(`${basePath}/degree`, e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`edu-${index}-field`}>{t('education.field')}</Label>
            <Input
              id={`edu-${index}-field`}
              placeholder={''}
              value={entry.field}
              onChange={(e) => updateField(`${basePath}/field`, e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`edu-${index}-start`}>{t('education.startDate')}</Label>
            <Input
              id={`edu-${index}-start`}
              placeholder={''}
              value={entry.startDate}
              onChange={(e) => updateField(`${basePath}/startDate`, e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`edu-${index}-end`}>{t('education.endDate')}</Label>
            <Input
              id={`edu-${index}-end`}
              placeholder={''}
              value={entry.endDate ?? ''}
              onChange={(e) => handleOptional('endDate', e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`edu-${index}-gpa`}>{t('education.gpa')}</Label>
            <Input
              id={`edu-${index}-gpa`}
              placeholder={''}
              value={entry.gpa ?? ''}
              onChange={(e) => handleOptional('gpa', e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main form component
// ---------------------------------------------------------------------------

export function EducationForm() {
  const t = useTranslations('cvEditor');
  const education = useResumeEditorStore((s) => s.document.education);
  const updateField = useResumeEditorStore((s) => s.updateField);
  const reorderItems = useResumeEditorStore((s) => s.reorderItems);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

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
          {t('education.empty')}
        </p>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={({ active, over }) => {
          if (over && active.id !== over.id) {
            reorderItems('education', String(active.id), String(over.id));
          }
        }}
      >
        <SortableContext items={education.map((e) => e.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {education.map((entry, i) => (
              <SortableItem key={entry.id} id={entry.id}>
                {(dragHandleProps) => (
                  <EducationEntryForm
                    entry={entry}
                    index={i}
                    onRemove={removeEntry}
                    dragHandleProps={dragHandleProps}
                  />
                )}
              </SortableItem>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <Button type="button" variant="outline" onClick={addEntry} className="w-full">
        <Plus size={16} />
        {t('education.addButton')}
      </Button>
    </div>
  );
}
