import type { DataTableConfig } from '~/types/table'
import type { ApiService } from '~/types/domain'
import type { ApiServiceStatus, ListResponse } from '~/types/api-spec'
import { parseListPageTotal } from '~/utils/table'

export function useServicesTableConfig(organizationId: string): DataTableConfig<ApiService> {
  const { listServices, updateServiceStatus, deleteService } = useServices(organizationId)
  const { confirm } = useConfirm()
  const toast = useAppToast()

  async function refreshTable() {
    await refreshNuxtData(`datatable-services-${organizationId}`)
  }

  async function runStatusAction(
    action: 'suspend' | 'activate' | 'archive',
    row: ApiService
  ) {
    const labels = {
      suspend: { title: 'Suspend service?', confirm: 'Suspend', color: 'error' as const },
      activate: { title: 'Activate service?', confirm: 'Activate', color: 'primary' as const },
      archive: { title: 'Archive service?', confirm: 'Archive', color: 'error' as const }
    }
    const config = labels[action]

    const accepted = await confirm({
      title: config.title,
      description: `${row.name} will be updated.`,
      confirmLabel: config.confirm,
      confirmColor: config.color,
      destructive: action !== 'activate'
    })

    if (!accepted) {
      return
    }

    try {
      const statusMap = {
        suspend: 'SUSPENDED' as ApiServiceStatus,
        activate: 'ACTIVE' as ApiServiceStatus,
        archive: 'ARCHIVED' as ApiServiceStatus
      }

      await updateServiceStatus(row.id, { status: statusMap[action] })
      toast.showActionSuccess(`Service ${action}d`)
      await refreshTable()
    } catch (error) {
      toast.showActionError(error)
    }
  }

  return {
    id: `services-${organizationId}`,
    organizationId,
    meta: {
      title: 'Services',
      description: 'API services and their upstream configuration'
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
        id: 'base_url',
        accessorKey: 'base_url',
        header: 'Base URL'
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
          { label: 'Suspended', value: 'SUSPENDED' },
          { label: 'Archived', value: 'ARCHIVED' }
        ]
      }
    ],
    rowActions: [
      {
        id: 'open',
        label: 'Open',
        icon: 'i-lucide-arrow-right',
        to: row => `/org/${organizationId}/services/${row.id}`
      },
      {
        id: 'edit',
        label: 'Edit',
        icon: 'i-lucide-pencil',
        to: row => `/org/${organizationId}/services/${row.id}/edit`
      },
      {
        id: 'suspend',
        label: 'Suspend',
        icon: 'i-lucide-pause',
        destructive: true,
        visible: row => row.status === 'ACTIVE',
        async onClick(row) {
          await runStatusAction('suspend', row)
        }
      },
      {
        id: 'activate',
        label: 'Activate',
        icon: 'i-lucide-play',
        visible: row => row.status === 'SUSPENDED',
        async onClick(row) {
          await runStatusAction('activate', row)
        }
      },
      {
        id: 'archive',
        label: 'Archive',
        icon: 'i-lucide-archive',
        destructive: true,
        visible: row => row.status !== 'ARCHIVED',
        async onClick(row) {
          await runStatusAction('archive', row)
        }
      },
      {
        id: 'delete',
        label: 'Delete',
        icon: 'i-lucide-trash-2',
        destructive: true,
        async onClick(row) {
          const accepted = await confirm({
            title: 'Delete service?',
            description: `${row.name} will be permanently deleted.`,
            confirmLabel: 'Delete',
            confirmColor: 'error',
            destructive: true
          })

          if (!accepted) {
            return
          }

          try {
            await deleteService(row.id)
            toast.showActionSuccess('Service deleted')
            await refreshTable()
          } catch (error) {
            toast.showActionError(error, 'Delete failed')
          }
        }
      }
    ],
    createAction: {
      label: 'Create service',
      to: `/org/${organizationId}/services/new`,
      icon: 'i-lucide-plus',
      requiredPermission: 'org:services:manage'
    },
    emptyState: {
      title: 'No services yet',
      description: 'Create a service to configure route rules and API keys.',
      icon: 'i-lucide-server'
    },
    getRowId: row => row.id,
    async fetchPage(params) {
      const { filters, ...rest } = params
      const response = await listServices({
        page: rest.page,
        size: rest.size,
        sort: rest.sort,
        search: rest.search,
        status: filters.status as ApiServiceStatus | undefined
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
