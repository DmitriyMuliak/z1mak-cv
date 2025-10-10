'use client';
import { loadValidatorLocale } from '@/lib/validator/loadValidatorLocale';
import { useLocale } from 'next-intl';
import React from 'react';

export const Configurator: React.FC = () => {
  const locale = useLocale();

  loadValidatorLocale(locale);

  return null;
};
