export interface AuthMeResponse {
  id: string
  email: string
  full_name: string
  email_verified: boolean
  has_avatar?: boolean
  platform_roles?: string[]
}

export interface OrganizationMembershipSummary {
  id: string
  name: string
  slug: string
  role_code: string
}

export interface SessionSyncPayload {
  user: {
    id: string
    email: string
    full_name: string
    email_verified: boolean
    has_avatar?: boolean
  }
  platformRoles: string[]
  organizations: OrganizationMembershipSummary[]
}

export interface OrganizationInvitePreview {
  email?: string
  role_code?: string
  organization?: { id: string, name: string, slug?: string }
  expires_at?: string
}
