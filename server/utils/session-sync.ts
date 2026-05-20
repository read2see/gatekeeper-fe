import { normalizeOrgRoleCode } from '~/config/permissions'
import type { AuthMeResponse, OrganizationMembershipSummary, SessionSyncPayload } from '~/types/domain'
import type { ListResponse } from '~/types/api-spec'

interface OrganizationRoleRef {
  role_code?: string
  code?: string
}

interface OrganizationListItem {
  id: string
  name: string
  slug: string
  role_code?: string
  membership?: {
    role_code?: string
    role?: OrganizationRoleRef
  }
  role?: OrganizationRoleRef
}

function extractOrganizationRoleCode(item: OrganizationListItem): string | undefined {
  return item.role_code
    ?? item.membership?.role_code
    ?? item.membership?.role?.role_code
    ?? item.membership?.role?.code
    ?? item.role?.role_code
    ?? item.role?.code
}

function toOrganizationSummary(item: OrganizationListItem): OrganizationMembershipSummary | null {
  const roleCode = normalizeOrgRoleCode(extractOrganizationRoleCode(item))
  if (!roleCode) {
    return null
  }

  return {
    id: item.id,
    name: item.name,
    slug: item.slug,
    role_code: roleCode
  }
}

async function userHasAvatar(userId: string, backendCookie: string): Promise<boolean> {
  const config = useRuntimeConfig()

  try {
    const response = await $fetch.raw(`${config.gatekeeperApiBase}/api/users/${userId}/avatar`, {
      method: 'HEAD',
      headers: { cookie: backendCookie }
    })

    return response.status === 200
  } catch {
    return false
  }
}

export async function syncSessionFromBackend(backendCookie: string): Promise<SessionSyncPayload> {
  const meResult = await gatekeeperFetchWithCookie<AuthMeResponse>('/api/auth/me', backendCookie)
  const orgsResult = await gatekeeperFetchWithCookie<ListResponse<OrganizationListItem>>(
    '/api/organizations',
    backendCookie,
    { query: { size: 100 } }
  )

  const me = meResult.data
  const hasAvatar = me.has_avatar ?? await userHasAvatar(me.id, backendCookie)

  return {
    user: {
      id: me.id,
      email: me.email,
      full_name: me.full_name,
      email_verified: me.email_verified,
      has_avatar: hasAvatar
    },
    platformRoles: [...new Set(me.platform_roles ?? [])],
    organizations: dedupeOrganizations(
      (orgsResult.data.items ?? [])
        .map(toOrganizationSummary)
        .filter((item): item is OrganizationMembershipSummary => item !== null)
    )
  }
}

function dedupeOrganizations(
  organizations: OrganizationMembershipSummary[]
): OrganizationMembershipSummary[] {
  const seen = new Set<string>()

  return organizations.filter((organization) => {
    if (seen.has(organization.id)) {
      return false
    }

    seen.add(organization.id)
    return true
  })
}

export async function setGatekeeperUserSession(
  event: Parameters<typeof replaceUserSession>[0],
  backendCookie: string
) {
  const sessionPayload = await syncSessionFromBackend(backendCookie)

  await replaceUserSession(event, {
    user: sessionPayload.user,
    platformRoles: sessionPayload.platformRoles,
    organizations: sessionPayload.organizations,
    loggedInAt: new Date().toISOString(),
    secure: {
      backendCookie
    }
  })

  return sessionPayload
}
