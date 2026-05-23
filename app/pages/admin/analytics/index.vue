<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: ['admin']
})
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <LayoutTopbar title="Platform analytics" />
    </template>

    <template #body>
      <div class="p-4 sm:p-6">
        <AnalyticsDashboard
          scope="platform"
          title="Platform analytics"
          description="Cross-organization usage metrics, trends, and breakdowns"
        />
      </div>
    </template>
  </UDashboardPanel>
</template>
