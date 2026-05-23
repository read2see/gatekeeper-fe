import { apiSpec } from '~/types/api-spec'
import type {
  AssignPlatformRoleRequestBody,
  ListResponse,
  OrganizationStatus,
  PageQuery,
  PlatformAnalyticsQuery
} from '~/types/api-spec'
import type {
  AdminAnalyticsOverview,
  AdminHealth,
  AdminOrganization,
  AdminOrganizationInspection,
  AdminUser,
  AdminUserInspection,
  PlatformRoleAssignment,
  PlatformRoleDefinition
} from '~/types/domain'

export interface AdminUserListQuery extends PageQuery {
  id?: string
  email?: string
  fullName?: string
  active?: boolean
  emailVerified?: boolean
  includeDeleted?: boolean
  search?: string
}

export interface AdminOrganizationListQuery extends PageQuery {
  id?: string
  name?: string
  slug?: string
  status?: OrganizationStatus
  search?: string
}

export function useAdmin() {
  const api = useApiClient()

  function getHealth() {
    return api.get<AdminHealth>(apiSpec.admin.health.path)
  }

  function getAnalyticsOverview(query?: PlatformAnalyticsQuery) {
    return api.get<AdminAnalyticsOverview>(apiSpec.admin.analyticsOverview.path, {
      query: query as Record<string, unknown> | undefined
    })
  }

  function listUsers(query?: AdminUserListQuery) {
    return api.get<ListResponse<AdminUser>>(apiSpec.admin.users.path, {
      query: query as Record<string, unknown> | undefined
    })
  }

  function getUser(userId: string) {
    return api.get<AdminUser>(apiSpec.admin.user.path, {
      params: { userId }
    })
  }

  function suspendUser(userId: string) {
    return api.post<AdminUser>(apiSpec.admin.suspendUser.path, {
      params: { userId }
    })
  }

  function reactivateUser(userId: string) {
    return api.post<AdminUser>(apiSpec.admin.reactivateUser.path, {
      params: { userId }
    })
  }

  function deleteUser(userId: string) {
    return api.delete<AdminUser>(apiSpec.admin.deleteUser.path, {
      params: { userId }
    })
  }

  function listOrganizations(query?: AdminOrganizationListQuery) {
    return api.get<ListResponse<AdminOrganization>>(apiSpec.admin.organizations.path, {
      query: query as Record<string, unknown> | undefined
    })
  }

  function getOrganization(organizationId: string) {
    return api.get<AdminOrganization>(apiSpec.admin.organization.path, {
      params: { organizationId }
    })
  }

  function suspendOrganization(organizationId: string) {
    return api.post<AdminOrganization>(apiSpec.admin.suspendOrganization.path, {
      params: { organizationId }
    })
  }

  function reactivateOrganization(organizationId: string) {
    return api.post<AdminOrganization>(apiSpec.admin.reactivateOrganization.path, {
      params: { organizationId }
    })
  }

  function inspectUser(userId: string) {
    return api.get<AdminUserInspection>(apiSpec.admin.inspectUser.path, {
      params: { userId }
    })
  }

  function inspectOrganization(organizationId: string) {
    return api.get<AdminOrganizationInspection>(apiSpec.admin.inspectOrganization.path, {
      params: { organizationId }
    })
  }

  function listPlatformRoles() {
    return api.get<ListResponse<PlatformRoleDefinition>>(apiSpec.admin.roles.path)
  }

  function getUserRoles(userId: string) {
    return api.get<ListResponse<PlatformRoleAssignment>>(apiSpec.admin.userRoles.path, {
      params: { userId }
    })
  }

  function assignUserRole(userId: string, body: AssignPlatformRoleRequestBody) {
    return api.post<PlatformRoleAssignment>(apiSpec.admin.assignUserRole.path, {
      params: { userId },
      body
    })
  }

  function removeUserRole(userId: string, roleId: string) {
    return api.delete<void>(apiSpec.admin.removeUserRole.path, {
      params: { userId, roleId }
    })
  }

  return {
    getHealth,
    getAnalyticsOverview,
    listUsers,
    getUser,
    suspendUser,
    reactivateUser,
    deleteUser,
    listOrganizations,
    getOrganization,
    suspendOrganization,
    reactivateOrganization,
    inspectUser,
    inspectOrganization,
    listPlatformRoles,
    getUserRoles,
    assignUserRole,
    removeUserRole
  }
}
