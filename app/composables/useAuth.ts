import type { LoginRequestBody } from '~/types/api-spec'
import { hasPlatformStaffRole, normalizeOrgRoleCode } from '~/config/permissions'
import { resolvePostLoginRedirect } from '~/utils/redirect'

export function useAuth() {
  const { loggedIn, user, session, ready, fetch, clear } = useUserSession()

  const platformRoles = computed(() => session.value?.platformRoles ?? [])
  const organizations = computed(() => session.value?.organizations ?? [])
  const isPlatformStaff = computed(() => hasPlatformStaffRole(platformRoles.value))
  const organizationCount = computed(() => organizations.value.length)

  function getOrgRole(orgId: string) {
    const organization = organizations.value.find(
      item => item.id === orgId || item.id.toLowerCase() === orgId.toLowerCase()
    )

    return normalizeOrgRoleCode(organization?.role_code)
  }

  async function login(body: LoginRequestBody) {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body
    })

    await fetch()

    return resolvePostLoginRedirect({
      platformRoles: platformRoles.value,
      organizations: organizations.value
    })
  }

  async function logout() {
    try {
      await $fetch('/api/auth/logout', { method: 'POST' })
    } finally {
      await clear()
    }
  }

  return {
    loggedIn,
    user,
    session,
    ready,
    fetch,
    platformRoles,
    organizations,
    isPlatformStaff,
    organizationCount,
    getOrgRole,
    login,
    logout
  }
}
