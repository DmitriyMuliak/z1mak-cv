import React from 'react';
import { ModeSelect, ModeOption } from './ModeSelect';
import type { Mode } from '../store/useCvStore';
import { useTranslations } from 'next-intl';

type Props = {
  mode: Mode;
  onChange: (m: Props['mode']) => void;
};

export const ModeBar: React.FC<Props> = ({ mode, onChange }) => {
  const t = useTranslations('pages.cvChecker.modeBar');

  const updateMode = (key: keyof Mode, value: string) => {
    onChange({ ...mode, [key]: value });
  };

  const EVALUATION_OPTIONS: ModeOption[] = [
    { value: 'general', label: t('evaluation.items.general') },
    { value: 'byJob', label: t('evaluation.items.byJob') },
  ];

  const DOMAIN_OPTIONS: ModeOption[] = [
    { value: 'it', label: t('domain.items.it') },
    { value: 'general', label: t('domain.items.general') },
  ];

  const DEPTH_OPTIONS: ModeOption[] = [
    { value: 'standard', label: t('depth.items.standard') },
    { value: 'deep', label: t('depth.items.deep') },
  ];

  return (
    <div className="flex flex-col gap-3 items-center md:flex-row">
      <ModeSelect
        label={t('evaluation.title')}
        value={mode.evaluationMode}
        options={EVALUATION_OPTIONS}
        onValueChange={(v) => updateMode('evaluationMode', v)}
      />

      <ModeSelect
        label={t('domain.title')}
        value={mode.domain}
        options={DOMAIN_OPTIONS}
        onValueChange={(v) => updateMode('domain', v)}
      />

      <ModeSelect
        label={t('depth.title')}
        value={mode.depth}
        options={DEPTH_OPTIONS}
        onValueChange={(v) => updateMode('depth', v)}
      />
    </div>
  );
};
