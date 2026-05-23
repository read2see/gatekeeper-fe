<script setup lang="ts">
import { useRouteRulesTableConfig } from '~/config/tables/route-rules'

definePageMeta({
  layout: 'dashboard',
  middleware: ['org']
})

const route = useRoute()
const organizationId = route.params.organizationId as string
const serviceId = route.params.serviceId as string
const { getService } = useServices(organizationId)
const { organizationName } = useOrgContext()
const config = useRouteRulesTableConfig(organizationId, serviceId)

const { data: service } = await useAsyncData(
  () => `service-route-rules-${organizationId}-${serviceId}`,
  () => getService(serviceId),
  { watch: [() => serviceId] }
)

const breadcrumbs = computed(() => [
  { label: organizationName.value ?? 'Organization', to: `/org/${organizationId}` },
  { label: 'Services', to: `/org/${organizationId}/services` },
  { label: service.value?.name ?? 'Service', to: `/org/${organizationId}/services/${serviceId}` },
  { label: 'Route rules' }
])
</script>

<template>
  <DataTablePage
    :config="config"
    :breadcrumbs="breadcrumbs"
  />
</template>
