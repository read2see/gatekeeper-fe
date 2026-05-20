import type {
  ApiConsumerStatus,
  ApiConsumerType,
  ApiKeyStatus,
  ApiServiceStatus,
  HttpMethod,
  MembershipStatus,
  OrganizationStatus,
  RateLimitWindowUnit
} from '~/types/api-spec'

export type PlatformRole = 'PLATFORM_ADMIN' | 'PLATFORM_STAFF'

export interface PlatformRoleDefinition {
  id: string
  role_code: string
  name?: string
}

export interface PlatformRoleAssignment {
  id: string
  role_code: string
  assigned_at?: string
}

export type OrgRole = 'ORG_OWNER' | 'ORG_DEVELOPER' | 'ORG_VIEWER' | string

export interface Organization {
  id: string
  name: string
  slug: string
  status?: OrganizationStatus
  role_code?: string
  membership?: {
    role_code?: string
  }
  created_at?: string
  updated_at?: string
}

export function getOrganizationRoleCode(organization: Organization): string | undefined {
  return organization.role_code ?? organization.membership?.role_code
}

export interface AuthMeResponse {
  id: string
  email: string
  full_name: string
  email_verified: boolean
  has_avatar?: boolean
  platform_roles?: string[]
}

export interface UserProfile {
  id: string
  email: string
  full_name: string
  has_avatar?: boolean
  email_verified: boolean
  active?: boolean
  created_at?: string
  updated_at?: string
}

export interface UserProfile {
  id: string
  email: string
  full_name: string
  has_avatar?: boolean
  email_verified: boolean
  active?: boolean
  created_at?: string
  updated_at?: string
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

export interface AdminUser {
  id: string
  email: string
  full_name: string
  active?: boolean
  email_verified?: boolean
  platform_roles?: string[]
  created_at?: string
  updated_at?: string
  deleted_at?: string | null
}

export type AdminOrganization = Organization

export interface AdminHealth {
  status?: string
  version?: string
  uptime?: string | number
  timestamp?: string
}

export interface AnalyticsOverview {
  total_requests?: number
  error_requests?: number
  error_rate?: number
  avg_latency_ms?: number
  p95_latency_ms?: number
  rate_limited_requests?: number
  total_users?: number
  total_organizations?: number
  active_organizations?: number
  active_users?: number
  [key: string]: string | number | boolean | null | undefined
}

export type AdminAnalyticsOverview = AnalyticsOverview

export interface AnalyticsTimeSeriesPoint {
  bucket_start?: string
  bucket?: string
  timestamp?: string
  request_count?: number
  requests?: number
  error_count?: number
  errors?: number
  avg_latency_ms?: number
  latency_ms?: number
  [key: string]: string | number | boolean | null | undefined
}

export interface AnalyticsTimeSeries {
  points?: AnalyticsTimeSeriesPoint[]
  items?: AnalyticsTimeSeriesPoint[]
}

export interface AnalyticsBreakdownItem {
  id?: string
  label?: string
  name?: string
  organization_name?: string
  service_name?: string
  consumer_name?: string
  api_key_name?: string
  method?: string
  status_code?: number
  path?: string
  request_count?: number
  requests?: number
  count?: number
  error_count?: number
  avg_latency_ms?: number
  p95_latency_ms?: number
  [key: string]: string | number | boolean | null | undefined
}

export interface AnalyticsBreakdown {
  items?: AnalyticsBreakdownItem[]
}

export interface AdminUserMembership {
  organization_id: string
  organization_name?: string
  organization_slug?: string
  role_code?: string
  status?: string
}

export interface AdminOrganizationMember {
  id?: string
  user_id?: string
  email?: string
  full_name?: string
  role_code?: string
  status?: string
}

export interface AdminOrganizationMember {
  id?: string
  user_id?: string
  email?: string
  full_name?: string
  role_code?: string
  status?: string
}

export interface AdminUserInspection {
  user?: AdminUser
  id?: string
  email?: string
  full_name?: string
  active?: boolean
  email_verified?: boolean
  platform_roles?: string[]
  organizations?: OrganizationMembershipSummary[]
  memberships?: AdminUserMembership[]
  created_at?: string
  updated_at?: string
}

export interface AdminOrganizationInspection {
  organization?: AdminOrganization
  id?: string
  name?: string
  slug?: string
  status?: OrganizationStatus
  members?: AdminOrganizationMember[]
  memberships?: AdminOrganizationMember[]
  member_count?: number
  service_count?: number
  consumer_count?: number
  created_at?: string
  updated_at?: string
}

export interface ApiService {
  id: string
  name: string
  slug: string
  base_url: string
  status?: ApiServiceStatus
  internal_auth_header_name?: string
  created_at?: string
  updated_at?: string
}

export interface PostmanImportIssue {
  request_name: string
  reason: string
}

export interface PostmanImportResult {
  service: ApiService
  routes_created: number
  routes_updated: number
  routes_skipped: number
  issues: PostmanImportIssue[]
}

export interface ApiConsumer {
  id: string
  name: string
  type: ApiConsumerType
  status?: ApiConsumerStatus
  created_at?: string
  updated_at?: string
}

export interface Membership {
  id: string
  user_id?: string
  email?: string
  full_name?: string
  role_code: string
  status?: MembershipStatus
  created_at?: string
  updated_at?: string
}

export interface OrganizationInvitePreview {
  email?: string
  role_code?: string
  organization?: { id: string; name: string; slug?: string }
  expires_at?: string
}

export interface OrganizationInvite {
  id: string
  email: string
  role_code: string
  organization_id?: string
  status?: string
  created_at?: string
  expires_at?: string
}

export interface OrganizationInviteResult {
  type: 'MEMBERSHIP' | 'INVITE'
  membership?: Membership
  invite?: OrganizationInvite
}

export interface RouteRule {
  id: string
  method: HttpMethod
  path_pattern: string
  required_scope: string
  active?: boolean
  created_at?: string
  updated_at?: string
}

export interface ApiKey {
  id: string
  name: string
  consumer_id: string
  consumer_name?: string
  status?: ApiKeyStatus
  scopes?: string[]
  expires_at?: string | null
  created_at?: string
  updated_at?: string
  key?: string
}

export interface UsageLog {
  id: string
  service_id?: string
  consumer_id?: string
  api_key_id?: string
  method?: HttpMethod
  path?: string
  status_code?: number
  latency_ms?: number
  rate_limited?: boolean
  error_code?: string
  created_at?: string
}

export interface RateLimitPolicy {
  id: string
  request_limit: number
  window_unit: RateLimitWindowUnit
  window_size: number
  active?: boolean
  created_at?: string
  updated_at?: string
}
