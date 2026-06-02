import type { DataTableConfig } from '~/types/table'
import type { UsageLog } from '~/types/domain'
import type { HttpMethod } from '~/types/api-spec'
import { parseListPageTotal } from '~/utils/table'

export function useUsageLogsTableConfig(organizationId: string): DataTableConfig<UsageLog> {
  const { listUsageLogs } = useUsageLogs(organizationId)

  return {
    id: `usage-logs-${organizationId}`,
    organizationId,
    meta: {
      title: 'Usage logs',
      description: 'Recent API request logs for this organization'
    },
    searchable: true,
    defaultPageSize: 20,
    defaultSort: '-created_at',
    columns: [
      {
        id: 'created_at',
        accessorKey: 'created_at',
        header: 'Time',
        cell: 'date',
        sortable: true,
        sortKey: 'created_at'
      },
      {
        id: 'method',
        accessorKey: 'method',
        header: 'Method',
        sortable: true,
        sortKey: 'method'
      },
      {
        id: 'path',
        accessorKey: 'path',
        header: 'Path',
        class: 'font-mono text-sm max-w-xs truncate'
      },
      {
        id: 'status_code',
        accessorKey: 'status_code',
        header: 'Status',
        sortable: true,
        sortKey: 'status_code'
      },
      {
        id: 'latency_ms',
        accessorKey: 'latency_ms',
        header: 'Latency (ms)',
        cell: row => (row.latency_ms != null ? `${row.latency_ms}` : '—')
      },
      {
        id: 'rate_limited',
        accessorKey: 'rate_limited',
        header: 'Rate limited',
        cell: row => (row.rate_limited ? 'Yes' : 'No')
      }
    ],
    filters: [
      {
        id: 'method',
        label: 'Method',
        type: 'select',
        options: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map(method => ({
          label: method,
          value: method
        }))
      }
    ],
    emptyState: {
      title: 'No usage logs yet',
      description: 'Request logs will appear here once traffic flows through your services.',
      icon: 'i-lucide-scroll-text'
    },
    getRowId: row => row.id,
    async fetchPage(params) {
      const { filters, ...rest } = params
      const response = await listUsageLogs({
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
