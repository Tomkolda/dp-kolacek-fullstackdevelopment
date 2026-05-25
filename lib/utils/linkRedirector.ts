export function normalizeLinkRedirectPath(path: string): string {
  return path.trim().replace(/^\/+/, '').replace(/\/+$/, '');
}

export function validateLinkRedirectPath(path: string): string | null {
  const normalizedPath = normalizeLinkRedirectPath(path);

  if (!normalizedPath) return 'Cesta je povinná.';
  if (normalizedPath.includes('/')) {
    return 'Cesta může obsahovat jen jeden segment bez dalších lomítek.';
  }

  return null;
}
