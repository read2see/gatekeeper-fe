import { useOrgRoleCache } from '~/composables/useOrgRoleCache'
import { getOrganizationRoleCode } from '~/types/domain'

export function useOrgContext() {
  const route = useRoute()
  const auth = useAuth()
  const access = useAccess()
  const { setOrgRole } = useOrgRoleCache()
  const { getOrganization } = useOrganizations()

  const organizationId = computed(() => route.params.organizationId as string)
  const orgBasePath = computed(() => `/org/${organizationId.value}`)
  const roleCode = computed(() => auth.getOrgRole(organizationId.value))

  const { data: organization, pending, error, refresh } = useAsyncData(
    () => `org-context-${organizationId.value}`,
    () => getOrganization(organizationId.value),
    { watch: [organizationId] }
  )

  const organizationName = computed(() => organization.value?.name)
  const membershipRole = computed(() =>
    getOrganizationRoleCode(organization.value ?? { id: organizationId.value, name: '', slug: '' })
  )

  watch([organizationId, membershipRole], () => {
    setOrgRole(organizationId.value, membershipRole.value)
  }, { immediate: true })

  function can(permission: Parameters<typeof access.can>[0]) {
    return access.can(permission, organizationId.value)
  }

  return {
    organizationId,
    orgBasePath,
    organization,
    organizationName,
    roleCode,
    membershipRole,
    pending,
    error,
    refresh,
    can
  }
}
