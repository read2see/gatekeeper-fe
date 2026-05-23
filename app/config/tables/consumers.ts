import type { DataTableConfig } from '~/types/table'
import type { ApiConsumer } from '~/types/domain'
import type { ApiConsumerStatus, ApiConsumerType } from '~/types/api-spec'
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

export function useConsumersTableConfig(organizationId: string): DataTableConfig<ApiConsumer> {
  const { listConsumers, updateConsumerStatus, deleteConsumer } = useConsumers(organizationId)
  const { confirm } = useConfirm()
  const toast = useAppToast()

  async function refreshTable() {
    await refreshNuxtData(`datatable-consumers-${organizationId}`)
  }

  async function runStatusAction(action: 'suspend' | 'activate', row: ApiConsumer) {
    const labels = {
      suspend: { title: 'Suspend consumer?', confirm: 'Suspend' },
      activate: { title: 'Activate consumer?', confirm: 'Activate' }
    }
    const config = labels[action]

    const accepted = await confirm({
      title: config.title,
      description: `${row.name} will be updated.`,
      confirmLabel: config.confirm,
      confirmColor: action === 'activate' ? 'primary' : 'error',
      destructive: action !== 'activate'
    })

    if (!accepted) {
      return
    }

    try {
      const statusMap = {
        suspend: 'SUSPENDED' as ApiConsumerStatus,
        activate: 'ACTIVE' as ApiConsumerStatus
      }

      await updateConsumerStatus(row.id, { status: statusMap[action] })
      toast.showActionSuccess(`Consumer ${action}d`)
      await refreshTable()
    } catch (error) {
      toast.showActionError(error)
    }
  }

  return {
    id: `consumers-${organizationId}`,
    organizationId,
    meta: {
      title: 'Consumers',
      description: 'API consumers that receive keys for your services'
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
        id: 'type',
        accessorKey: 'type',
        header: 'Type',
        sortable: true,
        sortKey: 'type'
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
        id: 'type',
        label: 'Type',
        type: 'select',
        options: [
          { label: 'Internal', value: 'INTERNAL' },
          { label: 'External', value: 'EXTERNAL' },
          { label: 'Partner', value: 'PARTNER' }
        ]
      },
      {
        id: 'status',
        label: 'Status',
        type: 'select',
        options: [
          { label: 'Active', value: 'ACTIVE' },
          { label: 'Suspended', value: 'SUSPENDED' },
          { label: 'Archived', value: 'ARCHIVED' }
        ]
      },
      {
        id: 'include_archived',
        label: 'Archived consumers',
        type: 'select',
        options: [
          { label: 'Hidden', value: 'false' },
          { label: 'Included', value: 'true' }
        ]
      }
    ],
    rowActions: [
      {
        id: 'edit',
        label: 'Edit',
        icon: 'i-lucide-pencil',
        requiredPermission: 'org:consumers:manage',
        visible: row => row.status !== 'ARCHIVED',
        to: row => `/org/${organizationId}/consumers/${row.id}/edit`
      },
      {
        id: 'suspend',
        label: 'Suspend',
        icon: 'i-lucide-pause',
        destructive: true,
        requiredPermission: 'org:consumers:manage',
        visible: row => row.status === 'ACTIVE',
        async onClick(row) {
          await runStatusAction('suspend', row)
        }
      },
      {
        id: 'activate',
        label: 'Activate',
        icon: 'i-lucide-play',
        requiredPermission: 'org:consumers:manage',
        visible: row => row.status === 'SUSPENDED',
        async onClick(row) {
          await runStatusAction('activate', row)
        }
      },
      {
        id: 'delete',
        label: 'Delete',
        icon: 'i-lucide-trash-2',
        destructive: true,
        requiredPermission: 'org:consumers:deactivate',
        visible: row => row.status !== 'ARCHIVED',
        async onClick(row) {
          const accepted = await confirm({
            title: 'Delete consumer?',
            description: `${row.name} will be archived and removed from the active consumer list.`,
            confirmLabel: 'Delete',
            confirmColor: 'error',
            destructive: true
          })

          if (!accepted) {
            return
          }

          try {
            await deleteConsumer(row.id)
            toast.showActionSuccess('Consumer archived')
            await refreshTable()
          } catch (error) {
            toast.showActionError(error, 'Delete failed')
          }
        }
      }
    ],
    createAction: {
      label: 'Create consumer',
      to: `/org/${organizationId}/consumers/new`,
      icon: 'i-lucide-plus',
      requiredPermission: 'org:consumers:manage'
    },
    emptyState: {
      title: 'No consumers yet',
      description: 'Create a consumer before issuing API keys.',
      icon: 'i-lucide-plug'
    },
    getRowId: row => row.id,
    async fetchPage(params) {
      const { filters, ...rest } = params
      const status = filters.status as ApiConsumerStatus | undefined
      const includeArchived = parseBooleanFilter(filters.include_archived)

      const response = await listConsumers({
        page: rest.page,
        size: rest.size,
        sort: rest.sort,
        search: rest.search,
        type: filters.type as ApiConsumerType | undefined,
        status,
        include_archived: includeArchived ?? (status === 'ARCHIVED' ? true : undefined)
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
