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
import type { CertificationEntry } from '../../schema/resumeDocument.schema';

function createEmptyEntry(page: number): CertificationEntry {
  return {
    id: crypto.randomUUID(),
    name: '',
    issuer: '',
    date: undefined,
    url: undefined,
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

export interface CertificationEntryHandle {
  setCollapsed: (v: boolean) => void;
  isCollapsed: boolean;
}

interface EntryProps {
  entry: CertificationEntry;
  storeIndex: number;
  onRemove: (storeIndex: number) => void;
  dragHandleProps: DragHandleProps;
  initialCollapsed?: boolean;
}

const CertificationEntryForm = forwardRef<CertificationEntryHandle, EntryProps>(
  function CertificationEntryForm(
    { entry, storeIndex, onRemove, dragHandleProps, initialCollapsed = false },
    ref,
  ) {
    const t = useTranslations('cvEditor');
    const updateField = useResumeEditorStore((s) => s.updateField);
    const basePath = `/certifications/${storeIndex}`;
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
              aria-label={t('certifications.dragToReorder')}
              {...attrs}
              {...listeners}
            >
              <GripVertical size={16} />
            </button>
            <span className="text-sm font-medium text-foreground">
              {entry.name || t('certifications.entryNumber', { number: storeIndex + 1 })}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => setCollapsed((c) => !c)}
              aria-label={
                collapsed ? t('certifications.expandEntry') : t('certifications.collapseEntry')
              }
            >
              {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => onRemove(storeIndex)}
              aria-label={t('certifications.removeEntry')}
            >
              <Trash2 size={14} className="text-destructive" />
            </Button>
          </div>
        </div>

        {!collapsed && (
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1">
              <Label htmlFor={`cert-${storeIndex}-name`}>{t('certifications.name')}</Label>
              <Input
                id={`cert-${storeIndex}-name`}
                value={entry.name}
                onChange={(e) => updateField(`${basePath}/name`, e.target.value)}
              />
            </div>
            <div className="col-span-2 space-y-1">
              <Label htmlFor={`cert-${storeIndex}-issuer`}>{t('certifications.issuer')}</Label>
              <Input
                id={`cert-${storeIndex}-issuer`}
                value={entry.issuer}
                onChange={(e) => updateField(`${basePath}/issuer`, e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`cert-${storeIndex}-date`}>{t('certifications.date')}</Label>
              <Input
                id={`cert-${storeIndex}-date`}
                value={entry.date ?? ''}
                onChange={(e) => handleOptional('date', e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`cert-${storeIndex}-url`}>{t('certifications.url')}</Label>
              <Input
                id={`cert-${storeIndex}-url`}
                type="url"
                value={entry.url ?? ''}
                onChange={(e) => handleOptional('url', e.target.value)}
              />
            </div>
          </div>
        )}
      </div>
    );
  },
);

export function CertificationsForm() {
  const t = useTranslations('cvEditor');
  const certifications = useResumeEditorStore((s) => s.document.certifications);
  const updateField = useResumeEditorStore((s) => s.updateField);
  const reorderItems = useResumeEditorStore((s) => s.reorderItems);

  const [selectedPage, setSelectedPage] = useState(0);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeCollapsed, setActiveCollapsed] = useState(false);

  const entryRefs = useRef<Map<string, React.RefObject<CertificationEntryHandle | null>>>(
    new Map(),
  );

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const pageEntries = certifications
    .map((entry, storeIndex) => ({ entry, storeIndex }))
    .filter(({ entry }) => (entry.page ?? 0) === selectedPage);

  const activeEntryData = activeId
    ? pageEntries.find((p) => String(p.entry.id) === activeId)
    : undefined;

  function getOrCreateRef(id: string) {
    if (!entryRefs.current.has(id)) {
      entryRefs.current.set(id, createRef<CertificationEntryHandle>());
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
    const newList = [...state.document.certifications, createEmptyEntry(selectedPage)];
    updateField('/certifications', newList);
  }, [updateField, selectedPage]);

  const removeEntry = useCallback(
    (storeIndex: number) => {
      const state = useResumeEditorStore.getState();
      const newList = state.document.certifications.filter((_, i) => i !== storeIndex);
      updateField('/certifications', newList);
    },
    [updateField],
  );

  return (
    <div className="space-y-3">
      <PageSelect
        selectedPage={selectedPage}
        onSelect={setSelectedPage}
        sectionKey="certifications"
        onToggleAll={handleToggleAll}
      />
      {pageEntries.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-6 border border-dashed border-border rounded-md">
          {t('certifications.empty')}
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
            reorderItems('certifications', String(active.id), String(over.id));
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
                  <CertificationEntryForm
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
              <CertificationEntryForm
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
        {t('certifications.addButton')}
      </Button>
    </div>
  );
}
