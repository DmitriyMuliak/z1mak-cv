import * as v from 'valibot';

const map: Record<string, string> = {
  en: '@valibot/i18n/en',
  uk: '@valibot/i18n/uk',
};

export async function loadValidatorLocale(locale: string) {
  try {
    const path = map[locale] || map.en;
    await import(path);

    v.setGlobalConfig({ lang: locale });
  } catch (_e) {
    v.setGlobalConfig({ lang: 'en' });
  }
}
