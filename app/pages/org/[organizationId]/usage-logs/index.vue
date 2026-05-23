<script setup lang="ts">
import { useUsageLogsTableConfig } from '~/config/tables/usage-logs'

definePageMeta({
  layout: 'dashboard',
  middleware: ['org']
})

const route = useRoute()
const organizationId = route.params.organizationId as string
const config = useUsageLogsTableConfig(organizationId)
</script>

<template>
  <DataTablePage :config="config" />
</template>
