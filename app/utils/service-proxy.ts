export function buildServiceProxyUrl(
  orgSlug: string,
  serviceSlug: string,
  apiBase: string
): string {
  const base = apiBase.replace(/\/$/, '')
  return `${base}/gateway/${orgSlug}/${serviceSlug}/`
}
