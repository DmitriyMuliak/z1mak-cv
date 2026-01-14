export async function buildJobId(file: File, extractedText: string) {
  const enc = new TextEncoder();
  const data = enc.encode(extractedText);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 16);
  const safeName = file.name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_\-\.]/g, '');
  return `${safeName}-${file.size}-${hashHex}`;
}
