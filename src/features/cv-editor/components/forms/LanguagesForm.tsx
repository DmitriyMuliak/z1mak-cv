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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SortableItem, type DragHandleProps } from './SortableItem';
import { PageSelect } from './PageSelect';
import type { LanguageEntry, LanguageProficiency } from '../../schema/resumeDocument.schema';

const PROFICIENCY_LEVELS: LanguageProficiency[] = [
  'native',
  'fluent',
  'advanced',
  'intermediate',
  'basic',
];

function createEmptyEntry(page: number): LanguageEntry {
  return {
    id: crypto.randomUUID(),
    language: '',
    proficiency: 'intermediate',
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

export interface LanguageEntryHandle {
  setCollapsed: (v: boolean) => void;
  isCollapsed: boolean;
}

interface EntryProps {
  entry: LanguageEntry;
  storeIndex: number;
  onRemove: (storeIndex: number) => void;
  dragHandleProps: DragHandleProps;
  initialCollapsed?: boolean;
}

const LanguageEntryForm = forwardRef<LanguageEntryHandle, EntryProps>(function LanguageEntryForm(
  { entry, storeIndex, onRemove, dragHandleProps, initialCollapsed = false },
  ref,
) {
  const t = useTranslations('cvEditor');
  const updateField = useResumeEditorStore((s) => s.updateField);
  const basePath = `/languages/${storeIndex}`;
  const [collapsed, setCollapsed] = useState(initialCollapsed);

  useImperativeHandle(ref, () => ({ setCollapsed, isCollapsed: collapsed }), [collapsed]);

  const { listeners, ...attrs } = dragHandleProps;

  return (
    <div className="border border-border rounded-md p-3 bg-card">
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors touch-none shrink-0"
          aria-label={t('languages.dragToReorder')}
          {...attrs}
          {...listeners}
        >
          <GripVertical size={16} />
        </button>

        {collapsed ? (
          <span className="flex-1 text-sm font-medium text-foreground min-w-0 truncate">
            {entry.language || t('languages.language')}
            {entry.language && (
              <span className="text-muted-foreground font-normal">
                {' — '}
                {t(`languages.proficiencyLevels.${entry.proficiency}`)}
              </span>
            )}
          </span>
        ) : (
          <>
            <div className="flex-1 space-y-1 min-w-0">
              <Label htmlFor={`lang-${storeIndex}-language`} className="sr-only">
                {t('languages.language')}
              </Label>
              <Input
                id={`lang-${storeIndex}-language`}
                placeholder={t('languages.language')}
                value={entry.language}
                onChange={(e) => updateField(`${basePath}/language`, e.target.value)}
              />
            </div>

            <div className="w-36 shrink-0 space-y-1">
              <Label className="sr-only">{t('languages.proficiency')}</Label>
              <Select
                value={entry.proficiency}
                onValueChange={(v) =>
                  updateField(`${basePath}/proficiency`, v as LanguageProficiency)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {PROFICIENCY_LEVELS.map((level) => (
                      <SelectItem key={level} value={level}>
                        {t(`languages.proficiencyLevels.${level}`)}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? t('languages.expandEntry') : t('languages.collapseEntry')}
          className="shrink-0"
        >
          {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => onRemove(storeIndex)}
          aria-label={t('languages.removeEntry')}
          className="shrink-0"
        >
          <Trash2 size={14} className="text-destructive" />
        </Button>
      </div>
    </div>
  );
});

export function LanguagesForm() {
  const t = useTranslations('cvEditor');
  const languages = useResumeEditorStore((s) => s.document.languages);
  const updateField = useResumeEditorStore((s) => s.updateField);
  const reorderItems = useResumeEditorStore((s) => s.reorderItems);

  const [selectedPage, setSelectedPage] = useState(0);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeCollapsed, setActiveCollapsed] = useState(false);

  const entryRefs = useRef<Map<string, React.RefObject<LanguageEntryHandle | null>>>(new Map());

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const pageEntries = languages
    .map((entry, storeIndex) => ({ entry, storeIndex }))
    .filter(({ entry }) => (entry.page ?? 0) === selectedPage);

  const activeEntryData = activeId
    ? pageEntries.find((p) => String(p.entry.id) === activeId)
    : undefined;

  function getOrCreateRef(id: string) {
    if (!entryRefs.current.has(id)) {
      entryRefs.current.set(id, createRef<LanguageEntryHandle>());
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
    const newList = [...state.document.languages, createEmptyEntry(selectedPage)];
    updateField('/languages', newList);
  }, [updateField, selectedPage]);

  const removeEntry = useCallback(
    (storeIndex: number) => {
      const state = useResumeEditorStore.getState();
      const newList = state.document.languages.filter((_, i) => i !== storeIndex);
      updateField('/languages', newList);
    },
    [updateField],
  );

  return (
    <div className="space-y-3">
      <PageSelect
        selectedPage={selectedPage}
        onSelect={setSelectedPage}
        sectionKey="languages"
        onToggleAll={handleToggleAll}
      />
      {pageEntries.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-6 border border-dashed border-border rounded-md">
          {t('languages.empty')}
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
            reorderItems('languages', String(active.id), String(over.id));
          }
        }}
        onDragCancel={() => setActiveId(null)}
      >
        <SortableContext
          items={pageEntries.map(({ entry }) => entry.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {pageEntries.map(({ entry, storeIndex }) => (
              <SortableItem key={entry.id} id={entry.id}>
                {(dragHandleProps) => (
                  <LanguageEntryForm
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
              <LanguageEntryForm
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
        {t('languages.addButton')}
      </Button>
    </div>
  );
}
