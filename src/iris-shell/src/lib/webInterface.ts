export function objectUrl(baseUrl: string | undefined, distinguishedName: string): string | undefined {
  if (!baseUrl || !distinguishedName.trim()) return undefined;
  try {
    const url = new URL(baseUrl);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return undefined;
    url.pathname = `${url.pathname.replace(/\/+$/, '')}/redirect.ashx`;
    url.search = '';
    url.hash = '';
    url.searchParams.set('dn', distinguishedName);
    return url.toString();
  } catch {
    return undefined;
  }
}