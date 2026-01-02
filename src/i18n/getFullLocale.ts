/**
 * A map of language codes (ISO 639-1) to the most common locale codes (BCP 47).
 * This ensures that Intl.DateTimeFormat uses the most typical regional standards.
 */
export const LANGUAGE_TO_LOCALE_MAP: Record<string, string> = {
  // Slavic and Central European
  uk: 'uk-UA', // Ukrainian (Ukraine)
  pl: 'pl-PL', // Polish (Poland)
  de: 'de-DE', // German (Germany)

  // English
  en: 'en-US', // English (United States) - standard fallback if 'en-GB' is not specified

  // Other common locales
  fr: 'fr-FR', // French (France)
  es: 'es-ES', // Spanish (Spain)
  it: 'it-IT', // Italian (Italy)
  pt: 'pt-PT', // Portuguese (Portugal) - or 'pt-BR' for Brazil
  ja: 'ja-JP', // Japanese (Japan)
  zh: 'zh-CN', // Chinese (Mainland China)
};

/**
 * Converts a two-letter language code into a full locale code (BCP 47)
 * if known, or returns the original code.
 * @param locale The locale code provided by Next.js (e.g., 'uk').
 * @returns The full locale code (e.g., 'uk-UA').
 */
export const getFullLocale = (locale: string): string => {
  // If the code already contains a hyphen (e.g., 'en-GB' or 'uk-UA'), we consider it complete.
  if (locale.includes('-')) {
    return locale;
  }

  // Return the full code from the map or the original if not found (Intl API will handle it).
  return LANGUAGE_TO_LOCALE_MAP[locale] || locale;
};
