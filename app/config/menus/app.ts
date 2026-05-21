import type { MenuItem } from '~/types/menu'

export const appMenu: MenuItem[] = [
  {
    label: 'Organizations',
    icon: 'i-lucide-building-2',
    to: '/app/organizations'
  },
  {
    label: 'Profile',
    icon: 'i-lucide-user',
    to: '/app/profile'
  }
]
