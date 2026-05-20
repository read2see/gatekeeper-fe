<script setup lang="ts">
useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    lang: 'en'
  }
})

useSeoMeta({
  title: 'Gatekeeper',
  description: 'Gatekeeper platform administration and organization management.',
  ogTitle: 'Gatekeeper',
  ogDescription: 'Gatekeeper platform administration and organization management.'
})
</script>

<template>
  <UApp>
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-inverted focus:outline-none"
    >
      Skip to main content
    </a>

    <AuthState>
      <template #placeholder>
        <div class="flex min-h-svh items-center justify-center">
          <UiLoadingState message="Loading session..." />
        </div>
      </template>

      <template #default>
        <NuxtLayout>
          <NuxtPage />
        </NuxtLayout>
      </template>
    </AuthState>
  </UApp>
</template>
