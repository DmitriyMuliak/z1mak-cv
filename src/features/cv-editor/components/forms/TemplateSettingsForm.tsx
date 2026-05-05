'use client';

import { useTranslations } from 'next-intl';
import { useTemplateSettingsStore, TEMPLATE_OPTIONS } from '../../store/templateSettingsStore';
import { FONT_OPTIONS } from '../../pdf/registerFonts';

export function TemplateSettingsForm() {
  const t = useTranslations('cvEditor');
  const template = useTemplateSettingsStore((s) => s.template);
  const font = useTemplateSettingsStore((s) => s.font);
  const setTemplate = useTemplateSettingsStore((s) => s.setTemplate);
  const setFont = useTemplateSettingsStore((s) => s.setFont);

  return (
    <div className="space-y-6 py-2">
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-foreground">{t('templates.title')}</legend>
        <div className="grid grid-cols-2 gap-2">
          {TEMPLATE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setTemplate(opt.value)}
              className={[
                'rounded-md border px-3 py-2 text-sm text-left transition-colors',
                template === opt.value
                  ? 'border-primary bg-primary/5 text-primary font-medium'
                  : 'border-border text-muted-foreground hover:border-foreground/40',
              ].join(' ')}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-foreground">{t('fonts.title')}</legend>
        <div className="grid grid-cols-2 gap-2">
          {FONT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setFont(opt.value)}
              className={[
                'rounded-md border px-3 py-2 text-sm text-left transition-colors',
                font === opt.value
                  ? 'border-primary bg-primary/5 text-primary font-medium'
                  : 'border-border text-muted-foreground hover:border-foreground/40',
              ].join(' ')}
            >
              <span
                style={{
                  fontFamily: opt.value === 'ptSerif' ? 'Georgia, serif' : 'sans-serif',
                }}
              >
                {opt.label}
              </span>
              <span
                className="block text-xs text-muted-foreground mt-0.5 font-normal"
                style={{ fontFamily: 'inherit' }}
              >
                {opt.value === 'roboto' ? t('fonts.sansSerif') : t('fonts.serif')}
              </span>
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground pt-1">{t('fonts.supportNote')}</p>
      </fieldset>
    </div>
  );
}
