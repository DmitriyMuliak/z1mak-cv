export type TextRun = {
  text: string;
  bold?: boolean;
  italic?: boolean;
};

export type HtmlTextNode =
  | { type: 'paragraph'; runs: TextRun[] }
  | { type: 'bullet'; runs: TextRun[] }
  | { type: 'ordered'; runs: TextRun[]; n: number };

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#\d+;/g, '');
}

function parseRuns(html: string, bold = false, italic = false): TextRun[] {
  const runs: TextRun[] = [];
  // 1. Known inline formatting tags  2. Any other tag (skip it)  3. Plain text
  const re = /<(strong|b|em|i|s|code)[^>]*>([\s\S]*?)<\/\1>|<[^>]+>|([^<]+)/gi;
  let m: RegExpExecArray | null;

  while ((m = re.exec(html)) !== null) {
    if (m[3] !== undefined) {
      // Plain text segment
      const text = decodeEntities(m[3]);
      if (text) runs.push({ text, ...(bold && { bold }), ...(italic && { italic }) });
    } else if (m[1]) {
      // Known inline tag — recurse with updated formatting flags
      const tag = m[1].toLowerCase();
      const inner = m[2];
      const isBold = bold || tag === 'strong' || tag === 'b';
      const isItalic = italic || tag === 'em' || tag === 'i';
      runs.push(...parseRuns(inner, isBold, isItalic));
    }
    // m[2] without m[1] = unrecognised tag matched by <[^>]+> — silently skip
  }

  return runs;
}

export function htmlToTextNodes(html: string | undefined): HtmlTextNode[] {
  if (!html) return [];
  const nodes: HtmlTextNode[] = [];

  const blockRe = /<(p|ul|ol|h[1-6]|blockquote)[^>]*>([\s\S]*?)<\/\1>/gi;
  let m: RegExpExecArray | null;

  while ((m = blockRe.exec(html)) !== null) {
    const tag = m[1].toLowerCase();
    const inner = m[2];

    if (tag === 'ul') {
      const liRe = /<li[^>]*>([\s\S]*?)<\/li>/gi;
      let li: RegExpExecArray | null;
      while ((li = liRe.exec(inner)) !== null) {
        const runs = parseRuns(li[1]);
        if (runs.length) nodes.push({ type: 'bullet', runs });
      }
    } else if (tag === 'ol') {
      const liRe = /<li[^>]*>([\s\S]*?)<\/li>/gi;
      let li: RegExpExecArray | null;
      let n = 1;
      while ((li = liRe.exec(inner)) !== null) {
        const runs = parseRuns(li[1]);
        if (runs.length) nodes.push({ type: 'ordered', runs, n: n++ });
      }
    } else {
      const runs = parseRuns(inner);
      if (runs.length) nodes.push({ type: 'paragraph', runs });
    }
  }

  return nodes;
}

/** Convenience: collapse runs to plain string (useful for testing / fallback). */
export function runsToText(runs: TextRun[]): string {
  return runs.map((r) => r.text).join('');
}
