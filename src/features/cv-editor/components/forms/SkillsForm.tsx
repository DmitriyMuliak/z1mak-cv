'use client';

import { useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, Trash2, X, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useResumeEditorStore } from '../../store/resumeEditorStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SortableItem, type DragHandleProps } from './SortableItem';
import type { SkillGroup } from '../../schema/resumeDocument.schema';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createEmptyGroup(): SkillGroup {
  return {
    id: crypto.randomUUID(),
    category: '',
    items: [],
  };
}

// ---------------------------------------------------------------------------
// Single skill group sub-component
// ---------------------------------------------------------------------------

interface GroupProps {
  group: SkillGroup;
  index: number;
  onRemove: (index: number) => void;
  dragHandleProps: DragHandleProps;
}

function SkillGroupForm({ group, index, onRemove, dragHandleProps }: GroupProps) {
  const t = useTranslations('cvEditor');
  const updateField = useResumeEditorStore((s) => s.updateField);
  const basePath = `/skills/${index}`;
  const [collapsed, setCollapsed] = useState(false);

  const addItem = () => {
    const state = useResumeEditorStore.getState();
    const currentGroup = state.document.skills[index];
    updateField(`${basePath}/items/${currentGroup.items.length}`, '');
  };

  const removeItem = (itemIndex: number) => {
    const state = useResumeEditorStore.getState();
    const newItems = state.document.skills[index].items.filter((_, i) => i !== itemIndex);
    updateField(`${basePath}/items`, newItems);
  };

  const updateItem = (itemIndex: number, value: string) => {
    updateField(`${basePath}/items/${itemIndex}`, value);
  };

  const { listeners, ...attrs } = dragHandleProps;

  return (
    <div className="border border-border rounded-md p-4 space-y-3 bg-card">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors touch-none mt-5"
          aria-label={t('skills.dragToReorder')}
          {...attrs}
          {...listeners}
        >
          <GripVertical size={16} />
        </button>
        <div className="flex-1 space-y-1">
          <Label htmlFor={`skill-${index}-category`}>{t('skills.category', { number: '' })}</Label>
          <Input
            id={`skill-${index}-category`}
            placeholder={t('skills.category', { number: index + 1 })}
            value={group.category}
            onChange={(e) => updateField(`${basePath}/category`, e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1 mt-5">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? t('skills.expandGroup') : t('skills.collapseGroup')}
          >
            {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => onRemove(index)}
            aria-label={t('skills.removeGroup')}
          >
            <Trash2 size={14} className="text-destructive" />
          </Button>
        </div>
      </div>

      {!collapsed && (
        <div className="space-y-1.5">
          <Label>{t('skills.skills')}</Label>

          {/* Tag-style display of existing items */}
          {group.items.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {group.items.map((item, ii) => (
                <span
                  key={ii}
                  className="inline-flex items-center gap-1 text-xs bg-muted rounded px-2 py-0.5"
                >
                  <Input
                    className="h-5 min-w-0 w-24 border-none shadow-none p-0 text-xs bg-transparent focus-visible:ring-0"
                    value={item}
                    onChange={(e) => updateItem(ii, e.target.value)}
                    placeholder={t('skills.skills')}
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(ii)}
                    aria-label={t('skills.removeSkill')}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <X size={11} />
                  </button>
                </span>
              ))}
            </div>
          )}

          <Button type="button" variant="outline" size="sm" onClick={addItem} className="w-full">
            <Plus size={14} />
            {t('skills.addSkill')}
          </Button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main form component
// ---------------------------------------------------------------------------

/**
 * Manages skill groups — each group has a category name and a list of skill tags.
 */
export function SkillsForm() {
  const t = useTranslations('cvEditor');
  const skills = useResumeEditorStore((s) => s.document.skills);
  const updateField = useResumeEditorStore((s) => s.updateField);
  const reorderItems = useResumeEditorStore((s) => s.reorderItems);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const addGroup = useCallback(() => {
    const state = useResumeEditorStore.getState();
    const newList = [...state.document.skills, createEmptyGroup()];
    updateField('/skills', newList);
  }, [updateField]);

  const removeGroup = useCallback(
    (index: number) => {
      const state = useResumeEditorStore.getState();
      const newList = state.document.skills.filter((_, i) => i !== index);
      updateField('/skills', newList);
    },
    [updateField],
  );

  return (
    <div className="space-y-3">
      {skills.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-6 border border-dashed border-border rounded-md">
          {t('skills.empty')}
        </p>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={({ active, over }) => {
          if (over && active.id !== over.id) {
            reorderItems('skills', String(active.id), String(over.id));
          }
        }}
      >
        <SortableContext items={skills.map((g) => g.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {skills.map((group, i) => (
              <SortableItem key={group.id} id={group.id}>
                {(dragHandleProps) => (
                  <SkillGroupForm
                    group={group}
                    index={i}
                    onRemove={removeGroup}
                    dragHandleProps={dragHandleProps}
                  />
                )}
              </SortableItem>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <Button type="button" variant="outline" onClick={addGroup} className="w-full">
        <Plus size={16} />
        {t('skills.addButton')}
      </Button>
    </div>
  );
}
