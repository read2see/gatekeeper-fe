<script setup lang="ts">
import { useAdminOrganizationsTableConfig } from '~/config/tables/admin-organizations'

definePageMeta({
  layout: 'dashboard',
  middleware: ['admin']
})

const config = useAdminOrganizationsTableConfig()
</script>

<template>
  <DataTablePage :config="config" />
</template>
