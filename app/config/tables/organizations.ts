import type { DataTableConfig } from '~/types/table'
import { getOrganizationRoleCode, type Organization } from '~/types/domain'
import { parseListPageTotal } from '~/utils/table'

export function useOrganizationsTableConfig(): DataTableConfig<Organization> {
  const { listOrganizations } = useOrganizations()

  return {
    id: 'organizations',
    meta: {
      title: 'Organizations',
      description: 'Organizations you belong to'
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
        id: 'role',
        header: 'Role',
        cell: row => getOrganizationRoleCode(row),
        sortable: true,
        sortKey: 'role_code'
      },
      {
        id: 'status',
        accessorKey: 'status',
        header: 'Status',
        cell: 'status',
        sortable: true,
        sortKey: 'status'
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
        id: 'open',
        label: 'Open',
        icon: 'i-lucide-arrow-right',
        to: row => `/org/${row.id}`
      }
    ],
    createAction: {
      label: 'Create organization',
      to: '/app/organizations/new',
      icon: 'i-lucide-plus'
    },
    emptyState: {
      title: 'No organizations yet',
      description: 'Create your first organization to manage API services and consumers.',
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
        status: filters.status as Organization['status'] | undefined
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
