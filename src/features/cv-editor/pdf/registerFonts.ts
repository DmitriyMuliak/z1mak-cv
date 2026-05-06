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

// Google Fonts CDN — TTF format, full Unicode (Latin + Cyrillic), v51/v19.
const CDN: Record<
  FontOption,
  { regular: string; italic: string; bold: string; boldItalic: string }
> = {
  roboto: {
    regular:
      'https://fonts.gstatic.com/s/roboto/v51/KFOMCnqEu92Fr1ME7kSn66aGLdTylUAMQXC89YmC2DPNWubEbWmT.ttf',
    italic:
      'https://fonts.gstatic.com/s/roboto/v51/KFOKCnqEu92Fr1Mu53ZEC9_Vu3r1gIhOszmOClHrs6ljXfMMLoHQiA8.ttf',
    bold: 'https://fonts.gstatic.com/s/roboto/v51/KFOMCnqEu92Fr1ME7kSn66aGLdTylUAMQXC89YmC2DPNWuYjammT.ttf',
    boldItalic:
      'https://fonts.gstatic.com/s/roboto/v51/KFOKCnqEu92Fr1Mu53ZEC9_Vu3r1gIhOszmOClHrs6ljXfMMLmbXiA8.ttf',
  },
  ptSerif: {
    regular: 'https://fonts.gstatic.com/s/ptserif/v19/EJRVQgYoZZY2vCFuvDFR.ttf',
    italic: 'https://fonts.gstatic.com/s/ptserif/v19/EJRTQgYoZZY2vCFuvAFTzro.ttf',
    bold: 'https://fonts.gstatic.com/s/ptserif/v19/EJRSQgYoZZY2vCFuvAnt65qV.ttf',
    boldItalic: 'https://fonts.gstatic.com/s/ptserif/v19/EJRQQgYoZZY2vCFuvAFT9gaQVy4.ttf',
  },
};

const registered = new Set<FontOption>();

/**
 * Registers the requested font via Google Fonts CDN (TTF, full Unicode).
 * Includes all 4 variants: regular, italic, bold, bold-italic.
 * Safe to call multiple times — each font is registered only once per Worker lifetime.
 */
export function registerFonts(font: FontOption) {
  if (registered.has(font)) return;
  registered.add(font);

  Font.register({
    family: FONT_FAMILY_MAP[font],
    fonts: [
      { src: CDN[font].regular },
      { src: CDN[font].italic, fontStyle: 'italic' },
      { src: CDN[font].bold, fontWeight: 700 },
      { src: CDN[font].boldItalic, fontWeight: 700, fontStyle: 'italic' },
    ],
  });
}
