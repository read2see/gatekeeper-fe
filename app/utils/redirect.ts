import { PLATFORM_STAFF_ROLES } from '~/config/permissions'

export interface PostLoginRedirectInput {
  platformRoles?: string[]
  organizations?: Array<{ id: string }>
}

export function resolvePostLoginRedirect(input?: PostLoginRedirectInput): string {
  const platformRoles = input?.platformRoles ?? []
  const organizations = input?.organizations ?? []

  if (platformRoles.some(role => PLATFORM_STAFF_ROLES.includes(role as typeof PLATFORM_STAFF_ROLES[number]))) {
    return '/admin'
  }

  if (organizations.length === 1) {
    return `/org/${organizations[0]!.id}`
  }

  return '/app/organizations'
}

export function requiresAuthentication(path: string): boolean {
  if (path.startsWith('/auth')) {
    return false
  }

  return path.startsWith('/app') || path.startsWith('/admin') || path.startsWith('/org')
}

export function isGuestOnlyPath(path: string): boolean {
  return path.startsWith('/auth') && path !== '/auth/invite'
}
