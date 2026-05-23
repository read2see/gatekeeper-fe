import { apiSpec } from '~/types/api-spec'
import type {
  CreateMembershipRequestBody,
  ListResponse,
  MembershipStatus,
  PageQuery,
  UpdateMembershipRoleRequestBody
} from '~/types/api-spec'
import type { Membership } from '~/types/domain'

export interface MembershipListQuery extends PageQuery {
  id?: string
  status?: MembershipStatus
  role_code?: string
  email?: string
  full_name?: string
  search?: string
}

export function useMembers(organizationId: string) {
  const api = useApiClient()
  const params = { organizationId }

  function listMembers(query?: MembershipListQuery) {
    return api.get<ListResponse<Membership>>(apiSpec.memberships.list.path, {
      params,
      query: query as Record<string, unknown> | undefined
    })
  }

  function getMember(membershipId: string) {
    return api.get<Membership>(apiSpec.memberships.get.path, {
      params: { ...params, membershipId }
    })
  }

  function createMember(body: CreateMembershipRequestBody) {
    return api.post<Membership>(apiSpec.memberships.create.path, { params, body })
  }

  function updateMemberRole(membershipId: string, body: UpdateMembershipRoleRequestBody) {
    return api.patch<Membership>(apiSpec.memberships.updateRole.path, {
      params: { ...params, membershipId },
      body
    })
  }

  function removeMember(membershipId: string) {
    return api.delete(apiSpec.memberships.remove.path, {
      params: { ...params, membershipId }
    })
  }

  return {
    listMembers,
    getMember,
    createMember,
    updateMemberRole,
    removeMember
  }
}
