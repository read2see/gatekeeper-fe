<script setup lang="ts">
import { useApiKeysTableConfig } from '~/config/tables/api-keys'

definePageMeta({
  layout: 'dashboard',
  middleware: ['org']
})

const route = useRoute()
const organizationId = route.params.organizationId as string
const serviceId = route.params.serviceId as string
const { getService } = useServices(organizationId)
const { organizationName } = useOrgContext()
const config = useApiKeysTableConfig(organizationId, serviceId)

const { data: service } = await useAsyncData(
  () => `service-api-keys-${organizationId}-${serviceId}`,
  () => getService(serviceId),
  { watch: [() => serviceId] }
)

const breadcrumbs = computed(() => [
  { label: organizationName.value ?? 'Organization', to: `/org/${organizationId}` },
  { label: 'Services', to: `/org/${organizationId}/services` },
  { label: service.value?.name ?? 'Service', to: `/org/${organizationId}/services/${serviceId}` },
  { label: 'API keys' }
])
</script>

<template>
  <DataTablePage
    :config="config"
    :breadcrumbs="breadcrumbs"
  />
</template>
