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
import { PageSelect } from './PageSelect';
import type { EducationEntry } from '../../schema/resumeDocument.schema';

function createEmptyEntry(page: number): EducationEntry {
  return {
    id: crypto.randomUUID(),
    institution: '',
    degree: '',
    field: '',
    startDate: '',
    endDate: undefined,
    gpa: undefined,
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

export interface EducationEntryHandle {
  setCollapsed: (v: boolean) => void;
  isCollapsed: boolean;
}

interface EntryProps {
  entry: EducationEntry;
  storeIndex: number;
  onRemove: (storeIndex: number) => void;
  dragHandleProps: DragHandleProps;
  initialCollapsed?: boolean;
}

const EducationEntryForm = forwardRef<EducationEntryHandle, EntryProps>(function EducationEntryForm(
  { entry, storeIndex, onRemove, dragHandleProps, initialCollapsed = false },
  ref,
) {
  const t = useTranslations('cvEditor');
  const updateField = useResumeEditorStore((s) => s.updateField);
  const basePath = `/education/${storeIndex}`;
  const [collapsed, setCollapsed] = useState(initialCollapsed);

  useImperativeHandle(ref, () => ({ setCollapsed, isCollapsed: collapsed }), [collapsed]);

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
            {entry.institution || t('education.educationNumber', { number: storeIndex + 1 })}
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
            onClick={() => onRemove(storeIndex)}
            aria-label={t('education.removeEntry')}
          >
            <Trash2 size={14} className="text-destructive" />
          </Button>
        </div>
      </div>

      {!collapsed && (
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 space-y-1">
            <Label htmlFor={`edu-${storeIndex}-institution`}>{t('education.institution')}</Label>
            <Input
              id={`edu-${storeIndex}-institution`}
              placeholder={''}
              value={entry.institution}
              onChange={(e) => updateField(`${basePath}/institution`, e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`edu-${storeIndex}-degree`}>{t('education.degree')}</Label>
            <Input
              id={`edu-${storeIndex}-degree`}
              placeholder={''}
              value={entry.degree}
              onChange={(e) => updateField(`${basePath}/degree`, e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`edu-${storeIndex}-field`}>{t('education.field')}</Label>
            <Input
              id={`edu-${storeIndex}-field`}
              placeholder={''}
              value={entry.field}
              onChange={(e) => updateField(`${basePath}/field`, e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`edu-${storeIndex}-start`}>{t('education.startDate')}</Label>
            <Input
              id={`edu-${storeIndex}-start`}
              placeholder={''}
              value={entry.startDate}
              onChange={(e) => updateField(`${basePath}/startDate`, e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`edu-${storeIndex}-end`}>{t('education.endDate')}</Label>
            <Input
              id={`edu-${storeIndex}-end`}
              placeholder={''}
              value={entry.endDate ?? ''}
              onChange={(e) => handleOptional('endDate', e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`edu-${storeIndex}-gpa`}>{t('education.gpa')}</Label>
            <Input
              id={`edu-${storeIndex}-gpa`}
              placeholder={''}
              value={entry.gpa ?? ''}
              onChange={(e) => handleOptional('gpa', e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
});

export function EducationForm() {
  const t = useTranslations('cvEditor');
  const education = useResumeEditorStore((s) => s.document.education);
  const updateField = useResumeEditorStore((s) => s.updateField);
  const reorderItems = useResumeEditorStore((s) => s.reorderItems);

  const [selectedPage, setSelectedPage] = useState(0);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeCollapsed, setActiveCollapsed] = useState(false);

  const entryRefs = useRef<Map<string, React.RefObject<EducationEntryHandle | null>>>(new Map());

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const pageEntries = education
    .map((entry, storeIndex) => ({ entry, storeIndex }))
    .filter(({ entry }) => (entry.page ?? 0) === selectedPage);

  const activeEntryData = activeId
    ? pageEntries.find((p) => String(p.entry.id) === activeId)
    : undefined;

  function getOrCreateRef(id: string) {
    if (!entryRefs.current.has(id)) {
      entryRefs.current.set(id, createRef<EducationEntryHandle>());
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
    const newList = [...state.document.education, createEmptyEntry(selectedPage)];
    updateField('/education', newList);
  }, [updateField, selectedPage]);

  const removeEntry = useCallback(
    (storeIndex: number) => {
      const state = useResumeEditorStore.getState();
      const newList = state.document.education.filter((_, i) => i !== storeIndex);
      updateField('/education', newList);
    },
    [updateField],
  );

  return (
    <div className="space-y-3">
      <PageSelect
        selectedPage={selectedPage}
        onSelect={setSelectedPage}
        sectionKey="education"
        onToggleAll={handleToggleAll}
      />
      {pageEntries.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-6 border border-dashed border-border rounded-md">
          {t('education.empty')}
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
            reorderItems('education', String(active.id), String(over.id));
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
                  <EducationEntryForm
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
              <EducationEntryForm
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
        {t('education.addButton')}
      </Button>
    </div>
  );
}
