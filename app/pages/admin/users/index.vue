<script setup lang="ts">
import { useAdminUsersTableConfig } from '~/config/tables/admin-users'

definePageMeta({
  layout: 'dashboard',
  middleware: ['admin']
})

const config = useAdminUsersTableConfig()
</script>

<template>
  <DataTablePage :config="config" />
</template>
