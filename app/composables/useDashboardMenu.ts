import type { NavigationMenuItem } from '@nuxt/ui'
import { useOrgRoleCache } from '~/composables/useOrgRoleCache'
import { adminMenu } from '~/config/menus/admin'
import { appMenu } from '~/config/menus/app'
import { getOrgMenu } from '~/config/menus/org'
import { getOrganizationRoleCode } from '~/types/domain'
import type { MenuContext, MenuItem } from '~/types/menu'

function detectMenuContext(path: string): { context: MenuContext, organizationId?: string } {
  if (path.startsWith('/admin')) {
    return { context: 'admin' }
  }

  if (path.startsWith('/org/')) {
    const organizationId = path.split('/')[2]
    return organizationId ? { context: 'org', organizationId } : { context: 'app' }
  }

  return { context: 'app' }
}

function isMenuItemVisible(
  item: MenuItem,
  access: ReturnType<typeof useAccess>,
  context: MenuContext,
  organizationId?: string
) {
  if (item.requiredPermissions?.length) {
    const hasPermissions = item.requiredPermissions.every(permission =>
      access.can(permission, organizationId)
    )

    if (!hasPermissions) {
      return false
    }
  }

  if (item.requiredRoles?.length) {
    const hasRole = context === 'org' && organizationId
      ? item.requiredRoles.some(role => access.hasOrgRole(organizationId, role))
      : item.requiredRoles.some(role => access.hasPlatformRole(role))

    if (!hasRole) {
      return false
    }
  }

  return true
}

function filterMenuItems(
  items: MenuItem[],
  access: ReturnType<typeof useAccess>,
  context: MenuContext,
  organizationId?: string
): MenuItem[] {
  return items.flatMap((item) => {
    const children = item.children
      ? filterMenuItems(item.children, access, context, organizationId)
      : undefined

    const visible = isMenuItemVisible(item, access, context, organizationId)
    const hasVisibleChildren = Boolean(children?.length)

    if (!visible && !hasVisibleChildren) {
      return []
    }

    if (!visible && hasVisibleChildren) {
      return children ?? []
    }

    return [{
      ...item,
      children
    }]
  })
}

function toNavigationMenuItems(items: MenuItem[]): NavigationMenuItem[] {
  return items.map(item => ({
    label: item.label,
    icon: item.icon,
    to: item.to,
    children: item.children ? toNavigationMenuItems(item.children) : undefined
  }))
}

function getMenuConfig(context: MenuContext, organizationId?: string): MenuItem[] {
  switch (context) {
    case 'admin':
      return adminMenu
    case 'org':
      return organizationId ? getOrgMenu(organizationId) : []
    default:
      return appMenu
  }
}

export function useDashboardMenu() {
  const route = useRoute()
  const access = useAccess()
  const { getOrganization } = useOrganizations()
  const { getOrgRole: getCachedOrgRole, setOrgRole, cache: orgRoleCache } = useOrgRoleCache()

  const menuContext = computed(() => detectMenuContext(route.path))

  watch(
    () => menuContext.value,
    async ({ context, organizationId }) => {
      if (context !== 'org' || !organizationId || getCachedOrgRole(organizationId)) {
        return
      }

      try {
        const organization = await getOrganization(organizationId)
        setOrgRole(organizationId, getOrganizationRoleCode(organization))
      } catch {
        // Session role or platform staff fallback still apply.
      }
    },
    { immediate: true }
  )

  const items = computed(() => {
    const { context, organizationId } = menuContext.value

    if (context === 'admin' && !access.canAccessAdmin()) {
      return []
    }

    if (context === 'org' && organizationId && !access.canAccessOrg(organizationId)) {
      return []
    }

    // Track org role cache so sidebar items refresh after API role resolution.
    if (context === 'org' && organizationId) {
      void orgRoleCache.value[organizationId]
    }

    return filterMenuItems(
      getMenuConfig(context, organizationId),
      access,
      context,
      organizationId
    )
  })

  const navigationItems = computed(() => toNavigationMenuItems(items.value))

  return {
    context: computed(() => menuContext.value.context),
    organizationId: computed(() => menuContext.value.organizationId),
    items,
    navigationItems
  }
}
