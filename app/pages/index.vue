<script setup lang="ts">
import { resolvePostLoginRedirect } from '~/utils/redirect'

const appConfig = useAppConfig()
const { loggedIn, ready, fetch, session } = useUserSession()

if (!ready.value) {
  await fetch()
}

if (loggedIn.value) {
  await navigateTo(resolvePostLoginRedirect({
    platformRoles: session.value?.platformRoles,
    organizations: session.value?.organizations
  }))
}
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <header class="border-b border-default">
      <div class="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
        <NuxtLink
          to="/"
          class="inline-flex items-center gap-2 font-semibold text-default"
        >
          <UIcon
            name="i-lucide-shield-check"
            class="size-6 text-primary"
          />
          {{ appConfig.app.name }}
        </NuxtLink>

        <div class="flex items-center gap-2">
          <UButton
            to="/auth/login"
            color="neutral"
            variant="ghost"
            size="sm"
            class="sm:size-default"
          >
            Sign in
          </UButton>
          <UButton
            to="/auth/register"
            size="sm"
            class="sm:size-default"
          >
            Create account
          </UButton>
        </div>
      </div>
    </header>

    <main
      id="main-content"
      class="flex flex-1 flex-col items-center justify-center px-4 py-16 sm:px-6"
      tabindex="-1"
    >
      <div class="mx-auto max-w-2xl text-center">
        <UIcon
          name="i-lucide-shield-check"
          class="mx-auto mb-6 size-16 text-primary"
        />

        <h1 class="text-3xl font-bold tracking-tight text-highlighted sm:text-4xl">
          API gateway management
        </h1>

        <p class="mt-4 text-lg text-muted">
          Manage organizations, services, consumers, and API keys from a unified dashboard.
        </p>

        <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
          <UButton
            to="/auth/login"
            size="lg"
            trailing-icon="i-lucide-arrow-right"
          >
            Sign in
          </UButton>
          <UButton
            to="/auth/register"
            size="lg"
            color="neutral"
            variant="outline"
          >
            Create account
          </UButton>
        </div>
      </div>
    </main>
  </div>
</template>
