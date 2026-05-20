export function formatRoleCode(roleCode?: string | null, fallback = 'Member') {
  if (!roleCode) {
    return fallback
  }

  return roleCode
    .split('_')
    .map(part => part.charAt(0) + part.slice(1).toLowerCase())
    .join(' ')
}
