<script setup lang="ts">
import { useMembersTableConfig } from '~/config/tables/members'

definePageMeta({
  layout: 'dashboard',
  middleware: ['org']
})

const route = useRoute()
const organizationId = route.params.organizationId as string
const config = useMembersTableConfig(organizationId)
</script>

<template>
  <DataTablePage :config="config" />
  <MembersChangeMemberRoleModal :organization-id="organizationId" />
</template>
