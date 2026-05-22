import type { PageMeta } from '~/types/api-spec'

export function parseListPageTotal(meta?: PageMeta | null): number | undefined {
  if (meta?.total == null) {
    return undefined
  }

  return Number.isFinite(meta.total) ? meta.total : undefined
}

export function formatRoleCode(roleCode?: string | null, fallback = 'Member') {
  if (!roleCode) {
    return fallback
  }

  return roleCode
    .split('_')
    .map(part => part.charAt(0) + part.slice(1).toLowerCase())
    .join(' ')
}

export function formatTableDate(value?: string | null) {
  if (!value) {
    return '—'
  }

  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
