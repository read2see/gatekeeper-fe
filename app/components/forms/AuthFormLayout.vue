<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()

const appConfig = useAppConfig()
</script>

<template>
  <div class="w-full max-w-md">
    <div class="mb-8 flex flex-col items-center gap-3 text-center">
      <NuxtLink
        to="/"
        class="inline-flex items-center gap-2 text-default"
        aria-label="Gatekeeper home"
      >
        <UIcon
          name="i-lucide-shield-check"
          class="size-8 text-primary"
        />
        <span class="text-lg font-semibold">{{ appConfig.app.name }}</span>
      </NuxtLink>
    </div>

    <UCard :ui="{ body: 'space-y-6' }">
      <template #header>
        <div class="space-y-1">
          <h1 class="text-xl font-semibold text-highlighted">
            {{ title }}
          </h1>
          <p
            v-if="description"
            class="text-sm text-muted"
          >
            {{ description }}
          </p>
        </div>
      </template>

      <slot />

      <template
        v-if="$slots.footer"
        #footer
      >
        <div class="text-sm text-muted">
          <slot name="footer" />
        </div>
      </template>
    </UCard>
  </div>
</template>
