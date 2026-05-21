<script setup lang="ts">
const appConfig = useAppConfig()
const { navigationItems } = useDashboardMenu()
</script>

<template>
  <UDashboardSidebar
    collapsible
    resizable
  >
    <template #header="{ collapsed }">
      <NuxtLink
        to="/"
        class="flex items-center gap-2 font-semibold text-default transition-colors hover:text-highlighted"
        :class="collapsed ? 'justify-center px-0' : 'px-1'"
        :aria-label="collapsed ? `${appConfig.app.name} home` : undefined"
      >
        <UIcon
          name="i-lucide-shield-check"
          class="size-6 shrink-0 text-primary"
        />
        <span
          v-if="!collapsed"
          class="truncate"
        >
          {{ appConfig.app.name }}
        </span>
      </NuxtLink>
    </template>

    <template #default="{ collapsed }">
      <UNavigationMenu
        :collapsed="collapsed"
        :items="navigationItems"
        orientation="vertical"
      />
    </template>
  </UDashboardSidebar>
</template>
