export type Permission
  = | 'admin:access' | 'admin:users:read' | 'admin:organizations:read' | 'org:read' | 'org:manage' | 'org:members:manage' | 'org:services:manage' | 'org:consumers:manage' | 'org:consumers:deactivate' | 'org:analytics:read'

export interface AccessContext {
  platformRoles: string[]
  orgRole?: string
}
