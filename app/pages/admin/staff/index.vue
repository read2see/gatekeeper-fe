<script setup lang="ts">
import { usePlatformStaffTableConfig } from '~/config/tables/platform-staff'

definePageMeta({
  layout: 'dashboard',
  middleware: ['admin']
})

const config = usePlatformStaffTableConfig()
</script>

<template>
  <DataTablePage :config="config" />
</template>
