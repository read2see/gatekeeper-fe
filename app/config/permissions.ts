import type { Permission } from '~/types/access'

export const PLATFORM_STAFF_ROLES = ['PLATFORM_ADMIN', 'PLATFORM_STAFF'] as const

export const platformRolePermissions: Record<string, Permission[]> = {
  PLATFORM_ADMIN: [
    'admin:access',
    'admin:users:read',
    'admin:organizations:read'
  ],
  PLATFORM_STAFF: [
    'admin:access',
    'admin:users:read',
    'admin:organizations:read'
  ]
}

export const orgRolePermissions: Record<string, Permission[]> = {
  ORG_OWNER: [
    'org:read',
    'org:manage',
    'org:members:manage',
    'org:services:manage',
    'org:consumers:manage',
    'org:consumers:deactivate',
    'org:analytics:read'
  ],
  ORG_DEVELOPER: [
    'org:read',
    'org:services:manage',
    'org:consumers:manage',
    'org:analytics:read'
  ],
  ORG_VIEWER: [
    'org:read',
    'org:analytics:read'
  ]
}

const orgRoleAliases: Record<string, keyof typeof orgRolePermissions> = {
  ADMIN: 'ORG_OWNER',
  ORGANIZATION_ADMIN: 'ORG_OWNER',
  ORG_ADMIN: 'ORG_OWNER',
  OWNER: 'ORG_OWNER',
  MEMBER: 'ORG_VIEWER',
  ORGANIZATION_MEMBER: 'ORG_VIEWER',
  ORG_MEMBER: 'ORG_VIEWER'
}

export const allOrgPermissions = [...new Set(
  Object.values(orgRolePermissions).flat()
)] as Permission[]

export function normalizeOrgRoleCode(roleCode?: string | null): string | undefined {
  if (!roleCode?.trim()) {
    return undefined
  }

  const normalized = roleCode.trim().toUpperCase()

  if (normalized in orgRolePermissions) {
    return normalized
  }

  return orgRoleAliases[normalized] ?? normalized
}

export function isKnownOrgRole(roleCode?: string | null): boolean {
  const normalized = normalizeOrgRoleCode(roleCode)
  return Boolean(normalized && normalized in orgRolePermissions)
}

export function permissionsForPlatformRoles(roles: string[]): Permission[] {
  const permissions = new Set<Permission>()

  for (const role of roles) {
    for (const permission of platformRolePermissions[role] ?? []) {
      permissions.add(permission)
    }
  }

  return [...permissions]
}

export function permissionsForOrgRole(roleCode?: string | null): Permission[] {
  const normalized = normalizeOrgRoleCode(roleCode)

  if (!normalized) {
    return []
  }

  return orgRolePermissions[normalized] ?? ['org:read']
}

export function hasPlatformStaffRole(roles: string[]): boolean {
  return roles.some(role => PLATFORM_STAFF_ROLES.includes(role as typeof PLATFORM_STAFF_ROLES[number]))
}
