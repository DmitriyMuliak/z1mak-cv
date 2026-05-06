'use client';

import { useState, useEffect } from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useTranslations } from 'next-intl';
import { Undo2, Redo2, RotateCcw, FileDown, Loader2, Eye, X } from 'lucide-react';
import { useResumeEditorStore, useResumeEditorHistory } from '../store/resumeEditorStore';
import { useTemplateSettingsStore } from '../store/templateSettingsStore';
import type { TemplateStyle } from '../store/templateSettingsStore';
import type { FontOption } from '../pdf/registerFonts';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { HeaderForm } from './forms/HeaderForm';
import { SummaryForm } from './forms/SummaryForm';
import { ExperienceForm } from './forms/ExperienceForm';
import { EducationForm } from './forms/EducationForm';
import { SkillsForm } from './forms/SkillsForm';
import { CertificationsForm } from './forms/CertificationsForm';
import { LanguagesForm } from './forms/LanguagesForm';
import { TemplateSettingsForm } from './forms/TemplateSettingsForm';
import { PagesForm } from './forms/PagesForm';
import { ResumeCanvas } from './ResumeCanvas';
import { usePdfExport } from '../hooks/usePdfExport';

// ---------------------------------------------------------------------------
// Tabs
// ---------------------------------------------------------------------------

type TabId =
  | 'header'
  | 'summary'
  | 'experience'
  | 'education'
  | 'skills'
  | 'certifications'
  | 'languages'
  | 'template'
  | 'pages';

const FORM_MAP: Record<TabId, React.ReactNode> = {
  header: <HeaderForm />,
  summary: <SummaryForm />,
  experience: <ExperienceForm />,
  education: <EducationForm />,
  skills: <SkillsForm />,
  certifications: <CertificationsForm />,
  languages: <LanguagesForm />,
  template: <TemplateSettingsForm />,
  pages: <PagesForm />,
};

function getTabs(t: ReturnType<typeof useTranslations>): { id: TabId; label: string }[] {
  return [
    { id: 'header', label: t('tabs.header') },
    { id: 'summary', label: t('tabs.summary') },
    { id: 'experience', label: t('tabs.experience') },
    { id: 'education', label: t('tabs.education') },
    { id: 'skills', label: t('tabs.skills') },
    { id: 'certifications', label: t('tabs.certifications') },
    { id: 'languages', label: t('tabs.languages') },
    { id: 'pages', label: t('tabs.pages') },
    { id: 'template', label: t('tabs.template') },
  ];
}

// ---------------------------------------------------------------------------
// Toolbar
// ---------------------------------------------------------------------------

function EditorToolbar({ onOpenPreview }: { onOpenPreview: () => void }) {
  const t = useTranslations('cvEditor');
  const { undo, redo, canUndo, canRedo } = useResumeEditorHistory();
  // const isDirty = useResumeEditorStore((s) => s.isDirty);
  const resetDocument = useResumeEditorStore((s) => s.resetDocument);
  const document = useResumeEditorStore((s) => s.document);
  const template = useTemplateSettingsStore((s) => s.template);
  const font = useTemplateSettingsStore((s) => s.font);
  const pageCount = useTemplateSettingsStore((s) => s.pageCount);
  const sectionOrder = useTemplateSettingsStore((s) => s.sectionOrder);
  const { exportPdf, isGenerating } = usePdfExport();

  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-background/80 backdrop-blur-sm shrink-0 flex-wrap">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => undo()}
        disabled={!canUndo}
        title={t('buttons.undo')}
        aria-label={t('buttons.undo')}
      >
        <Undo2 size={16} />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => redo()}
        disabled={!canRedo}
        title={t('buttons.redo')}
        aria-label={t('buttons.redo')}
      >
        <Redo2 size={16} />
      </Button>

      <div className="w-px h-5 bg-border mx-1" />

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={resetDocument}
        title={t('buttons.reset')}
        className="text-muted-foreground hover:text-destructive"
      >
        <RotateCcw size={14} />
        {t('buttons.reset')}
      </Button>

      <div className="w-px h-5 bg-border mx-1" />

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => exportPdf(document, template, font, pageCount, sectionOrder)}
        disabled={isGenerating}
        aria-label={isGenerating ? t('buttons.exporting') : t('buttons.exportPdf')}
        className="gap-1.5"
      >
        {isGenerating ? (
          <Loader2 size={14} className="animate-spin" aria-hidden="true" />
        ) : (
          <FileDown size={14} aria-hidden="true" />
        )}
        {isGenerating ? t('buttons.exporting') : t('buttons.exportPdf')}
      </Button>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onOpenPreview}
        aria-label={t('buttons.livePreview')}
        className="gap-1.5 lg:hidden"
      >
        <Eye size={14} aria-hidden="true" />
        {t('buttons.livePreview')}
      </Button>

      {/* {isDirty && (
        <span className="ml-auto flex items-center gap-1 text-xs text-amber-500">
          <CircleDot size={12} />
          {t('buttons.unsaved')}
        </span>
      )} */}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab bar
// ---------------------------------------------------------------------------

function TabBar({ activeTab, onChange }: { activeTab: TabId; onChange: (t: TabId) => void }) {
  const t = useTranslations('cvEditor');
  const isDirty = useResumeEditorStore((s) => s.isDirty);
  const tabs = getTabs(t);

  return (
    <div
      className="flex overflow-x-auto shrink-0 border-b border-border bg-background"
      role="tablist"
      aria-label={t('tabs.label')}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={activeTab === tab.id}
          aria-controls={`tabpanel-${tab.id}`}
          id={`tab-${tab.id}`}
          onClick={() => onChange(tab.id)}
          className={cn(
            'relative flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors shrink-0',
            'hover:text-foreground hover:bg-muted/50',
            activeTab === tab.id
              ? 'text-foreground after:absolute after:bottom-0 after:inset-x-0 after:h-0.5 after:bg-primary'
              : 'text-muted-foreground',
          )}
        >
          {tab.label}
          {isDirty && activeTab === tab.id && tab.id !== 'template' && (
            <span aria-hidden className="size-1.5 rounded-full bg-amber-500 shrink-0" />
          )}
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main layout
// ---------------------------------------------------------------------------

function PreviewModal({
  onClose,
  template,
  font,
}: {
  onClose: () => void;
  template: TemplateStyle;
  font: FontOption;
}) {
  const t = useTranslations('cvEditor');
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background lg:hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border shrink-0 bg-background/80 backdrop-blur-sm">
        <span className="text-sm font-medium">{t('buttons.livePreview')}</span>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
          aria-label="Close preview"
        >
          <X size={16} />
        </Button>
      </div>
      <div className="flex-1 overflow-hidden relative bg-muted/40">
        <ResumeCanvas template={template} font={font} />
      </div>
    </div>
  );
}

export function EditorLayout() {
  const [activeTab, setActiveTab] = useState<TabId>('header');
  const [previewOpen, setPreviewOpen] = useState(false);
  const isLg = useMediaQuery('(min-width: 1024px)');
  const template = useTemplateSettingsStore((s) => s.template);
  const font = useTemplateSettingsStore((s) => s.font);

  useEffect(() => {
    if (isLg) setPreviewOpen(false);
  }, [isLg]);

  return (
    <div className="w-full flex flex-col" style={{ minHeight: 'calc(100vh - 80px)' }}>
      <EditorToolbar onOpenPreview={() => setPreviewOpen(true)} />

      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        {/* Left: Form pane */}
        <div className="flex flex-col w-full lg:w-[480px] lg:shrink-0 lg:border-r border-border overflow-hidden">
          <TabBar activeTab={activeTab} onChange={setActiveTab} />
          <div
            id={`tabpanel-${activeTab}`}
            role="tabpanel"
            aria-labelledby={`tab-${activeTab}`}
            className="flex-1 overflow-y-auto p-4"
          >
            {FORM_MAP[activeTab]}
          </div>
        </div>

        {/* Right: Preview pane — hidden on mobile, visible lg+ */}
        <div className="hidden lg:flex flex-1 overflow-hidden relative bg-muted/40">
          <ResumeCanvas template={template} font={font} />
        </div>
      </div>
      {previewOpen && (
        <PreviewModal onClose={() => setPreviewOpen(false)} template={template} font={font} />
      )}
    </div>
  );
}
