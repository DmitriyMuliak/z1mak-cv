'use client';
import { useOfflineLogger } from '@/hooks/useOfflineLogger';
import { loadValidatorLocale } from '@/lib/validator/loadValidatorLocale';
import { useLocale } from 'next-intl';
import React, { useEffect } from 'react';

export const Configurator: React.FC = () => {
  const locale = useLocale();

  useEffect(() => {
    loadValidatorLocale(locale);
  }, [locale]);

  useOfflineLogger();

  return null;
};
