import type { Permission } from '~/types/access'

export type MenuContext = 'admin' | 'org' | 'app'

export interface MenuItem {
  label: string
  icon?: string
  to?: string
  children?: MenuItem[]
  requiredRoles?: string[]
  requiredPermissions?: Permission[]
  exact?: boolean
}
