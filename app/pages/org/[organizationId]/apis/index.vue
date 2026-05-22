<script setup lang="ts">
import { useServicesTableConfig } from '~/config/tables/services'
import { apiSpec } from '~/types/api-spec'
import type { ListResponse } from '~/types/api-spec'
import { getErrorMessage } from '~/utils/api-errors'
import { parseListPageTotal } from '~/utils/table'
import type { ApiKey, ApiService, RouteRule } from '~/types/domain'

definePageMeta({
  layout: 'dashboard',
  middleware: ['org']
})

const route = useRoute()
const organizationId = route.params.organizationId as string
const { organizationName } = useOrgContext()
const access = useAccess()
const { listServices } = useServices(organizationId)
const api = useApiClient()

const servicesConfig = useServicesTableConfig(organizationId)

function listRouteRulesForService(serviceId: string, query?: { page?: number, size?: number }) {
  return api.get<ListResponse<RouteRule>>(apiSpec.routeRules.list.path, {
    params: { organizationId, serviceId },
    query
  })
}

function listApiKeysForService(serviceId: string, query?: { page?: number, size?: number }) {
  return api.get<ListResponse<ApiKey>>(apiSpec.apiKeys.list.path, {
    params: { organizationId, serviceId },
    query
  })
}

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
  pending: tablePending,
  error: tableError,
  refresh: refreshTable,
  clearSelection,
  setPage,
  setPageSize,
  buildColumns,
  getRowId
} = useDataTable(servicesConfig)

const columns = computed(() => buildColumns((column, row) => {
  if (column.accessorKey) {
    return row[column.accessorKey] as string | number | null | undefined
  }

  return undefined
}))

const showCreateAction = computed(() => {
  if (!servicesConfig.createAction) {
    return false
  }

  if (servicesConfig.createAction.requiredPermission) {
    return access.can(servicesConfig.createAction.requiredPermission, organizationId)
  }

  return true
})

const emptyState = computed(() => ({
  title: servicesConfig.emptyState?.title ?? 'Nothing here yet',
  description: servicesConfig.emptyState?.description ?? 'Get started by creating your first item.',
  icon: servicesConfig.emptyState?.icon ?? 'i-lucide-inbox'
}))

const tableKey = computed(() => [
  servicesConfig.id,
  page.value,
  size.value,
  search.value,
  JSON.stringify(filters),
  JSON.stringify(rowSelection.value),
  items.value.length
].join(':'))

async function fetchApisHubSummary() {
  const servicesResponse = await listServices({ page: 0, size: 100 })
  const services = servicesResponse.items
  const serviceCount = parseListPageTotal(servicesResponse.meta) ?? services.length

  let totalRouteRules = 0
  let totalApiKeys = 0
  const scopeSet = new Set<string>()

  await Promise.all(services.map(async (service) => {
    const [rulesResponse, keysResponse] = await Promise.all([
      listRouteRulesForService(service.id, { page: 0, size: 100 }),
      listApiKeysForService(service.id, { page: 0, size: 1 })
    ])

    totalRouteRules += parseListPageTotal(rulesResponse.meta) ?? rulesResponse.items.length
    totalApiKeys += parseListPageTotal(keysResponse.meta) ?? keysResponse.items.length

    const rulesTotal = parseListPageTotal(rulesResponse.meta) ?? rulesResponse.items.length
    const allRules = [...rulesResponse.items]

    if (rulesTotal > allRules.length) {
      let rulePage = 1

      while (allRules.length < rulesTotal) {
        const nextPage = await listRouteRulesForService(service.id, { page: rulePage, size: 100 })
        allRules.push(...nextPage.items)

        if (!nextPage.items.length) {
          break
        }

        rulePage++
      }
    }

    for (const rule of allRules) {
      const scope = rule.required_scope?.trim()

      if (scope) {
        scopeSet.add(scope)
      }
    }
  }))

  return {
    serviceCount,
    totalRouteRules,
    totalApiKeys,
    scopes: [...scopeSet].sort((a, b) => a.localeCompare(b)),
    services
  }
}

const {
  data: summary,
  pending: summaryPending,
  error: summaryError,
  refresh: refreshSummary
} = await useAsyncData(
  () => `apis-hub-summary-${organizationId}`,
  fetchApisHubSummary,
  { watch: [() => organizationId] }
)

const metricCards = computed(() => [
  { key: 'services', label: 'Services', value: summary.value?.serviceCount, icon: 'i-lucide-server' },
  { key: 'route-rules', label: 'Route rules', value: summary.value?.totalRouteRules, icon: 'i-lucide-route' },
  { key: 'api-keys', label: 'API keys', value: summary.value?.totalApiKeys, icon: 'i-lucide-key' }
])

const serviceQuickLinks = computed(() =>
  (summary.value?.services ?? []).map((service: ApiService) => ({
    id: service.id,
    name: service.name,
    slug: service.slug,
    status: service.status,
    routeRulesTo: `/org/${organizationId}/services/${service.id}/route-rules`,
    apiKeysTo: `/org/${organizationId}/services/${service.id}/api-keys`,
    serviceTo: `/org/${organizationId}/services/${service.id}`
  }))
)

function refreshAll() {
  refreshSummary()
  refreshTable()
}
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <LayoutTopbar title="API management" />
    </template>

    <template #body>
      <div class="flex flex-col gap-6 p-4 sm:p-6">
        <UiPageHeader
          title="API management"
          description="Overview of services, route rules, API keys, and scopes"
        >
          <template #actions>
            <UButton
              icon="i-lucide-refresh-cw"
              variant="soft"
              color="neutral"
              :loading="summaryPending || tablePending"
              @click="refreshAll()"
            >
              Refresh
            </UButton>
            <UButton
              v-if="showCreateAction && servicesConfig.createAction"
              :to="servicesConfig.createAction.to"
              :icon="servicesConfig.createAction.icon ?? 'i-lucide-plus'"
            >
              {{ servicesConfig.createAction.label }}
            </UButton>
          </template>
        </UiPageHeader>

        <UiErrorState
          v-if="summaryError && !summary"
          title="Failed to load API overview"
          :message="getErrorMessage(summaryError)"
          retryable
          @retry="refreshSummary()"
        />

        <template v-else>
          <div class="grid gap-4 md:grid-cols-3">
            <AnalyticsMetricCard
              v-for="metric in metricCards"
              :key="metric.key"
              :label="metric.label"
              :value="metric.value"
              :icon="metric.icon"
              format="number"
              :loading="summaryPending && summary == null"
            />
          </div>

          <section
            v-if="serviceQuickLinks.length"
            class="space-y-4"
          >
            <div>
              <h2 class="text-base font-semibold text-highlighted">
                Service quick links
              </h2>
              <p class="text-sm text-muted">
                Jump directly to route rules or API keys for each service
              </p>
            </div>

            <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <UCard
                v-for="service in serviceQuickLinks"
                :key="service.id"
              >
                <div class="space-y-4">
                  <div class="flex items-start justify-between gap-3">
                    <div class="min-w-0">
                      <NuxtLink
                        :to="service.serviceTo"
                        class="font-semibold text-highlighted hover:text-primary"
                      >
                        {{ service.name }}
                      </NuxtLink>
                      <p class="truncate text-sm text-muted">
                        {{ service.slug }}
                      </p>
                    </div>
                    <UiStatusBadge :status="service.status ?? 'ACTIVE'" />
                  </div>

                  <div class="flex flex-wrap gap-2">
                    <UButton
                      :to="service.routeRulesTo"
                      size="xs"
                      variant="soft"
                      color="neutral"
                      icon="i-lucide-route"
                    >
                      Route rules
                    </UButton>
                    <UButton
                      :to="service.apiKeysTo"
                      size="xs"
                      variant="soft"
                      color="neutral"
                      icon="i-lucide-key"
                    >
                      API keys
                    </UButton>
                  </div>
                </div>
              </UCard>
            </div>
          </section>

          <section class="space-y-4">
            <div>
              <h2 class="text-base font-semibold text-highlighted">
                Services
              </h2>
              <p class="text-sm text-muted">
                {{ organizationName ? `${organizationName} API services` : 'Manage API services and upstream configuration' }}
              </p>
            </div>

            <UCard :ui="{ body: 'p-0 sm:p-0' }">
              <DataTableToolbar
                v-model:search="search"
                :searchable="servicesConfig.searchable"
                :search-placeholder="servicesConfig.searchPlaceholder"
                :pending="tablePending"
                @refresh="refreshTable()"
              />

              <DataTableFilters
                v-if="servicesConfig.filters?.length"
                v-model="filters"
                :filters="servicesConfig.filters"
              />

              <DataTableBulkActions
                v-if="servicesConfig.bulkActions?.length"
                :actions="servicesConfig.bulkActions"
                :organization-id="servicesConfig.organizationId"
                :selected-rows="selectedRows"
                :selected-count="selectedCount"
                @clear="clearSelection()"
              />

              <UiLoadingState
                v-if="tablePending && !items.length"
                message="Loading services..."
              />

              <UiErrorState
                v-else-if="tableError"
                title="Failed to load services"
                :message="getErrorMessage(tableError)"
                retryable
                @retry="refreshTable()"
              />

              <UiEmptyState
                v-else-if="!items.length"
                :title="emptyState.title"
                :description="emptyState.description"
                :icon="emptyState.icon"
              >
                <template
                  v-if="showCreateAction && servicesConfig.createAction"
                  #actions
                >
                  <UButton
                    :to="servicesConfig.createAction.to"
                    :icon="servicesConfig.createAction.icon ?? 'i-lucide-plus'"
                  >
                    {{ servicesConfig.createAction.label }}
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
                    :loading="tablePending"
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
          </section>

          <section class="space-y-4">
            <div>
              <h2 class="text-base font-semibold text-highlighted">
                Scopes overview
              </h2>
              <p class="text-sm text-muted">
                Unique required scopes defined across all route rules
              </p>
            </div>

            <UCard>
              <UiLoadingState
                v-if="summaryPending && !summary"
                message="Loading scopes..."
              />

              <UiEmptyState
                v-else-if="!summary?.scopes.length"
                title="No scopes defined yet"
                description="Create route rules on your services to define required scopes."
                icon="i-lucide-shield"
              />

              <div
                v-else
                class="flex flex-wrap gap-2"
              >
                <UBadge
                  v-for="scope in summary.scopes"
                  :key="scope"
                  color="neutral"
                  variant="subtle"
                  size="sm"
                  class="font-mono"
                >
                  {{ scope }}
                </UBadge>
              </div>
            </UCard>
          </section>
        </template>
      </div>
    </template>
  </UDashboardPanel>
</template>
