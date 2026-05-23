<script setup lang="ts">
import { getErrorMessage } from '~/utils/api-errors'
import { formatTableDate } from '~/utils/table'

definePageMeta({
  layout: 'dashboard',
  middleware: ['admin']
})

const { getHealth, getAnalyticsOverview } = useAdmin()

const { data, pending, error, refresh } = await useAsyncData('admin-overview', async () => {
  const [health, analytics] = await Promise.all([
    getHealth().catch(() => null),
    getAnalyticsOverview().catch(() => null)
  ])

  return { health, analytics }
})

const health = computed(() => data.value?.health)
const analytics = computed(() => data.value?.analytics)

const metricCards = computed(() => {
  const overview = analytics.value
  if (!overview) {
    return []
  }

  const labels: Record<string, string> = {
    total_users: 'Total users',
    active_users: 'Active users',
    total_organizations: 'Total organizations',
    active_organizations: 'Active organizations',
    total_requests: 'Total requests'
  }

  return Object.entries(labels)
    .filter(([key]) => typeof overview[key] === 'number')
    .map(([key, label]) => ({
      key,
      label,
      value: overview[key] as number
    }))
})

const quickLinks = [
  {
    title: 'Analytics',
    description: 'Platform usage metrics, trends, and breakdowns',
    icon: 'i-lucide-bar-chart-3',
    to: '/admin/analytics'
  },
  {
    title: 'Users',
    description: 'Browse and manage platform user accounts',
    icon: 'i-lucide-users',
    to: '/admin/users'
  },
  {
    title: 'Organizations',
    description: 'Browse and manage all organizations',
    icon: 'i-lucide-building-2',
    to: '/admin/organizations'
  }
]
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <LayoutTopbar title="Admin overview" />
    </template>

    <template #body>
      <div class="flex flex-col gap-6 p-4 sm:p-6">
        <UiPageHeader
          title="Admin overview"
          description="Platform health, usage metrics, and quick navigation"
        >
          <template #actions>
            <UButton
              icon="i-lucide-refresh-cw"
              variant="soft"
              color="neutral"
              :loading="pending"
              @click="refresh()"
            >
              Refresh
            </UButton>
          </template>
        </UiPageHeader>

        <UiErrorState
          v-if="error && !data"
          title="Failed to load admin overview"
          :message="getErrorMessage(error)"
          retryable
          @retry="refresh()"
        />

        <template v-else>
          <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <UCard>
              <template #header>
                <div class="flex items-center gap-2">
                  <UIcon
                    name="i-lucide-heart-pulse"
                    class="size-5 text-primary"
                  />
                  <h2 class="text-base font-semibold text-highlighted">
                    Platform health
                  </h2>
                </div>
              </template>

              <UiLoadingState
                v-if="pending && !health"
                message="Checking health..."
              />

              <div
                v-else-if="health"
                class="space-y-3 text-sm"
              >
                <div class="flex items-center justify-between gap-4">
                  <span class="text-muted">Status</span>
                  <UiStatusBadge :status="health.status ?? 'ACTIVE'" />
                </div>
                <div
                  v-if="health.version"
                  class="flex items-center justify-between gap-4"
                >
                  <span class="text-muted">Version</span>
                  <span class="font-medium text-highlighted">{{ health.version }}</span>
                </div>
                <div
                  v-if="health.timestamp"
                  class="flex items-center justify-between gap-4"
                >
                  <span class="text-muted">Checked</span>
                  <span class="font-medium text-highlighted">{{ formatTableDate(health.timestamp) }}</span>
                </div>
              </div>

              <p
                v-else
                class="text-sm text-muted"
              >
                Health check unavailable.
              </p>
            </UCard>

            <AnalyticsMetricCard
              v-for="metric in metricCards"
              :key="metric.key"
              :label="metric.label"
              :value="metric.value"
              format="number"
            />

            <template v-if="pending && !metricCards.length">
              <UCard
                v-for="index in 3"
                :key="index"
              >
                <UiLoadingState message="Loading metrics..." />
              </UCard>
            </template>
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <UCard
              v-for="link in quickLinks"
              :key="link.to"
              :ui="{ body: 'p-0 sm:p-0' }"
            >
              <NuxtLink
                :to="link.to"
                class="flex items-start gap-4 p-4 transition-colors hover:bg-elevated/50 sm:p-6"
              >
                <div class="rounded-lg bg-primary/10 p-2">
                  <UIcon
                    :name="link.icon"
                    class="size-5 text-primary"
                  />
                </div>
                <div class="min-w-0 space-y-1">
                  <p class="font-semibold text-highlighted">
                    {{ link.title }}
                  </p>
                  <p class="text-sm text-muted">
                    {{ link.description }}
                  </p>
                </div>
                <UIcon
                  name="i-lucide-arrow-right"
                  class="ml-auto size-4 shrink-0 text-muted"
                />
              </NuxtLink>
            </UCard>
          </div>
        </template>
      </div>
    </template>
  </UDashboardPanel>
</template>
