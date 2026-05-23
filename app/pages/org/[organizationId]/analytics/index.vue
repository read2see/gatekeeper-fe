<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: ['org']
})

const route = useRoute()
const organizationId = route.params.organizationId as string
const { organization } = useOrgContext()
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <LayoutTopbar :title="organization?.name ? `${organization.name} analytics` : 'Analytics'" />
    </template>

    <template #body>
      <div class="p-4 sm:p-6">
        <AnalyticsDashboard
          scope="organization"
          :organization-id="organizationId"
          :title="organization?.name ? `${organization.name} analytics` : 'Organization analytics'"
          description="Usage metrics, trends, and breakdowns for this organization"
        />
      </div>
    </template>
  </UDashboardPanel>
</template>
