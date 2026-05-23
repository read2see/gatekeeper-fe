<script setup lang="ts">
import type { BreadcrumbItem } from '@nuxt/ui'

const props = defineProps<{
  title?: string
  breadcrumbs?: BreadcrumbItem[]
}>()

const route = useRoute()
const { getOrganization } = useOrganizations()

const organizationId = computed(() => {
  const id = route.params.organizationId
  return typeof id === 'string' ? id : undefined
})

const { data: organization } = useAsyncData(
  () => organizationId.value ? `org-context-${organizationId.value}` : 'org-context-skip',
  () => organizationId.value
    ? getOrganization(organizationId.value)
    : Promise.resolve(null),
  { watch: [organizationId] }
)

const organizationName = computed(() => organization.value?.name)

function formatSegmentLabel(segment: string) {
  return segment
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

const autoBreadcrumbs = computed<BreadcrumbItem[]>(() => {
  if (props.breadcrumbs?.length) {
    return props.breadcrumbs
  }

  const segments = route.path.split('/').filter(Boolean)

  if (!segments.length) {
    return []
  }

  const items: BreadcrumbItem[] = []
  let path = ''

  for (const segment of segments) {
    path += `/${segment}`

    if (segment === route.params.organizationId) {
      continue
    }

    if (segment === 'org' && organizationId.value) {
      items.push({
        label: organizationName.value ?? 'Organization',
        to: `/org/${organizationId.value}`
      })
      continue
    }

    items.push({
      label: formatSegmentLabel(segment),
      to: path
    })
  }

  return items
})

const pageTitle = computed(() => {
  if (props.title) {
    return props.title
  }

  const lastCrumb = autoBreadcrumbs.value.at(-1)
  return lastCrumb?.label ?? 'Dashboard'
})
</script>

<template>
  <UDashboardNavbar :title="pageTitle">
    <template #leading>
      <UDashboardSidebarCollapse />
    </template>

    <template
      v-if="autoBreadcrumbs.length > 1"
      #left
    >
      <UBreadcrumb
        :items="autoBreadcrumbs"
        class="hidden md:flex"
      />
    </template>

    <template #right>
      <div class="flex min-w-0 items-center gap-1">
        <LayoutOrganizationSwitcher />
        <LayoutThemeToggle />
        <LayoutUserMenu />
      </div>
    </template>
  </UDashboardNavbar>
</template>
