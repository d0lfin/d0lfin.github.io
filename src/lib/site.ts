export const DEFAULT_SITE_URL = "https://aemelin.ru";

export function getSiteUrl(site: URL | undefined): URL {
  return site ?? new URL(DEFAULT_SITE_URL);
}

export function toAbsoluteUrl(value: string, site: URL): string {
  if (/^https?:\/\//i.test(value)) {
    return value;
  }
  return new URL(value, site).toString();
}
