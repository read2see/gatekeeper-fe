import type { MenuItem } from '~/types/menu'

export function getOrgMenu(organizationId: string): MenuItem[] {
  return [
    {
      label: 'Overview',
      icon: 'i-lucide-layout-dashboard',
      to: `/org/${organizationId}`,
      requiredPermissions: ['org:read']
    },
    {
      label: 'APIs',
      icon: 'i-lucide-blocks',
      to: `/org/${organizationId}/apis`,
      requiredPermissions: ['org:services:manage']
    },
    {
      label: 'Services',
      icon: 'i-lucide-server',
      to: `/org/${organizationId}/services`,
      requiredPermissions: ['org:services:manage']
    },
    {
      label: 'Consumers',
      icon: 'i-lucide-plug',
      to: `/org/${organizationId}/consumers`,
      requiredPermissions: ['org:read']
    },
    {
      label: 'Members',
      icon: 'i-lucide-users',
      to: `/org/${organizationId}/members`,
      requiredPermissions: ['org:members:manage']
    },
    {
      label: 'Usage logs',
      icon: 'i-lucide-scroll-text',
      to: `/org/${organizationId}/usage-logs`,
      requiredPermissions: ['org:read']
    },
    {
      label: 'Analytics',
      icon: 'i-lucide-bar-chart-3',
      to: `/org/${organizationId}/analytics`,
      requiredPermissions: ['org:analytics:read']
    },
    {
      label: 'Settings',
      icon: 'i-lucide-settings',
      to: `/org/${organizationId}/settings`,
      requiredPermissions: ['org:manage']
    }
  ]
}
