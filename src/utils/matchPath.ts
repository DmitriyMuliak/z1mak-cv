type Pattern = string;

// check is second segment is locale:
// en | uk | de-DE | az-Latn-AZ .etc
function stripLocale(path: string): string {
  const parts = path.split('/').filter(Boolean);

  if (/^[a-z]{2}(-[A-Za-z0-9]+)*$/i.test(parts[0])) {
    parts.shift();
  }

  return '/' + parts.join('/');
}

// ✅ force leading slash + ✅ remove trailing slash
const normalize = (p: string) => '/' + p.split('/').filter(Boolean).join('/');

function matchPath(pathBase: string, patternBase: Pattern): boolean {
  const path = normalize(stripLocale(pathBase));
  const pattern = normalize(patternBase);

  const pathParts = path.split('/').filter(Boolean);
  const patternParts = pattern.split('/').filter(Boolean);

  for (let i = 0; i < patternParts.length; i++) {
    const pp = patternParts[i];
    const pt = pathParts[i];

    if (pp === '*') return true; // wildcard end
    if (!pt) return false; // path ended but pattern not
    if (pp.startsWith('$')) continue; // dynamic param
    if (pp !== pt) return false; // literal mismatch
  }

  return patternParts.length === pathParts.length;
}

export function isPublic(path: string, patterns: Pattern[]): boolean {
  return patterns.some((p) => matchPath(path, p));
}

// // Add tests
// // const publicPatterns = [
// //   '/',
// //   '/about',
// //   '/about/*',
// //   '/about/$id/*',
// //   '/contact',
// //   '/login'
// // ];

// // isPublic('/en/about', publicPatterns)            // ✅ true
// // isPublic('/en-US/about/', publicPatterns)        // ✅ true
// // isPublic('/ua/about/page/123', publicPatterns)   // ✅ true
// // isPublic('/about/abc/edit', publicPatterns)      // ❌ false
// // isPublic('/en/about/42/edit/x', publicPatterns)  // ✅ true (because /about/$id/*)
// // isPublic('/login', publicPatterns)               // ✅ true
// // isPublic('/en/login/', publicPatterns)           // ✅ true
