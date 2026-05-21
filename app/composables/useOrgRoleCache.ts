import { normalizeOrgRoleCode } from '~/config/permissions'

export const ORG_ROLE_CACHE_KEY = 'org-role-by-id'

export function useOrgRoleCache() {
  const cache = useState<Record<string, string | undefined>>(ORG_ROLE_CACHE_KEY, () => ({}))

  function setOrgRole(orgId: string, roleCode?: string | null) {
    const normalized = normalizeOrgRoleCode(roleCode)

    if (!normalized) {
      return
    }

    cache.value = {
      ...cache.value,
      [orgId]: normalized
    }
  }

  function getOrgRole(orgId: string) {
    return cache.value[orgId]
  }

  return {
    cache,
    setOrgRole,
    getOrgRole
  }
}
