export const baseNormalizeText = (text: string) => {
  return text
    .replace(/\r\n/g, '\n') // unify
    .replace(/\t/g, ' ') // tabs to space
    .replace(/[ \t]+$/gm, '') // trailing spaces per line
    .replace(/\n{3,}/g, '\n\n') // collapse 3+ empty lines to 2 (one blank line)
    .replace(/\n[ \t]+(?=[•\-*\u2022])/g, '\n') // remove leading spaces before bullets
    .trim();
};

/*
  For the best result, it is worth separating the logic. DOCX and PDF have fundamentally different garbage structures.

  DOCX (XML) is structured data. The main problem there is not to break words that are broken by formatting tags (for example, when one letter is bold), and at the same time not to glue paragraphs.

  PDF is visual data. The main problem there is unnecessary line breaks inside a sentence and strange spaces.

  Here is the best combination of functions for our case.
  This function is suitable for the final "polishing" of text from both sources.
*/
export const finalNormalizeText = (text: string) => {
  return (
    text
      // 1. Заміна нерозривних пробілів (NBSP) та інших дивних пробілів на звичайні
      .replace(/[\u00A0\u1680\u180E\u2000-\u200B\u202F\u205F\u3000\uFEFF]/g, ' ')
      // 2. Прибираємо м'які переноси (soft hyphens), які часто бувають в PDF
      .replace(/\u00AD/g, '')
      // 3. Tabs to spaces
      .replace(/\t/g, ' ')
      // 4. Unify newlines (win/linux)
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      // 5. Прибираємо пробіли в кінці кожного рядка
      .replace(/[ ]+$/gm, '')
      // 6. Сплющуємо 3+ порожніх рядків до 2 (абзацний відступ)
      .replace(/\n{3,}/g, '\n\n')
      // 7. (Опціонально) Фікс для списків: прибираємо пробіл перед булітом на новому рядку
      .replace(/\n[ ]+(?=[•\-*\u2022])/g, '\n')
      .trim()
  );
};
