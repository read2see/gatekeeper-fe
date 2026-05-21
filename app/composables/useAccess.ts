import type { Permission } from '~/types/access'
import {
  allOrgPermissions,
  hasPlatformStaffRole,
  isKnownOrgRole,
  normalizeOrgRoleCode,
  permissionsForOrgRole,
  permissionsForPlatformRoles
} from '~/config/permissions'
import { useOrgRoleCache } from '~/composables/useOrgRoleCache'

export function useAccess() {
  const auth = useAuth()
  const { getOrgRole: getCachedOrgRole } = useOrgRoleCache()

  const platformPermissions = computed(() => permissionsForPlatformRoles(auth.platformRoles.value))

  function hasPlatformRole(...roles: string[]) {
    return roles.some(role => auth.platformRoles.value.includes(role))
  }

  function isPlatformStaff() {
    return auth.isPlatformStaff.value
  }

  function resolveOrgRole(orgId: string) {
    const sessionRole = auth.getOrgRole(orgId)
    const cachedRole = getCachedOrgRole(orgId)

    if (isKnownOrgRole(sessionRole)) {
      return sessionRole
    }

    if (isKnownOrgRole(cachedRole)) {
      return cachedRole
    }

    return sessionRole ?? cachedRole
  }

  function hasOrgRole(orgId: string, ...roles: string[]) {
    const roleCode = resolveOrgRole(orgId)

    if (!roleCode) {
      return false
    }

    return roles.some(role => normalizeOrgRoleCode(role) === roleCode)
  }

  function isOrgMember(orgId: string) {
    return Boolean(resolveOrgRole(orgId))
      || auth.organizations.value.some(
        organization => organization.id === orgId || organization.id.toLowerCase() === orgId.toLowerCase()
      )
  }

  function permissionsForOrg(orgId: string) {
    const roleCode = resolveOrgRole(orgId)

    if (roleCode) {
      return permissionsForOrgRole(roleCode)
    }

    if (auth.isPlatformStaff.value) {
      return allOrgPermissions
    }

    return []
  }

  function allPermissions(orgId?: string) {
    const permissions = new Set<Permission>(platformPermissions.value)

    if (orgId) {
      for (const permission of permissionsForOrg(orgId)) {
        permissions.add(permission)
      }
    }

    return [...permissions]
  }

  function can(permission: Permission, orgId?: string) {
    return allPermissions(orgId).includes(permission)
  }

  function canAccessAdmin() {
    return hasPlatformStaffRole(auth.platformRoles.value)
  }

  function canAccessOrg(orgId: string) {
    return isOrgMember(orgId) || canAccessAdmin()
  }

  return {
    hasPlatformRole,
    isPlatformStaff,
    hasOrgRole,
    isOrgMember,
    permissionsForOrg,
    allPermissions,
    can,
    canAccessAdmin,
    canAccessOrg
  }
}
