<script setup lang="ts">
import { buildAuthCrossLinks } from '~/utils/invite-auth-links'

const route = useRoute()

const authCrossLinks = computed(() => buildAuthCrossLinks(route.query))
</script>

<template>
  <div class="flex min-h-svh flex-col bg-muted">
    <main
      id="main-content"
      class="flex flex-1 items-center justify-center px-4 py-8 sm:px-6 sm:py-12"
      tabindex="-1"
    >
      <slot />
    </main>

    <footer class="pb-6 text-center text-sm text-muted">
      <AuthState>
        <template #default="{ loggedIn }">
          <NuxtLink
            v-if="loggedIn"
            to="/app/organizations"
            class="font-medium text-primary hover:underline"
          >
            Go to dashboard
          </NuxtLink>
          <p v-else>
            <NuxtLink
              :to="authCrossLinks.loginLink"
              class="font-medium text-primary hover:underline"
            >
              Sign in
            </NuxtLink>
            <span class="mx-2">·</span>
            <NuxtLink
              :to="authCrossLinks.registerLink"
              class="font-medium text-primary hover:underline"
            >
              Create account
            </NuxtLink>
          </p>
        </template>
        <template #placeholder>
          <span class="inline-block h-4 w-40 animate-pulse rounded bg-elevated" />
        </template>
      </AuthState>
    </footer>
  </div>
</template>
