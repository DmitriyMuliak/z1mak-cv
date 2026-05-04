'use client';

import { useCallback, useState } from 'react';
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useResumeEditorStore } from '../../store/resumeEditorStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SortableItem, type DragHandleProps } from './SortableItem';
import type { ExperienceEntry } from '../../schema/resumeDocument.schema';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createEmptyEntry(): ExperienceEntry {
  return {
    id: crypto.randomUUID(),
    company: '',
    title: '',
    startDate: '',
    endDate: undefined,
    location: undefined,
    bullets: [],
  };
}

// ---------------------------------------------------------------------------
// Single entry sub-component
// ---------------------------------------------------------------------------

interface EntryProps {
  entry: ExperienceEntry;
  index: number;
  onRemove: (index: number) => void;
  dragHandleProps: DragHandleProps;
}

function ExperienceEntryForm({ entry, index, onRemove, dragHandleProps }: EntryProps) {
  const updateField = useResumeEditorStore((s) => s.updateField);
  const basePath = `/experience/${index}`;
  const [collapsed, setCollapsed] = useState(false);

  const handleField = (field: string, value: string) => {
    updateField(`${basePath}/${field}`, value || undefined);
  };

  const addBullet = () => {
    const updateDoc = useResumeEditorStore.getState().updateField;
    updateDoc(`${basePath}/bullets/${entry.bullets.length}`, '');
  };

  const removeBullet = (bi: number) => {
    const state = useResumeEditorStore.getState();
    const newBullets = entry.bullets.filter((_, i) => i !== bi);
    state.updateField(`${basePath}/bullets`, newBullets);
  };

  const updateBullet = (bi: number, value: string) => {
    updateField(`${basePath}/bullets/${bi}`, value);
  };

  const { listeners, ...attrs } = dragHandleProps;

  return (
    <div className="border border-border rounded-md p-4 space-y-3 bg-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors touch-none"
            aria-label="Drag to reorder"
            {...attrs}
            {...listeners}
          >
            <GripVertical size={16} />
          </button>
          <span className="text-sm font-medium text-foreground">
            {entry.title || entry.company || `Position ${index + 1}`}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? 'Expand entry' : 'Collapse entry'}
          >
            {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => onRemove(index)}
            aria-label="Remove experience entry"
          >
            <Trash2 size={14} className="text-destructive" />
          </Button>
        </div>
      </div>

      {!collapsed && (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor={`exp-${index}-title`}>Job Title</Label>
            <Input
              id={`exp-${index}-title`}
              placeholder="Senior Engineer"
              value={entry.title}
              onChange={(e) => updateField(`${basePath}/title`, e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`exp-${index}-company`}>Company</Label>
            <Input
              id={`exp-${index}-company`}
              placeholder="Acme Corp"
              value={entry.company}
              onChange={(e) => updateField(`${basePath}/company`, e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`exp-${index}-start`}>Start Date</Label>
            <Input
              id={`exp-${index}-start`}
              placeholder="Jan 2020"
              value={entry.startDate}
              onChange={(e) => updateField(`${basePath}/startDate`, e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`exp-${index}-end`}>End Date</Label>
            <Input
              id={`exp-${index}-end`}
              placeholder="Present"
              value={entry.endDate ?? ''}
              onChange={(e) => handleField('endDate', e.target.value)}
            />
          </div>
          <div className="col-span-2 space-y-1">
            <Label htmlFor={`exp-${index}-location`}>Location</Label>
            <Input
              id={`exp-${index}-location`}
              placeholder="New York, NY (or Remote)"
              value={entry.location ?? ''}
              onChange={(e) => handleField('location', e.target.value)}
            />
          </div>
        </div>
      )}

      {!collapsed && (
        <div className="space-y-2">
          <Label>Bullet Points</Label>
          {entry.bullets.map((bullet, bi) => (
            <div key={bi} className="flex items-center gap-2">
              <span className="text-muted-foreground text-xs mt-0.5">•</span>
              <Input
                placeholder="Describe an achievement or responsibility..."
                value={bullet}
                onChange={(e) => updateBullet(bi, e.target.value)}
                className="flex-1 text-sm"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => removeBullet(bi)}
                aria-label="Remove bullet"
              >
                <Trash2 size={12} className="text-destructive" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={addBullet} className="w-full">
            <Plus size={14} />
            Add Bullet
          </Button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main form component
// ---------------------------------------------------------------------------

export function ExperienceForm() {
  const experience = useResumeEditorStore((s) => s.document.experience);
  const updateField = useResumeEditorStore((s) => s.updateField);
  const reorderItems = useResumeEditorStore((s) => s.reorderItems);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const addEntry = useCallback(() => {
    const state = useResumeEditorStore.getState();
    const newList = [...state.document.experience, createEmptyEntry()];
    updateField('/experience', newList);
  }, [updateField]);

  const removeEntry = useCallback(
    (index: number) => {
      const state = useResumeEditorStore.getState();
      const newList = state.document.experience.filter((_, i) => i !== index);
      updateField('/experience', newList);
    },
    [updateField],
  );

  return (
    <div className="space-y-3">
      {experience.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-6 border border-dashed border-border rounded-md">
          No experience entries yet. Add your first position below.
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
        <SortableContext items={experience.map((e) => e.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {experience.map((entry, i) => (
              <SortableItem key={entry.id} id={entry.id}>
                {(dragHandleProps) => (
                  <ExperienceEntryForm
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
        Add Experience
      </Button>
    </div>
  );
}
