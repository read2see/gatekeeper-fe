import type { DataTableConfig } from '~/types/table'
import type { AdminUser } from '~/types/domain'
import { parseListPageTotal } from '~/utils/table'

function parseBooleanFilter(value?: string): boolean | undefined {
  if (value === 'true') {
    return true
  }

  if (value === 'false') {
    return false
  }

  return undefined
}

export function useAdminUsersTableConfig(): DataTableConfig<AdminUser> {
  const { listUsers, suspendUser, reactivateUser, deleteUser } = useAdmin()
  const { confirm } = useConfirm()
  const toast = useAppToast()

  function isDeleted(row: AdminUser) {
    return Boolean(row.deleted_at)
  }

  function userStatus(row: AdminUser) {
    if (isDeleted(row)) {
      return 'DELETED'
    }

    return row.active === false ? 'SUSPENDED' : 'ACTIVE'
  }

  async function refreshTable() {
    await refreshNuxtData('datatable-admin-users')
  }

  async function runStatusAction(
    action: 'suspend' | 'reactivate',
    row: AdminUser
  ) {
    const isSuspend = action === 'suspend'
    const accepted = await confirm({
      title: isSuspend ? 'Suspend user?' : 'Reactivate user?',
      description: isSuspend
        ? `${row.full_name || row.email} will lose access until reactivated.`
        : `${row.full_name || row.email} will regain access to the platform.`,
      confirmLabel: isSuspend ? 'Suspend' : 'Reactivate',
      confirmColor: isSuspend ? 'error' : 'primary',
      destructive: isSuspend
    })

    if (!accepted) {
      return
    }

    try {
      if (isSuspend) {
        await suspendUser(row.id)
      } else {
        await reactivateUser(row.id)
      }

      toast.showActionSuccess(isSuspend ? 'User suspended' : 'User reactivated')
      await refreshTable()
    } catch (error) {
      toast.showActionError(error)
    }
  }

  async function runDeleteAction(row: AdminUser) {
    const accepted = await confirm({
      title: 'Delete user?',
      description: `${row.full_name || row.email} will be soft deleted and removed from active user lists.`,
      confirmLabel: 'Delete',
      confirmColor: 'error',
      destructive: true
    })

    if (!accepted) {
      return
    }

    try {
      await deleteUser(row.id)
      toast.showActionSuccess('User deleted')
      await refreshTable()
    } catch (error) {
      toast.showActionError(error)
    }
  }

  return {
    id: 'admin-users',
    meta: {
      title: 'Users',
      description: 'Platform user accounts and access status'
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
        id: 'active',
        header: 'Status',
        cell: row => userStatus(row),
        sortable: true,
        sortKey: 'active'
      },
      {
        id: 'email_verified',
        header: 'Verified',
        cell: row => (row.email_verified ? 'Yes' : 'No'),
        sortable: true,
        sortKey: 'emailVerified'
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
        id: 'active',
        label: 'Status',
        type: 'select',
        options: [
          { label: 'Active', value: 'true' },
          { label: 'Suspended', value: 'false' }
        ]
      },
      {
        id: 'emailVerified',
        label: 'Email verified',
        type: 'select',
        options: [
          { label: 'Verified', value: 'true' },
          { label: 'Unverified', value: 'false' }
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
        id: 'suspend',
        label: 'Suspend',
        icon: 'i-lucide-pause',
        destructive: true,
        visible: row => !isDeleted(row) && row.active !== false,
        async onClick(row) {
          await runStatusAction('suspend', row)
        }
      },
      {
        id: 'reactivate',
        label: 'Reactivate',
        icon: 'i-lucide-play',
        visible: row => !isDeleted(row) && row.active === false,
        async onClick(row) {
          await runStatusAction('reactivate', row)
        }
      },
      {
        id: 'delete',
        label: 'Delete',
        icon: 'i-lucide-trash-2',
        destructive: true,
        visible: row => !isDeleted(row),
        async onClick(row) {
          await runDeleteAction(row)
        }
      }
    ],
    emptyState: {
      title: 'No users found',
      description: 'Try adjusting your search or filters.',
      icon: 'i-lucide-users'
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
        emailVerified: parseBooleanFilter(filters.emailVerified),
        includeDeleted: parseBooleanFilter(filters.includeDeleted)
      })

      return {
        items: response.items,
        total: parseListPageTotal(response.meta) ?? response.items.length,
        page: rest.page,
        size: rest.size
      }
    }
  }
}
