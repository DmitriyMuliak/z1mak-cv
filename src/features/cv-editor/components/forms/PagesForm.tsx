'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTemplateSettingsStore, type SectionKey } from '../../store/templateSettingsStore';
import { useResumeEditorStore } from '../../store/resumeEditorStore';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ResumeDocument } from '../../schema/resumeDocument.schema';

function hasContentOnPage(doc: ResumeDocument, key: SectionKey, pageIndex: number): boolean {
  if (key === 'summary') return pageIndex === 0 && !!doc.summary;
  return (doc[key] as { page?: number }[]).some((e) => (e.page ?? 0) === pageIndex);
}

interface SectionBadgeProps {
  sectionKey: SectionKey;
  active: boolean;
  label: string;
}

function SectionBadge({ sectionKey, active, label }: SectionBadgeProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: sectionKey,
  });

  return (
    <span
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium select-none',
        active
          ? 'border-border bg-muted text-foreground'
          : 'border-dashed border-border/50 bg-transparent text-muted-foreground',
        isDragging && 'opacity-50 z-50',
      )}
    >
      <span
        className="cursor-grab active:cursor-grabbing touch-none text-muted-foreground"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={10} />
      </span>
      {label}
    </span>
  );
}

interface PageTileProps {
  pageIndex: number;
  pageCount: number;
  onDelete: (index: number) => void;
}

function PageTile({ pageIndex, pageCount, onDelete }: PageTileProps) {
  const t = useTranslations('cvEditor');
  const order = useTemplateSettingsStore((s) => s.sectionOrder[pageIndex] ?? []);
  const reorderSection = useTemplateSettingsStore((s) => s.reorderSection);
  const doc = useResumeEditorStore((s) => s.document);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const [activeId, setActiveId] = useState<SectionKey | null>(null);

  return (
    <div className="rounded-md border border-border overflow-hidden">
      <div className="flex items-center justify-between bg-muted/50 px-3 py-2">
        <span className="text-sm font-medium">
          {t('pages.page')} {pageIndex + 1}
        </span>
        {pageCount > 1 && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => onDelete(pageIndex)}
            className="text-muted-foreground hover:text-destructive"
            aria-label={t('pages.deletePage')}
          >
            <Trash2 size={14} />
          </Button>
        )}
      </div>

      <div className="px-3 py-2">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={({ active }) => setActiveId(active.id as SectionKey)}
          onDragEnd={({ active, over }) => {
            setActiveId(null);
            if (over && active.id !== over.id) {
              reorderSection(pageIndex, active.id as SectionKey, over.id as SectionKey);
            }
          }}
          onDragCancel={() => setActiveId(null)}
        >
          <SortableContext items={order} strategy={horizontalListSortingStrategy}>
            <div className="flex flex-wrap gap-1.5">
              {order.map((key) => {
                if (key === 'summary') {
                  if (pageIndex === 0) {
                    return (
                      <SectionBadge
                        key={key}
                        sectionKey={key}
                        active={hasContentOnPage(doc, key, pageIndex)}
                        label={t(`tabs.${key}`)}
                      />
                    );
                  }
                  return null;
                }
                return (
                  <SectionBadge
                    key={key}
                    sectionKey={key}
                    active={hasContentOnPage(doc, key, pageIndex)}
                    label={t(`tabs.${key}`)}
                  />
                );
              })}
            </div>
          </SortableContext>

          <DragOverlay>
            {activeId ? (
              <SectionBadge
                key={activeId}
                sectionKey={activeId}
                active={hasContentOnPage(doc, activeId, pageIndex)}
                label={t(`tabs.${activeId}`)}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}

export function PagesForm() {
  const t = useTranslations('cvEditor');
  const pageCount = useTemplateSettingsStore((s) => s.pageCount);
  const addPage = useTemplateSettingsStore((s) => s.addPage);
  const deletePage = useTemplateSettingsStore((s) => s.deletePage);
  const reassignEntriesFromPage = useResumeEditorStore((s) => s.reassignEntriesFromPage);

  const handleDeletePage = (index: number) => {
    reassignEntriesFromPage(index);
    deletePage(index);
  };

  return (
    <div className="space-y-3">
      {Array.from({ length: pageCount }, (_, i) => (
        <PageTile key={i} pageIndex={i} pageCount={pageCount} onDelete={handleDeletePage} />
      ))}

      <div className="flex justify-end">
        <Button type="button" variant="outline" size="sm" onClick={addPage} className="gap-1.5">
          <Plus size={14} />
          {t('pages.addPage')}
        </Button>
      </div>
    </div>
  );
}
