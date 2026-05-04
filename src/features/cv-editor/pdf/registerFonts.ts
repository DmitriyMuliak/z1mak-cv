import { Font } from '@react-pdf/renderer';

export type FontOption = 'roboto' | 'ptSerif';

export const FONT_OPTIONS: { value: FontOption; label: string }[] = [
  { value: 'roboto', label: 'Roboto' },
  { value: 'ptSerif', label: 'PT Serif' },
];

const FONT_FAMILY_MAP: Record<FontOption, string> = {
  roboto: 'Roboto',
  ptSerif: 'PT Serif',
};

export function getFontFamily(font: FontOption): string {
  return FONT_FAMILY_MAP[font];
}

// Google Fonts CDN — WOFF format, combined Latin+Cyrillic subset in one file.
// URLs are deterministic (kit hash derived from font content) and stable per font version.
const CDN: Record<FontOption, { regular: string; bold: string }> = {
  roboto: {
    regular:
      'https://fonts.gstatic.com/l/font?kit=KFOMCnqEu92Fr1ME7kSn66aGLdTylUAMQXC89YmC2DPNWubEbVmQiAw&skey=a0a0114a1dcab3ac&v=v51',
    bold: 'https://fonts.gstatic.com/l/font?kit=KFOMCnqEu92Fr1ME7kSn66aGLdTylUAMQXC89YmC2DPNWuYjalmQiAw&skey=a0a0114a1dcab3ac&v=v51',
  },
  ptSerif: {
    regular:
      'https://fonts.gstatic.com/l/font?kit=EJRVQgYoZZY2vCFuvAFSzrk&skey=e37119e9cd703ddf&v=v19',
    bold: 'https://fonts.gstatic.com/l/font?kit=EJRSQgYoZZY2vCFuvAnt66qWVy0&skey=f3f4fc2f289c7d5b&v=v19',
  },
};

const registered = new Set<FontOption>();

/**
 * Registers the requested font via Google Fonts CDN (WOFF, Latin+Cyrillic combined).
 * Safe to call multiple times — each font is registered only once per Worker lifetime.
 */
export function registerFonts(font: FontOption) {
  if (registered.has(font)) return;
  registered.add(font);

  Font.register({
    family: FONT_FAMILY_MAP[font],
    fonts: [{ src: CDN[font].regular }, { src: CDN[font].bold, fontWeight: 700 }],
  });
}
