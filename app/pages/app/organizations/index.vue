<script setup lang="ts">
import { useOrganizationsTableConfig } from '~/config/tables/organizations'

definePageMeta({
  layout: 'dashboard'
})

const config = useOrganizationsTableConfig()
</script>

<template>
  <DataTablePage :config="config" />
</template>
