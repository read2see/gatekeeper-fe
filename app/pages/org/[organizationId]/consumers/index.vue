<script setup lang="ts">
import { useConsumersTableConfig } from '~/config/tables/consumers'

definePageMeta({
  layout: 'dashboard',
  middleware: ['org']
})

const route = useRoute()
const organizationId = route.params.organizationId as string
const config = useConsumersTableConfig(organizationId)
</script>

<template>
  <DataTablePage :config="config" />
</template>
