import type { Permission } from '~/types/access'

export interface DataTablePageMeta {
  title: string
  description?: string
}

export interface DataTableEmptyState {
  title: string
  description?: string
  icon?: string
}

export interface DataTableCreateAction {
  label: string
  to: string
  icon?: string
  requiredPermission?: Permission
}

export type DataTableCellType = 'text' | 'status' | 'role' | 'date'

export interface DataTableColumnDef<T> {
  id: string
  accessorKey?: keyof T & string
  header: string
  cell?: DataTableCellType | ((row: T) => string | number | null | undefined)
  sortable?: boolean
  sortKey?: string
  class?: string
}

export interface DataTableFilterOption {
  label: string
  value: string
}

export interface DataTableFilterDef {
  id: string
  label: string
  type: 'text' | 'select'
  placeholder?: string
  options?: DataTableFilterOption[]
}

export interface DataTableRowAction<T> {
  id: string
  label: string
  icon?: string
  to?: (row: T) => string
  onClick?: (row: T) => void | Promise<void>
  visible?: (row: T) => boolean
  requiredPermission?: Permission
  destructive?: boolean
}

export interface DataTableBulkAction<T> {
  id: string
  label: string
  icon?: string
  onClick: (rows: T[]) => void | Promise<void>
  requiredPermission?: Permission
  destructive?: boolean
  confirm?: {
    title: string
    description?: string
  }
}

export interface DataTableFetchParams {
  /** Zero-based page index sent to the Gatekeeper API. */
  page: number
  size: number
  sort?: string
  search?: string
  filters: Record<string, string | undefined>
}

export interface DataTablePageResult<T> {
  items: T[]
  total?: number
  page?: number
  size?: number
}

export interface DataTableConfig<T> {
  id: string
  /** When set, permission checks use org-scoped roles for this organization. */
  organizationId?: string
  meta: DataTablePageMeta
  defaultPageSize?: number
  defaultSort?: string
  searchKey?: string
  searchPlaceholder?: string
  searchable?: boolean
  selectable?: boolean
  filters?: DataTableFilterDef[]
  columns: DataTableColumnDef<T>[]
  rowActions?: DataTableRowAction<T>[]
  bulkActions?: DataTableBulkAction<T>[]
  emptyState?: DataTableEmptyState
  createAction?: DataTableCreateAction
  fetchPage: (params: DataTableFetchParams) => Promise<DataTablePageResult<T>>
  getRowId?: (row: T) => string
}

export interface DataTableSortState {
  id: string
  desc: boolean
}
