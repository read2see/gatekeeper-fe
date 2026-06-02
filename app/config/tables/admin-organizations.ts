import type { DataTableConfig } from '~/types/table'
import type { AdminOrganization } from '~/types/domain'
import { parseListPageTotal } from '~/utils/table'

export function useAdminOrganizationsTableConfig(): DataTableConfig<AdminOrganization> {
  const { listOrganizations, suspendOrganization, reactivateOrganization } = useAdmin()
  const { confirm } = useConfirm()
  const toast = useAppToast()

  async function refreshTable() {
    await refreshNuxtData('datatable-admin-organizations')
  }

  async function runStatusAction(
    action: 'suspend' | 'reactivate',
    row: AdminOrganization
  ) {
    const isSuspend = action === 'suspend'
    const accepted = await confirm({
      title: isSuspend ? 'Suspend organization?' : 'Reactivate organization?',
      description: isSuspend
        ? `${row.name} and its members will lose access until reactivated.`
        : `${row.name} and its members will regain access.`,
      confirmLabel: isSuspend ? 'Suspend' : 'Reactivate',
      confirmColor: isSuspend ? 'error' : 'primary',
      destructive: isSuspend
    })

    if (!accepted) {
      return
    }

    try {
      if (isSuspend) {
        await suspendOrganization(row.id)
      } else {
        await reactivateOrganization(row.id)
      }

      toast.showActionSuccess(isSuspend ? 'Organization suspended' : 'Organization reactivated')
      await refreshTable()
    } catch (error) {
      toast.showActionError(error)
    }
  }

  return {
    id: 'admin-organizations',
    meta: {
      title: 'Organizations',
      description: 'All platform organizations and their status'
    },
    searchable: true,
    defaultPageSize: 20,
    columns: [
      {
        id: 'name',
        accessorKey: 'name',
        header: 'Name',
        sortable: true,
        sortKey: 'name',
        class: 'font-medium text-highlighted'
      },
      {
        id: 'slug',
        accessorKey: 'slug',
        header: 'Slug',
        sortable: true,
        sortKey: 'slug'
      },
      {
        id: 'status',
        accessorKey: 'status',
        header: 'Status',
        cell: 'status',
        sortable: true,
        sortKey: 'status'
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
        id: 'status',
        label: 'Status',
        type: 'select',
        options: [
          { label: 'Active', value: 'ACTIVE' },
          { label: 'Suspended', value: 'SUSPENDED' }
        ]
      }
    ],
    rowActions: [
      {
        id: 'inspect',
        label: 'Inspect',
        icon: 'i-lucide-search',
        to: row => `/admin/support/organizations/${row.id}`
      },
      {
        id: 'open',
        label: 'Open',
        icon: 'i-lucide-arrow-right',
        to: row => `/org/${row.id}`
      },
      {
        id: 'suspend',
        label: 'Suspend',
        icon: 'i-lucide-pause',
        destructive: true,
        visible: row => row.status !== 'SUSPENDED',
        async onClick(row) {
          await runStatusAction('suspend', row)
        }
      },
      {
        id: 'reactivate',
        label: 'Reactivate',
        icon: 'i-lucide-play',
        visible: row => row.status === 'SUSPENDED',
        async onClick(row) {
          await runStatusAction('reactivate', row)
        }
      }
    ],
    emptyState: {
      title: 'No organizations found',
      description: 'Try adjusting your search or filters.',
      icon: 'i-lucide-building-2'
    },
    getRowId: row => row.id,
    async fetchPage(params) {
      const { filters, ...rest } = params
      const response = await listOrganizations({
        page: rest.page,
        size: rest.size,
        sort: rest.sort,
        search: rest.search,
        status: filters.status as AdminOrganization['status'] | undefined
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
