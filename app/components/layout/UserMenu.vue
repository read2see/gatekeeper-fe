<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

const auth = useAuth()

async function signOut() {
  await auth.logout()
  await navigateTo('/auth/login')
}

const menuItems = computed<DropdownMenuItem[][]>(() => {
  const items: DropdownMenuItem[] = [
    {
      label: 'Profile',
      icon: 'i-lucide-user',
      to: '/app/profile'
    }
  ]

  if (auth.isPlatformStaff.value) {
    items.push({
      label: 'Admin',
      icon: 'i-lucide-shield',
      to: '/admin'
    })
  }

  if (auth.organizationCount.value > 1) {
    items.push({
      label: 'Organizations',
      icon: 'i-lucide-building-2',
      to: '/app/organizations'
    })
  }

  return [
    items,
    [{
      label: 'Sign out',
      icon: 'i-lucide-log-out',
      onSelect: () => { void signOut() }
    }]
  ]
})
</script>

<template>
  <AuthState>
    <template #default="{ user }">
      <UDropdownMenu
        :items="menuItems"
        :content="{ align: 'end' }"
      >
        <UButton
          color="neutral"
          variant="ghost"
          trailing-icon="i-lucide-chevron-down"
          class="max-w-36 sm:max-w-48"
          :aria-label="`User menu for ${user?.full_name || user?.email}`"
        >
          <span class="truncate">
            {{ user?.full_name || user?.email }}
          </span>
        </UButton>
      </UDropdownMenu>
    </template>

    <template #placeholder>
      <USkeleton class="h-8 w-28" />
    </template>
  </AuthState>
</template>
