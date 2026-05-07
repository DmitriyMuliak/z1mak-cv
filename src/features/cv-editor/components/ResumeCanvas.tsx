'use client';

import { useRef, useState, useLayoutEffect } from 'react';
import { TransformWrapper, TransformComponent, useControls } from 'react-zoom-pan-pinch';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { ResumePreview } from './ResumePreview';
import { A4_WIDTH, A4_HEIGHT } from './ResumePreview';
import type { TemplateStyle, FontOption } from '../hooks/usePdfExport';

function ZoomControls() {
  const { zoomIn, zoomOut, centerView } = useControls();
  const t = useTranslations('cvEditor');

  return (
    <div className="absolute top-4 right-4 flex items-center gap-1 z-10 bg-background/80 backdrop-blur-sm border border-border rounded-lg p-1 shadow-sm">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => zoomIn(0.2)}
        title={t('buttons.zoomIn')}
        aria-label={t('buttons.zoomIn')}
      >
        <ZoomIn size={15} />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => zoomOut(0.2)}
        title={t('buttons.zoomOut')}
        aria-label={t('buttons.zoomOut')}
      >
        <ZoomOut size={15} />
      </Button>
      <div className="w-px h-4 bg-border mx-0.5" />
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => centerView()}
        title={t('buttons.fitView')}
        aria-label={t('buttons.fitView')}
      >
        <Maximize2 size={15} />
      </Button>
    </div>
  );
}

interface ResumeCanvasProps {
  template?: TemplateStyle;
  font?: FontOption;
}

const CANVAS_PADDING = 48;

export function ResumeCanvas({ template, font }: ResumeCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [initialScale, setInitialScale] = useState<number | null>(null);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    const scale = Math.min(
      (width - CANVAS_PADDING * 2) / A4_WIDTH,
      (height - CANVAS_PADDING * 2) / A4_HEIGHT,
    );
    setInitialScale(Math.min(Math.max(scale, 0.3), 2));
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0">
      {initialScale !== null && (
        <TransformWrapper
          centerOnInit
          limitToBounds={false}
          minScale={0.3}
          initialScale={initialScale}
          maxScale={6}
          wheel={{ step: 0.001 }}
        >
          <TransformComponent
            wrapperClass="!w-full !h-full"
            contentStyle={{ padding: CANVAS_PADDING }}
          >
            <div className="flex flex-col gap-10">
              <ResumePreview template={template} font={font} />
            </div>
          </TransformComponent>
          <ZoomControls />
        </TransformWrapper>
      )}
    </div>
  );
}
