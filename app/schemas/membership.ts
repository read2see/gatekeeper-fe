import { z } from 'zod'

export const orgRoleCodes = ['ORG_OWNER', 'ORG_DEVELOPER', 'ORG_VIEWER'] as const
export const inviteRoleCodes = ['ORG_DEVELOPER', 'ORG_VIEWER'] as const

export const inviteMemberSchema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
  role_code: z.enum(inviteRoleCodes, { message: 'Select a role' })
})

export const updateMemberRoleSchema = z.object({
  role_code: z.enum(orgRoleCodes, { message: 'Select a role' })
})

export type InviteMemberFormData = z.infer<typeof inviteMemberSchema>
export type UpdateMemberRoleFormData = z.infer<typeof updateMemberRoleSchema>

export const memberRoleOptions = [
  { label: 'Owner', value: 'ORG_OWNER' },
  { label: 'Developer', value: 'ORG_DEVELOPER' },
  { label: 'Viewer', value: 'ORG_VIEWER' }
] as const

export const inviteRoleOptions = [
  { label: 'Developer', value: 'ORG_DEVELOPER' },
  { label: 'Viewer', value: 'ORG_VIEWER' }
] as const

export function isOrgRoleCode(roleCode?: string | null): roleCode is typeof orgRoleCodes[number] {
  return orgRoleCodes.includes(roleCode as typeof orgRoleCodes[number])
}
