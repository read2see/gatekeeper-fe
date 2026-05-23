<script setup lang="ts">
import { getErrorMessage } from '~/utils/api-errors'
import { buildServiceProxyUrl } from '~/utils/service-proxy'
import { formatTableDate } from '~/utils/table'

definePageMeta({
  layout: 'dashboard',
  middleware: ['org']
})

const route = useRoute()
const organizationId = route.params.organizationId as string
const serviceId = route.params.serviceId as string
const { getService } = useServices(organizationId)
const { organizationName, organization, can } = useOrgContext()
const config = useRuntimeConfig()
const toast = useAppToast()

const canManage = computed(() => can('org:services:manage'))

const { data: service, pending, error, refresh } = await useAsyncData(
  () => `service-${organizationId}-${serviceId}`,
  () => getService(serviceId),
  { watch: [() => serviceId] }
)

const serviceBasePath = computed(() => `/org/${organizationId}/services/${serviceId}`)

const serviceProxyUrl = computed(() => {
  const orgSlug = organization.value?.slug
  const serviceSlug = service.value?.slug

  if (!orgSlug || !serviceSlug) {
    return undefined
  }

  return buildServiceProxyUrl(orgSlug, serviceSlug, config.public.gatekeeperApiBase)
})

async function copyProxyUrl() {
  if (!serviceProxyUrl.value) {
    return
  }

  await navigator.clipboard.writeText(serviceProxyUrl.value)
  toast.showSuccess('Proxy URL copied to clipboard', 'Copied')
}

const sections = computed(() => [
  {
    title: 'Route rules',
    description: 'Define path patterns and required scopes',
    icon: 'i-lucide-route',
    to: `${serviceBasePath.value}/route-rules`
  },
  {
    title: 'API keys',
    description: 'Issue and manage keys for consumers',
    icon: 'i-lucide-key',
    to: `${serviceBasePath.value}/api-keys`
  }
])

const breadcrumbs = computed(() => [
  { label: organizationName.value ?? 'Organization', to: `/org/${organizationId}` },
  { label: 'Services', to: `/org/${organizationId}/services` },
  { label: service.value?.name ?? 'Service' }
])
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <LayoutTopbar
        :title="service?.name ?? 'Service'"
        :breadcrumbs="breadcrumbs"
      />
    </template>

    <template #body>
      <div class="mx-auto flex w-full max-w-4xl flex-col gap-6 p-4 sm:p-6">
        <UiPageHeader
          :title="service?.name ?? 'Service details'"
          description="Configure route rules and API keys for this service"
        >
          <template #actions>
            <UButton
              :to="`/org/${organizationId}/services`"
              color="neutral"
              variant="ghost"
              icon="i-lucide-arrow-left"
            >
              Back to services
            </UButton>
            <UButton
              v-if="canManage"
              :to="`/org/${organizationId}/services/import-postman?serviceId=${serviceId}`"
              icon="i-lucide-file-input"
              variant="soft"
            >
              Import from Postman
            </UButton>
            <UButton
              v-if="service"
              :to="`${serviceBasePath}/edit`"
              icon="i-lucide-pencil"
              variant="soft"
            >
              Edit
            </UButton>
          </template>
        </UiPageHeader>

        <UiLoadingState
          v-if="pending && !service"
          message="Loading service..."
        />

        <UiErrorState
          v-else-if="error"
          title="Failed to load service"
          :message="getErrorMessage(error)"
          retryable
          @retry="refresh()"
        />

        <template v-else-if="service">
          <UCard>
            <template #header>
              <div class="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 class="text-base font-semibold text-highlighted">
                    {{ service.name }}
                  </h2>
                  <p class="text-sm text-muted">
                    {{ service.slug }}
                  </p>
                </div>
                <UiStatusBadge :status="service.status ?? 'ACTIVE'" />
              </div>
            </template>

            <dl class="grid gap-4 sm:grid-cols-2">
              <div class="sm:col-span-2">
                <dt class="text-sm text-muted">
                  Base URL
                </dt>
                <dd class="mt-1 break-all font-mono text-sm text-highlighted">
                  {{ service.base_url }}
                </dd>
              </div>
              <div
                v-if="serviceProxyUrl"
                class="sm:col-span-2"
              >
                <dt class="text-sm text-muted">
                  Proxy URL
                </dt>
                <dd class="mt-1">
                  <div class="flex items-start gap-2">
                    <p class="min-w-0 flex-1 break-all font-mono text-sm text-highlighted">
                      {{ serviceProxyUrl }}
                    </p>
                    <UButton
                      icon="i-lucide-copy"
                      variant="soft"
                      size="sm"
                      class="shrink-0"
                      @click="copyProxyUrl()"
                    >
                      Copy
                    </UButton>
                  </div>
                  <p class="mt-1 text-xs text-muted">
                    Send API requests here with an X-Api-Key header.
                  </p>
                </dd>
              </div>
              <div v-if="service.internal_auth_header_name">
                <dt class="text-sm text-muted">
                  Internal auth header
                </dt>
                <dd class="mt-1 font-mono text-sm text-highlighted">
                  {{ service.internal_auth_header_name }}
                </dd>
              </div>
              <div>
                <dt class="text-sm text-muted">
                  Created
                </dt>
                <dd class="mt-1 text-sm text-highlighted">
                  {{ formatTableDate(service.created_at) }}
                </dd>
              </div>
            </dl>
          </UCard>

          <div class="grid gap-4 md:grid-cols-2">
            <UCard
              v-for="section in sections"
              :key="section.to"
              :ui="{ body: 'p-0 sm:p-0' }"
            >
              <NuxtLink
                :to="section.to"
                class="flex items-start gap-4 p-4 transition-colors hover:bg-elevated/50 sm:p-6"
              >
                <div class="rounded-lg bg-primary/10 p-2">
                  <UIcon
                    :name="section.icon"
                    class="size-5 text-primary"
                  />
                </div>
                <div class="min-w-0 space-y-1">
                  <p class="font-semibold text-highlighted">
                    {{ section.title }}
                  </p>
                  <p class="text-sm text-muted">
                    {{ section.description }}
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

        <UiEmptyState
          v-else
          title="Service not found"
          description="The requested service could not be loaded."
          icon="i-lucide-server"
        >
          <template #actions>
            <UButton
              :to="`/org/${organizationId}/services`"
              icon="i-lucide-arrow-left"
            >
              Back to services
            </UButton>
          </template>
        </UiEmptyState>
      </div>
    </template>
  </UDashboardPanel>
</template>
