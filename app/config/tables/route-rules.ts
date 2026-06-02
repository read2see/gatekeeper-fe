import type { DataTableConfig } from '~/types/table'
import type { RouteRule } from '~/types/domain'
import type { HttpMethod } from '~/types/api-spec'
import { parseListPageTotal } from '~/utils/table'

export function useRouteRulesTableConfig(
  organizationId: string,
  serviceId: string
): DataTableConfig<RouteRule> {
  const { listRouteRules, updateRouteRuleStatus, deleteRouteRule } = useRouteRules(organizationId, serviceId)
  const { confirm } = useConfirm()
  const toast = useAppToast()

  async function refreshTable() {
    await refreshNuxtData(`datatable-route-rules-${organizationId}-${serviceId}`)
  }

  return {
    id: `route-rules-${organizationId}-${serviceId}`,
    organizationId,
    meta: {
      title: 'Route rules',
      description: 'Path patterns and required scopes for this service'
    },
    searchable: true,
    defaultPageSize: 20,
    columns: [
      {
        id: 'method',
        accessorKey: 'method',
        header: 'Method',
        sortable: true,
        sortKey: 'method'
      },
      {
        id: 'path_pattern',
        accessorKey: 'path_pattern',
        header: 'Path pattern',
        class: 'font-mono text-sm'
      },
      {
        id: 'required_scope',
        accessorKey: 'required_scope',
        header: 'Required scope'
      },
      {
        id: 'active',
        accessorKey: 'active',
        header: 'Active',
        cell: row => (row.active === false ? 'Inactive' : 'Active')
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
        id: 'method',
        label: 'Method',
        type: 'select',
        options: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS', 'ANY'].map(method => ({
          label: method,
          value: method
        }))
      }
    ],
    rowActions: [
      {
        id: 'edit',
        label: 'Edit',
        icon: 'i-lucide-pencil',
        to: row => `/org/${organizationId}/services/${serviceId}/route-rules/${row.id}/edit`
      },
      {
        id: 'toggle',
        label: 'Toggle active',
        icon: 'i-lucide-toggle-left',
        async onClick(row) {
          const nextActive = row.active === false
          try {
            await updateRouteRuleStatus(row.id, { active: nextActive })
            toast.showActionSuccess(nextActive ? 'Route rule activated' : 'Route rule deactivated')
            await refreshTable()
          } catch (error) {
            toast.showActionError(error, 'Update failed')
          }
        }
      },
      {
        id: 'delete',
        label: 'Delete',
        icon: 'i-lucide-trash-2',
        destructive: true,
        async onClick(row) {
          const accepted = await confirm({
            title: 'Delete route rule?',
            description: `${row.method} ${row.path_pattern} will be permanently deleted.`,
            confirmLabel: 'Delete',
            confirmColor: 'error',
            destructive: true
          })

          if (!accepted) {
            return
          }

          try {
            await deleteRouteRule(row.id)
            toast.showActionSuccess('Route rule deleted')
            await refreshTable()
          } catch (error) {
            toast.showActionError(error, 'Delete failed')
          }
        }
      }
    ],
    emptyState: {
      title: 'No route rules yet',
      description: 'Add route rules to define scope requirements for paths.',
      icon: 'i-lucide-route'
    },
    createAction: {
      label: 'Add route rule',
      to: `/org/${organizationId}/services/${serviceId}/route-rules/new`,
      icon: 'i-lucide-plus',
      requiredPermission: 'org:services:manage'
    },
    getRowId: row => row.id,
    async fetchPage(params) {
      const { filters, ...rest } = params
      const response = await listRouteRules({
        page: rest.page,
        size: rest.size,
        sort: rest.sort,
        search: rest.search,
        method: filters.method as HttpMethod | undefined
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
