'use client';

import React, {
  useCallback,
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
  createRef,
} from 'react';
import { useTranslations } from 'next-intl';
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
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

const dragOverlayHandleProps = {
  tabIndex: -1,
  role: '',
  'aria-disabled': false,
  'aria-pressed': true,
  'aria-roledescription': '',
  'aria-describedby': '',
  listeners: {},
};

export interface ExperienceEntryHandle {
  setCollapsed: (v: boolean) => void;
  isCollapsed: boolean;
}

interface EntryProps {
  entry: ExperienceEntry;
  storeIndex: number;
  onRemove: (storeIndex: number) => void;
  dragHandleProps: DragHandleProps;
  initialCollapsed?: boolean;
}

const ExperienceEntryForm = forwardRef<ExperienceEntryHandle, EntryProps>(
  function ExperienceEntryForm(
    { entry, storeIndex, onRemove, dragHandleProps, initialCollapsed = false },
    ref,
  ) {
    const t = useTranslations('cvEditor');
    const updateField = useResumeEditorStore((s) => s.updateField);
    const basePath = `/experience/${storeIndex}`;
    const [collapsed, setCollapsed] = useState(initialCollapsed);

    useImperativeHandle(ref, () => ({ setCollapsed, isCollapsed: collapsed }), [collapsed]);

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
  },
);

export function ExperienceForm() {
  const t = useTranslations('cvEditor');
  const experience = useResumeEditorStore((s) => s.document.experience);
  const updateField = useResumeEditorStore((s) => s.updateField);
  const reorderItems = useResumeEditorStore((s) => s.reorderItems);

  const [selectedPage, setSelectedPage] = useState(0);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeCollapsed, setActiveCollapsed] = useState(false);

  const entryRefs = useRef<Map<string, React.RefObject<ExperienceEntryHandle | null>>>(new Map());

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const pageEntries = experience
    .map((entry, storeIndex) => ({ entry, storeIndex }))
    .filter(({ entry }) => (entry.page ?? 0) === selectedPage);

  const activeEntryData = activeId
    ? pageEntries.find((p) => String(p.entry.id) === activeId)
    : undefined;

  function getOrCreateRef(id: string) {
    if (!entryRefs.current.has(id)) {
      entryRefs.current.set(id, createRef<ExperienceEntryHandle>());
    }
    return entryRefs.current.get(id)!;
  }

  const handleToggleAll = useCallback((collapsed: boolean) => {
    for (const ref of entryRefs.current.values()) {
      ref.current?.setCollapsed(collapsed);
    }
  }, []);

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
      <PageSelect
        selectedPage={selectedPage}
        onSelect={setSelectedPage}
        sectionKey="experience"
        onToggleAll={handleToggleAll}
      />
      {pageEntries.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-6 border border-dashed border-border rounded-md">
          {t('experience.empty')}
        </p>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={({ active }) => {
          const id = String(active.id);
          setActiveId(id);
          setActiveCollapsed(entryRefs.current.get(id)?.current?.isCollapsed ?? false);
        }}
        onDragEnd={({ active, over }) => {
          setActiveId(null);
          if (over && active.id !== over.id) {
            reorderItems('experience', String(active.id), String(over.id));
          }
        }}
        onDragCancel={() => setActiveId(null)}
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
                    ref={getOrCreateRef(entry.id)}
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

        <DragOverlay>
          {activeEntryData ? (
            <div className="opacity-100 shadow-xl cursor-grabbing rounded-md">
              <ExperienceEntryForm
                entry={activeEntryData.entry}
                storeIndex={activeEntryData.storeIndex}
                onRemove={removeEntry}
                dragHandleProps={dragOverlayHandleProps}
                initialCollapsed={activeCollapsed}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <Button type="button" variant="outline" onClick={addEntry} className="w-full">
        <Plus size={16} />
        {t('experience.addButton')}
      </Button>
    </div>
  );
}
