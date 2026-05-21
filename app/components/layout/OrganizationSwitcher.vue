<script setup lang="ts">
const auth = useAuth()
const route = useRoute()

const showSwitcher = computed(() => route.path.startsWith('/org/'))

const currentOrganizationId = computed(() => {
  if (!showSwitcher.value) {
    return undefined
  }

  const organizationId = route.params.organizationId
  return typeof organizationId === 'string' ? organizationId : undefined
})

const organizationItems = computed(() =>
  auth.organizations.value.map(organization => ({
    label: organization.name,
    description: organization.slug,
    to: `/org/${organization.id}`,
    active: organization.id === currentOrganizationId.value
  }))
)

const currentOrganization = computed(() =>
  auth.organizations.value.find(organization => organization.id === currentOrganizationId.value)
)
</script>

<template>
  <UDropdownMenu
    v-if="showSwitcher && organizationItems.length"
    :items="[organizationItems]"
    :content="{ align: 'end' }"
  >
    <UButton
      color="neutral"
      variant="ghost"
      trailing-icon="i-lucide-chevrons-up-down"
      class="max-w-28 sm:max-w-48"
      :aria-label="`Switch organization. Current: ${currentOrganization?.name ?? 'none selected'}`"
    >
      <span class="truncate">
        {{ currentOrganization?.name ?? 'Select organization' }}
      </span>
    </UButton>
  </UDropdownMenu>
</template>
