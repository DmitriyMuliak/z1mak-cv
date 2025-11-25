importScripts('https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js');

self.onmessage = async (e) => {
  // Fallback/Safety check: sometimes e.data is passed directly as a buffer, sometimes as a {buffer} object
  const buffer = e.data.buffer || e.data;

  try {
    const zip = await JSZip.loadAsync(buffer);
    const document = zip.file('word/document.xml');

    if (!document) {
      postMessage({ error: 'invalid_docx_structure' });
      return;
    }

    const xmlText = await document.async('string');

    const text = xmlText
      // 1. Structural elements
      // </w:p> - end of paragraph -> two newlines for block separation
      .replace(/<\/w:p>/g, '\n\n')
      // <w:br/> - soft line break (Shift+Enter) -> single newline
      .replace(/<w:br\s*\/?>/g, '\n')
      // <w:tab/> - tab -> 4 spaces (or \t, but spaces are safer for NLP)
      .replace(/<w:tab\s*\/?>/g, '    ')
      // <w:tr> - end of table row -> newline (to prevent rows from merging)
      .replace(/<\/w:tr>/g, '\n')

      // 2. Remove all XML tags
      // Important: remove tags AFTER processing structural elements
      .replace(/<[^>]+>/g, '')

      // 3. Decode HTML entities
      // This is critical for resume/CV text
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&nbsp;/g, ' ');

    postMessage({ text });
  } catch (err) {
    console.error('Worker Error:', err);
    postMessage({ error: 'failed_to_parse_docx' });
  }
};
