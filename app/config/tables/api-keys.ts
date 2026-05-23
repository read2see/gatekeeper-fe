import type { DataTableConfig } from '~/types/table'
import type { ApiKey } from '~/types/domain'
import type { ApiKeyStatus, ListResponse } from '~/types/api-spec'
import { parseListPageTotal } from '~/utils/table'

export function useApiKeysTableConfig(
  organizationId: string,
  serviceId: string
): DataTableConfig<ApiKey> {
  const { listApiKeys, updateApiKeyStatus } = useApiKeys(organizationId, serviceId)
  const { confirm } = useConfirm()
  const toast = useAppToast()

  async function refreshTable() {
    await refreshNuxtData(`datatable-api-keys-${organizationId}-${serviceId}`)
  }

  return {
    id: `api-keys-${organizationId}-${serviceId}`,
    organizationId,
    meta: {
      title: 'API keys',
      description: 'Keys issued to consumers for this service'
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
        id: 'consumer_name',
        header: 'Consumer',
        cell: row => row.consumer_name ?? row.consumer_id
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
        id: 'scopes',
        header: 'Scopes',
        cell: row => row.scopes?.join(', ') ?? '—'
      },
      {
        id: 'expires_at',
        accessorKey: 'expires_at',
        header: 'Expires',
        cell: 'date'
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
          { label: 'Revoked', value: 'REVOKED' }
        ]
      }
    ],
    rowActions: [
      {
        id: 'edit-scopes',
        label: 'Edit scopes',
        icon: 'i-lucide-pencil',
        to: row => `/org/${organizationId}/services/${serviceId}/api-keys/${row.id}/scopes`
      },
      {
        id: 'rate-limit',
        label: 'Rate limit',
        icon: 'i-lucide-gauge',
        to: row => `/org/${organizationId}/services/${serviceId}/api-keys/${row.id}/rate-limit`
      },
      {
        id: 'revoke',
        label: 'Revoke',
        icon: 'i-lucide-ban',
        destructive: true,
        visible: row => row.status === 'ACTIVE',
        async onClick(row) {
          const accepted = await confirm({
            title: 'Revoke API key?',
            description: `${row.name} will no longer authenticate requests.`,
            confirmLabel: 'Revoke',
            confirmColor: 'error',
            destructive: true
          })

          if (!accepted) {
            return
          }

          try {
            await updateApiKeyStatus(row.id, { status: 'REVOKED' })
            toast.showActionSuccess('API key revoked')
            await refreshTable()
          } catch (error) {
            toast.showActionError(error, 'Revoke failed')
          }
        }
      }
    ],
    emptyState: {
      title: 'No API keys yet',
      description: 'Create an API key to grant a consumer access to this service.',
      icon: 'i-lucide-key'
    },
    createAction: {
      label: 'Create API key',
      to: `/org/${organizationId}/services/${serviceId}/api-keys/new`,
      icon: 'i-lucide-plus',
      requiredPermission: 'org:services:manage'
    },
    getRowId: row => row.id,
    async fetchPage(params) {
      const { filters, ...rest } = params
      const response = await listApiKeys({
        page: rest.page,
        size: rest.size,
        sort: rest.sort,
        search: rest.search,
        status: filters.status as ApiKeyStatus | undefined
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
