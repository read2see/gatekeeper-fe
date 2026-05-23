import type { DataTableConfig } from '~/types/table'
import type { ListResponse } from '~/types/api-spec'
import type { AdminUser, PlatformRole, PlatformRoleAssignment } from '~/types/domain'
import { formatRoleCode, parseListPageTotal } from '~/utils/table'

function parseBooleanFilter(value?: string): boolean | undefined {
  if (value === 'true') {
    return true
  }

  if (value === 'false') {
    return false
  }

  return undefined
}

function isDeleted(row: AdminUser) {
  return Boolean(row.deleted_at)
}

function userStatus(row: AdminUser) {
  if (isDeleted(row)) {
    return 'DELETED'
  }

  return row.active === false ? 'SUSPENDED' : 'ACTIVE'
}

function hasPlatformRole(row: AdminUser, role: PlatformRole) {
  return (row.platform_roles ?? []).includes(role)
}

function hasAnyPlatformRole(row: AdminUser) {
  return hasPlatformRole(row, 'PLATFORM_STAFF') || hasPlatformRole(row, 'PLATFORM_ADMIN')
}

function formatPlatformRoles(row: AdminUser) {
  const roles = row.platform_roles ?? []

  if (!roles.length) {
    return '—'
  }

  return roles.map(role => formatRoleCode(role)).join(', ')
}

function unwrapRoleAssignments(
  response: ListResponse<PlatformRoleAssignment> | PlatformRoleAssignment[]
): PlatformRoleAssignment[] {
  return Array.isArray(response) ? response : response.items ?? []
}

function filterByPlatformRole(items: AdminUser[], filter?: string) {
  if (!filter || filter === 'any') {
    return items
  }

  return items.filter((row) => {
    const roles = row.platform_roles ?? []

    switch (filter) {
      case 'staff':
        return roles.includes('PLATFORM_STAFF')
      case 'admin':
        return roles.includes('PLATFORM_ADMIN')
      case 'none':
        return roles.length === 0
      default:
        return true
    }
  })
}

export function usePlatformStaffTableConfig(): DataTableConfig<AdminUser> {
  const { listUsers, getUserRoles, assignUserRole, removeUserRole } = useAdmin()
  const { confirm } = useConfirm()
  const toast = useAppToast()

  async function refreshTable() {
    await refreshNuxtData('datatable-platform-staff')
  }

  async function runPromote(row: AdminUser, roleCode: PlatformRole) {
    const label = formatRoleCode(roleCode)
    const accepted = await confirm({
      title: `Promote to ${label}?`,
      description: `${row.full_name || row.email} will be granted the ${label} platform role.`,
      confirmLabel: 'Promote',
      confirmColor: 'primary'
    })

    if (!accepted) {
      return
    }

    try {
      await assignUserRole(row.id, { role_code: roleCode })
      toast.showActionSuccess(`Promoted to ${label}`)
      await refreshTable()
    } catch (error) {
      toast.showActionError(error)
    }
  }

  async function runRemoveFromStaff(row: AdminUser) {
    const accepted = await confirm({
      title: 'Remove from staff?',
      description: `${row.full_name || row.email} will lose all platform staff roles.`,
      confirmLabel: 'Remove',
      confirmColor: 'error',
      destructive: true
    })

    if (!accepted) {
      return
    }

    try {
      const response = await getUserRoles(row.id)
      const assignments = unwrapRoleAssignments(response)

      for (const assignment of assignments) {
        await removeUserRole(row.id, assignment.id)
      }

      toast.showActionSuccess('Removed from staff')
      await refreshTable()
    } catch (error) {
      toast.showActionError(error)
    }
  }

  return {
    id: 'platform-staff',
    meta: {
      title: 'Staff',
      description: 'Platform staff roles and access management'
    },
    searchable: true,
    searchPlaceholder: 'Search by name or email…',
    defaultPageSize: 20,
    columns: [
      {
        id: 'email',
        accessorKey: 'email',
        header: 'Email',
        sortable: true,
        sortKey: 'email',
        class: 'font-medium text-highlighted'
      },
      {
        id: 'full_name',
        accessorKey: 'full_name',
        header: 'Name',
        sortable: true,
        sortKey: 'fullName'
      },
      {
        id: 'platform_roles',
        header: 'Platform roles',
        cell: row => formatPlatformRoles(row)
      },
      {
        id: 'active',
        header: 'Status',
        cell: row => userStatus(row),
        sortable: true,
        sortKey: 'active'
      },
      {
        id: 'created_at',
        accessorKey: 'created_at',
        header: 'Created',
        cell: 'date',
        sortable: true,
        sortKey: 'created_at'
      }
    ],
    filters: [
      {
        id: 'platformRole',
        label: 'Has platform role',
        type: 'select',
        options: [
          { label: 'Any', value: 'any' },
          { label: 'Staff', value: 'staff' },
          { label: 'Admin', value: 'admin' },
          { label: 'None', value: 'none' }
        ]
      },
      {
        id: 'active',
        label: 'Status',
        type: 'select',
        options: [
          { label: 'Active', value: 'true' },
          { label: 'Suspended', value: 'false' }
        ]
      },
      {
        id: 'includeDeleted',
        label: 'Deleted users',
        type: 'select',
        options: [
          { label: 'Hidden', value: 'false' },
          { label: 'Included', value: 'true' }
        ]
      }
    ],
    rowActions: [
      {
        id: 'promote-staff',
        label: 'Promote to staff',
        icon: 'i-lucide-user-plus',
        visible: row => !isDeleted(row) && !hasPlatformRole(row, 'PLATFORM_STAFF'),
        async onClick(row) {
          await runPromote(row, 'PLATFORM_STAFF')
        }
      },
      {
        id: 'promote-admin',
        label: 'Promote to admin',
        icon: 'i-lucide-shield-plus',
        visible: row => !isDeleted(row) && !hasPlatformRole(row, 'PLATFORM_ADMIN'),
        async onClick(row) {
          await runPromote(row, 'PLATFORM_ADMIN')
        }
      },
      {
        id: 'remove-staff',
        label: 'Remove from staff',
        icon: 'i-lucide-user-minus',
        destructive: true,
        visible: row => !isDeleted(row) && hasAnyPlatformRole(row),
        async onClick(row) {
          await runRemoveFromStaff(row)
        }
      }
    ],
    emptyState: {
      title: 'No users found',
      description: 'Try adjusting your search or filters.',
      icon: 'i-lucide-shield'
    },
    getRowId: row => row.id,
    async fetchPage(params) {
      const { filters, ...rest } = params
      const searchTerm = (rest.search ?? filters.search)?.trim()
      const response = await listUsers({
        page: rest.page,
        size: rest.size,
        sort: rest.sort,
        search: searchTerm || undefined,
        active: parseBooleanFilter(filters.active),
        includeDeleted: parseBooleanFilter(filters.includeDeleted)
      })

      const items = filterByPlatformRole(response.items, filters.platformRole)

      return {
        items,
        total: parseListPageTotal(response.meta) ?? response.items.length,
        page: rest.page,
        size: rest.size
      }
    }
  }
}
