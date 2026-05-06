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
import { RichTextEditor } from './RichTextEditor';
import { PageSelect } from './PageSelect';
import type { ExperienceEntry } from '../../schema/resumeDocument.schema';

function createEmptyEntry(page: number): ExperienceEntry {
  return {
    id: crypto.randomUUID(),
    company: '',
    title: '',
    startDate: '',
    endDate: undefined,
    location: undefined,
    description: undefined,
    page,
  };
}

interface EntryProps {
  entry: ExperienceEntry;
  storeIndex: number;
  onRemove: (storeIndex: number) => void;
  dragHandleProps: DragHandleProps;
}

function ExperienceEntryForm({ entry, storeIndex, onRemove, dragHandleProps }: EntryProps) {
  const t = useTranslations('cvEditor');
  const updateField = useResumeEditorStore((s) => s.updateField);
  const basePath = `/experience/${storeIndex}`;
  const [collapsed, setCollapsed] = useState(false);

  const handleField = (field: string, value: string) => {
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
            aria-label={t('experience.dragToReorder')}
            {...attrs}
            {...listeners}
          >
            <GripVertical size={16} />
          </button>
          <span className="text-sm font-medium text-foreground">
            {entry.title ||
              entry.company ||
              t('experience.positionNumber', { number: storeIndex + 1 })}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? t('experience.expandEntry') : t('experience.collapseEntry')}
          >
            {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => onRemove(storeIndex)}
            aria-label={t('experience.removeEntry')}
          >
            <Trash2 size={14} className="text-destructive" />
          </Button>
        </div>
      </div>

      {!collapsed && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor={`exp-${storeIndex}-title`}>{t('experience.jobTitle')}</Label>
              <Input
                id={`exp-${storeIndex}-title`}
                placeholder={''}
                value={entry.title}
                onChange={(e) => updateField(`${basePath}/title`, e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`exp-${storeIndex}-company`}>{t('experience.company')}</Label>
              <Input
                id={`exp-${storeIndex}-company`}
                placeholder={''}
                value={entry.company}
                onChange={(e) => updateField(`${basePath}/company`, e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`exp-${storeIndex}-start`}>{t('experience.startDate')}</Label>
              <Input
                id={`exp-${storeIndex}-start`}
                placeholder={''}
                value={entry.startDate}
                onChange={(e) => updateField(`${basePath}/startDate`, e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`exp-${storeIndex}-end`}>{t('experience.endDate')}</Label>
              <Input
                id={`exp-${storeIndex}-end`}
                placeholder={''}
                value={entry.endDate ?? ''}
                onChange={(e) => handleField('endDate', e.target.value)}
              />
            </div>
            <div className="col-span-2 space-y-1">
              <Label htmlFor={`exp-${storeIndex}-location`}>{t('experience.location')}</Label>
              <Input
                id={`exp-${storeIndex}-location`}
                placeholder={''}
                value={entry.location ?? ''}
                onChange={(e) => handleField('location', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label>{t('experience.description')}</Label>
            <RichTextEditor
              value={entry.description}
              onChange={(html) => updateField(`${basePath}/description`, html)}
              placeholder={t('experience.descriptionPlaceholder')}
            />
          </div>
        </>
      )}
    </div>
  );
}

export function ExperienceForm() {
  const t = useTranslations('cvEditor');
  const experience = useResumeEditorStore((s) => s.document.experience);
  const updateField = useResumeEditorStore((s) => s.updateField);
  const reorderItems = useResumeEditorStore((s) => s.reorderItems);

  const [selectedPage, setSelectedPage] = useState(0);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const pageEntries = experience
    .map((entry, storeIndex) => ({ entry, storeIndex }))
    .filter(({ entry }) => (entry.page ?? 0) === selectedPage);

  const addEntry = useCallback(() => {
    const state = useResumeEditorStore.getState();
    const newList = [...state.document.experience, createEmptyEntry(selectedPage)];
    updateField('/experience', newList);
  }, [updateField, selectedPage]);

  const removeEntry = useCallback(
    (storeIndex: number) => {
      const state = useResumeEditorStore.getState();
      const newList = state.document.experience.filter((_, i) => i !== storeIndex);
      updateField('/experience', newList);
    },
    [updateField],
  );

  return (
    <div className="space-y-3">
      <PageSelect selectedPage={selectedPage} onSelect={setSelectedPage} sectionKey="experience" />
      {pageEntries.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-6 border border-dashed border-border rounded-md">
          {t('experience.empty')}
        </p>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={({ active, over }) => {
          if (over && active.id !== over.id) {
            reorderItems('experience', String(active.id), String(over.id));
          }
        }}
      >
        <SortableContext
          items={pageEntries.map(({ entry }) => entry.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {pageEntries.map(({ entry, storeIndex }) => (
              <SortableItem key={entry.id} id={entry.id}>
                {(dragHandleProps) => (
                  <ExperienceEntryForm
                    entry={entry}
                    storeIndex={storeIndex}
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
        {t('experience.addButton')}
      </Button>
    </div>
  );
}
