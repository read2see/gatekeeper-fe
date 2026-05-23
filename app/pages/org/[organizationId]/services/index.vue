<script setup lang="ts">
import { useServicesTableConfig } from '~/config/tables/services'
import { getErrorMessage } from '~/utils/api-errors'

definePageMeta({
  layout: 'dashboard',
  middleware: ['org']
})

const route = useRoute()
const organizationId = route.params.organizationId as string
const config = useServicesTableConfig(organizationId)
const access = useAccess()
const { can } = useOrgContext()

const canManage = computed(() => can('org:services:manage'))

const {
  search,
  filters,
  rowSelection,
  selectedRows,
  selectedCount,
  items,
  total,
  page,
  size,
  pending,
  error,
  refresh,
  clearSelection,
  setPage,
  setPageSize,
  buildColumns,
  getRowId
} = useDataTable(config)

const columns = computed(() => buildColumns((column, row) => {
  if (column.accessorKey) {
    return row[column.accessorKey] as string | number | null | undefined
  }

  return undefined
}))

const showCreateAction = computed(() => {
  if (!config.createAction) {
    return false
  }

  if (config.createAction.requiredPermission) {
    return access.can(config.createAction.requiredPermission, organizationId)
  }

  return true
})

const emptyState = computed(() => ({
  title: config.emptyState?.title ?? 'Nothing here yet',
  description: config.emptyState?.description ?? 'Get started by creating your first item.',
  icon: config.emptyState?.icon ?? 'i-lucide-inbox'
}))

const tableKey = computed(() => [
  config.id,
  page.value,
  size.value,
  search.value,
  JSON.stringify(filters),
  JSON.stringify(rowSelection.value),
  items.value.length
].join(':'))
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <LayoutTopbar :title="config.meta.title" />
    </template>

    <template #body>
      <div class="flex flex-col gap-6 p-4 sm:p-6">
        <UiPageHeader
          :title="config.meta.title"
          :description="config.meta.description"
        >
          <template
            v-if="canManage || (showCreateAction && config.createAction)"
            #actions
          >
            <UButton
              v-if="canManage"
              :to="`/org/${organizationId}/services/import-postman`"
              icon="i-lucide-file-input"
              variant="soft"
              color="neutral"
            >
              Import from Postman
            </UButton>
            <UButton
              v-if="showCreateAction && config.createAction"
              :to="config.createAction.to"
              :icon="config.createAction.icon ?? 'i-lucide-plus'"
            >
              {{ config.createAction.label }}
            </UButton>
          </template>
        </UiPageHeader>

        <UCard :ui="{ body: 'p-0 sm:p-0' }">
          <DataTableToolbar
            v-model:search="search"
            :searchable="config.searchable"
            :search-placeholder="config.searchPlaceholder"
            :pending="pending"
            @refresh="refresh()"
          />

          <DataTableFilters
            v-if="config.filters?.length"
            v-model="filters"
            :filters="config.filters"
          />

          <DataTableBulkActions
            v-if="config.bulkActions?.length"
            :actions="config.bulkActions"
            :organization-id="config.organizationId"
            :selected-rows="selectedRows"
            :selected-count="selectedCount"
            @clear="clearSelection()"
          />

          <UiLoadingState
            v-if="pending && !items.length"
            message="Loading..."
          />

          <UiErrorState
            v-else-if="error"
            title="Failed to load data"
            :message="getErrorMessage(error)"
            retryable
            @retry="refresh()"
          />

          <UiEmptyState
            v-else-if="!items.length"
            :title="emptyState.title"
            :description="emptyState.description"
            :icon="emptyState.icon"
          >
            <template
              v-if="canManage || (showCreateAction && config.createAction)"
              #actions
            >
              <UButton
                v-if="canManage"
                :to="`/org/${organizationId}/services/import-postman`"
                icon="i-lucide-file-input"
                variant="soft"
                color="neutral"
              >
                Import from Postman
              </UButton>
              <UButton
                v-if="showCreateAction && config.createAction"
                :to="config.createAction.to"
                :icon="config.createAction.icon ?? 'i-lucide-plus'"
              >
                {{ config.createAction.label }}
              </UButton>
            </template>
          </UiEmptyState>

          <template v-else>
            <div class="overflow-x-auto">
              <UTable
                :key="tableKey"
                v-model:row-selection="rowSelection"
                :data="items"
                :columns="columns"
                :loading="pending"
                :get-row-id="getRowId"
                sticky="header"
                class="min-w-full border-b border-default"
              />
            </div>

            <div class="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p class="text-sm text-muted">
                {{ total }} total
              </p>

              <div class="flex flex-wrap items-center gap-3">
                <USelect
                  :model-value="size"
                  :items="[
                    { label: '10 / page', value: 10 },
                    { label: '20 / page', value: 20 },
                    { label: '50 / page', value: 50 },
                    { label: '100 / page', value: 100 }
                  ]"
                  value-key="value"
                  label-key="label"
                  class="w-32"
                  @update:model-value="setPageSize(Number($event))"
                />

                <UPagination
                  :page="page"
                  :items-per-page="size"
                  :total="total"
                  @update:page="setPage($event)"
                />
              </div>
            </div>
          </template>
        </UCard>
      </div>
    </template>
  </UDashboardPanel>
</template>
