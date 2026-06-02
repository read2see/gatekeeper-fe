import type { TableColumn } from '@nuxt/ui'
import type { Component } from 'vue'
import { UCheckbox } from '#components'
import DataTableRowActionsMenu from '~/components/data-table/RowActionsMenu.vue'
import UiRoleBadge from '~/components/ui/RoleBadge.vue'
import UiStatusBadge from '~/components/ui/StatusBadge.vue'
import type {
  DataTableColumnDef,
  DataTableConfig,
  DataTableFetchParams,
  DataTableSortState
} from '~/types/table'
import { formatTableDate } from '~/utils/table'

function defaultGetRowId<T extends { id?: string }>(row: T) {
  if (!row.id) {
    throw new Error('DataTable row is missing an id. Provide getRowId in the table config.')
  }

  return row.id
}

function buildSortParam(sort: DataTableSortState | null, columns: DataTableColumnDef<unknown>[]) {
  if (!sort) {
    return undefined
  }

  const column = columns.find(item => item.id === sort.id)
  const sortKey = column?.sortKey ?? column?.accessorKey ?? sort.id

  return `${sortKey},${sort.desc ? 'desc' : 'asc'}`
}

export function useDataTable<T extends { id?: string }>(config: DataTableConfig<T>) {
  const page = ref(1)
  const size = ref(config.defaultPageSize ?? 20)
  const sort = ref<DataTableSortState | null>(
    config.defaultSort
      ? { id: config.defaultSort.replace(/^-/, ''), desc: config.defaultSort.startsWith('-') }
      : null
  )
  const search = ref('')
  const debouncedSearch = ref('')
  const rowSelection = ref<Record<string, boolean>>({})

  const filters = reactive<Record<string, string | undefined>>(
    Object.fromEntries((config.filters ?? []).map(filter => [filter.id, undefined]))
  )

  let searchDebounceTimer: ReturnType<typeof setTimeout> | undefined

  watch(search, (value) => {
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer)
    }

    searchDebounceTimer = setTimeout(() => {
      debouncedSearch.value = value.trim()
    }, 300)
  })

  watch([debouncedSearch, filters, sort], () => {
    page.value = 1
    rowSelection.value = {}
  }, { deep: true })

  const fetchParams = computed<DataTableFetchParams>(() => {
    const searchKey = config.searchKey ?? 'search'
    const filterValues = Object.fromEntries(
      Object.entries(filters).filter(([, value]) => value != null && value !== '')
    )

    return {
      page: page.value - 1,
      size: size.value,
      sort: buildSortParam(sort.value, config.columns as DataTableColumnDef<unknown>[]),
      search: debouncedSearch.value || undefined,
      filters: {
        ...filterValues,
        ...(debouncedSearch.value ? { [searchKey]: debouncedSearch.value } : {})
      }
    }
  })

  const querySignature = computed(() => JSON.stringify(fetchParams.value))

  const { data, pending, error, refresh } = useAsyncData(
    `datatable-${config.id}`,
    () => config.fetchPage(fetchParams.value),
    {
      watch: [querySignature]
    }
  )

  const items = computed(() => data.value?.items ?? [])
  const total = computed(() => data.value?.total ?? items.value.length)
  const pageCount = computed(() => Math.max(1, Math.ceil(total.value / size.value)))

  const getRowId = (row: T) => (config.getRowId ?? defaultGetRowId)(row)

  const selectedRows = computed(() =>
    items.value.filter(row => rowSelection.value[getRowId(row)])
  )

  const selectedCount = computed(() => selectedRows.value.length)

  function setPage(nextPage: number) {
    page.value = Math.min(Math.max(nextPage, 1), pageCount.value)
  }

  function setPageSize(nextSize: number) {
    size.value = nextSize
    page.value = 1
    rowSelection.value = {}
  }

  function toggleSort(columnId: string) {
    const column = config.columns.find(item => item.id === columnId)

    if (!column?.sortable) {
      return
    }

    if (sort.value?.id !== columnId) {
      sort.value = { id: columnId, desc: false }
      return
    }

    if (!sort.value.desc) {
      sort.value = { id: columnId, desc: true }
      return
    }

    sort.value = null
  }

  function clearSelection() {
    rowSelection.value = {}
  }

  function buildColumns(
    resolveCell: (column: DataTableColumnDef<T>, row: T) => string | number | null | undefined
  ): TableColumn<T>[] {
    const columns: TableColumn<T>[] = []

    if (config.selectable) {
      columns.push({
        id: 'select',
        header: ({ table }) => h(UCheckbox, {
          'modelValue': table.getIsSomePageRowsSelected() ? 'indeterminate' : table.getIsAllPageRowsSelected(),
          'onUpdate:modelValue': (value: unknown) => table.toggleAllPageRowsSelected(!!value),
          'aria-label': 'Select all rows'
        }),
        cell: ({ row }) => h(UCheckbox, {
          'modelValue': row.getIsSelected(),
          'onUpdate:modelValue': (value: unknown) => row.toggleSelected(!!value),
          'aria-label': 'Select row'
        }),
        enableSorting: false
      })
    }

    for (const column of config.columns) {
      columns.push({
        id: column.id,
        accessorKey: column.accessorKey,
        header: column.sortable
          ? () => h(
              'button',
              {
                type: 'button',
                class: 'inline-flex items-center gap-1 font-semibold text-highlighted hover:text-primary',
                onClick: () => toggleSort(column.id)
              },
              [
                column.header,
                sort.value?.id === column.id
                  ? h('span', { class: 'text-xs text-muted' }, sort.value.desc ? '↓' : '↑')
                  : null
              ]
            )
          : column.header,
        cell: ({ row }) => {
          const value = typeof column.cell === 'function'
            ? column.cell(row.original)
            : column.accessorKey
              ? row.getValue(column.accessorKey)
              : resolveCell(column, row.original)

          if (column.cell === 'status') {
            return h(UiStatusBadge, {
              status: value as string | null | undefined
            })
          }

          if (column.cell === 'role') {
            return h(UiRoleBadge, {
              role: value as string | null | undefined
            })
          }

          if (column.cell === 'date') {
            return formatTableDate(value as string | null | undefined)
          }

          const subline = column.subline?.(row.original)

          if (subline) {
            return h('div', { class: 'min-w-0 space-y-0.5' }, [
              h('p', { class: 'truncate' }, String(value ?? '—')),
              h('p', { class: 'truncate text-sm text-muted md:hidden' }, subline)
            ])
          }

          return value ?? '—'
        },
        meta: column.class
          ? {
              class: {
                td: column.class,
                th: column.class
              }
            }
          : undefined,
        enableSorting: false
      })
    }

    if (config.rowActions?.length) {
      columns.push({
        id: 'actions',
        header: '',
        cell: ({ row }) => h(DataTableRowActionsMenu as Component, {
          row: row.original,
          actions: config.rowActions,
          organizationId: config.organizationId
        }),
        meta: {
          class: {
            td: 'w-0 text-right',
            th: 'w-0'
          }
        },
        enableSorting: false
      })
    }

    return columns
  }

  return {
    config,
    items,
    total,
    page,
    size,
    sort,
    search,
    filters,
    rowSelection,
    selectedRows,
    selectedCount,
    pending,
    error,
    refresh,
    setPage,
    setPageSize,
    toggleSort,
    clearSelection,
    getRowId,
    buildColumns,
    fetchParams
  }
}
