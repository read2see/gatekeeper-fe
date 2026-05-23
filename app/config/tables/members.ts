import type { DataTableConfig } from '~/types/table'
import type { Membership } from '~/types/domain'
import type { MembershipStatus } from '~/types/api-spec'
import { formatRoleCode, formatTableDate, parseListPageTotal } from '~/utils/table'

export function useMembersTableConfig(organizationId: string): DataTableConfig<Membership> {
  const { listMembers, removeMember } = useMembers(organizationId)
  const { confirm } = useConfirm()
  const { open: openChangeRoleModal } = useChangeMemberRoleModal(organizationId)
  const toast = useAppToast()

  async function refreshTable() {
    await refreshNuxtData(`datatable-members-${organizationId}`)
  }

  return {
    id: `members-${organizationId}`,
    organizationId,
    meta: {
      title: 'Members',
      description: 'Organization members and their roles'
    },
    searchable: true,
    defaultPageSize: 20,
    columns: [
      {
        id: 'name',
        header: 'Name',
        cell: row => row.full_name ?? row.email ?? row.user_id ?? '—',
        class: 'font-medium text-highlighted min-w-[8rem]',
        subline: row => row.full_name && row.email ? row.email : null
      },
      {
        id: 'email',
        accessorKey: 'email',
        header: 'Email',
        class: 'hidden md:table-cell'
      },
      {
        id: 'role_code',
        accessorKey: 'role_code',
        header: 'Role',
        cell: row => formatRoleCode(row.role_code),
        sortable: true,
        sortKey: 'role_code',
        class: 'whitespace-nowrap'
      },
      {
        id: 'status',
        accessorKey: 'status',
        header: 'Status',
        cell: 'status',
        sortable: true,
        sortKey: 'status',
        class: 'whitespace-nowrap'
      },
      {
        id: 'created_at',
        accessorKey: 'created_at',
        header: 'Joined',
        cell: 'date',
        sortable: true,
        sortKey: 'created_at',
        class: 'hidden lg:table-cell whitespace-nowrap'
      }
    ],
    mobileRow: {
      primary: row => row.full_name ?? row.email ?? row.user_id ?? '—',
      detail: row => row.full_name && row.email ? row.email : null,
      status: row => row.status,
      role: row => row.role_code,
      meta: row => row.created_at ? `Joined ${formatTableDate(row.created_at)}` : null
    },
    filters: [
      {
        id: 'status',
        label: 'Status',
        type: 'select',
        options: [
          { label: 'Active', value: 'ACTIVE' },
          { label: 'Suspended', value: 'SUSPENDED' },
          { label: 'Removed', value: 'REMOVED' }
        ]
      },
      {
        id: 'role_code',
        label: 'Role',
        type: 'select',
        options: [
          { label: 'Owner', value: 'ORG_OWNER' },
          { label: 'Developer', value: 'ORG_DEVELOPER' },
          { label: 'Viewer', value: 'ORG_VIEWER' }
        ]
      }
    ],
    rowActions: [
      {
        id: 'change-role',
        label: 'Change role',
        icon: 'i-lucide-user-cog',
        requiredPermission: 'org:members:manage',
        visible: row => row.status !== 'REMOVED',
        onClick(row) {
          openChangeRoleModal(row)
        }
      },
      {
        id: 'remove',
        label: 'Remove',
        icon: 'i-lucide-user-minus',
        destructive: true,
        visible: row => row.status !== 'REMOVED',
        async onClick(row) {
          const accepted = await confirm({
            title: 'Remove member?',
            description: `${row.full_name ?? row.email ?? 'This member'} will lose access to the organization.`,
            confirmLabel: 'Remove',
            confirmColor: 'error',
            destructive: true
          })

          if (!accepted) {
            return
          }

          try {
            await removeMember(row.id)
            toast.showActionSuccess('Member removed')
            await refreshTable()
          } catch (error) {
            toast.showActionError(error, 'Remove failed')
          }
        }
      }
    ],
    emptyState: {
      title: 'No members yet',
      description: 'Invite members to collaborate on this organization.',
      icon: 'i-lucide-users'
    },
    createAction: {
      label: 'Invite member',
      to: `/org/${organizationId}/members/invite`,
      icon: 'i-lucide-user-plus',
      requiredPermission: 'org:members:manage'
    },
    getRowId: row => row.id,
    async fetchPage(params) {
      const { filters, ...rest } = params
      const response = await listMembers({
        page: rest.page,
        size: rest.size,
        sort: rest.sort,
        search: rest.search,
        status: filters.status as MembershipStatus | undefined,
        role_code: filters.role_code
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
