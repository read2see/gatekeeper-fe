import type { DataTableConfig } from '~/types/table'

interface ExampleRecord {
  id: string
  name: string
  status: 'ACTIVE' | 'SUSPENDED'
  role_code: string
  created_at: string
}

/**
 * Reference table config for admin/org list pages.
 * Copy this shape when adding a new table under app/config/tables/.
 */
export function createExampleTableConfig(): DataTableConfig<ExampleRecord> {
  return {
    id: 'example-records',
    meta: {
      title: 'Example records',
      description: 'Demonstrates the shared DataTablePage configuration pattern'
    },
    searchable: true,
    selectable: true,
    defaultPageSize: 20,
    columns: [
      {
        id: 'name',
        accessorKey: 'name',
        header: 'Name',
        sortable: true
      },
      {
        id: 'role',
        accessorKey: 'role_code',
        header: 'Role',
        cell: 'role',
        sortable: true
      },
      {
        id: 'status',
        accessorKey: 'status',
        header: 'Status',
        cell: 'status'
      },
      {
        id: 'created_at',
        accessorKey: 'created_at',
        header: 'Created',
        cell: 'date'
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
        id: 'view',
        label: 'View',
        icon: 'i-lucide-eye',
        to: row => `/example/${row.id}`
      }
    ],
    bulkActions: [
      {
        id: 'archive',
        label: 'Archive selected',
        icon: 'i-lucide-archive',
        destructive: true,
        confirm: {
          title: 'Archive selected records?',
          description: 'This action cannot be undone.'
        },
        async onClick(rows) {
          console.info('Archive rows', rows.map(row => row.id))
        }
      }
    ],
    createAction: {
      label: 'Create record',
      to: '/example/new'
    },
    emptyState: {
      title: 'No records yet',
      description: 'Create a record to populate this table.',
      icon: 'i-lucide-table'
    },
    getRowId: row => row.id,
    async fetchPage(params) {
      console.info('Fetch example table page', params)

      return {
        items: [],
        total: 0,
        page: params.page,
        size: params.size
      }
    }
  }
}
