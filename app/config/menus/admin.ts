import type { MenuItem } from '~/types/menu'

export const adminMenu: MenuItem[] = [
  {
    label: 'Overview',
    icon: 'i-lucide-layout-dashboard',
    to: '/admin'
  },
  {
    label: 'Analytics',
    icon: 'i-lucide-bar-chart-3',
    to: '/admin/analytics',
    requiredPermissions: ['admin:access']
  },
  {
    label: 'Users',
    icon: 'i-lucide-users',
    to: '/admin/users',
    requiredPermissions: ['admin:users:read']
  },
  {
    label: 'Staff',
    icon: 'i-lucide-shield',
    to: '/admin/staff',
    requiredPermissions: ['admin:users:read']
  },
  {
    label: 'Organizations',
    icon: 'i-lucide-building-2',
    to: '/admin/organizations',
    requiredPermissions: ['admin:organizations:read']
  }
]
