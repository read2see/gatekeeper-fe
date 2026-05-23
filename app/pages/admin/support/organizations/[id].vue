<script setup lang="ts">
import type { AdminOrganization, AdminOrganizationInspection, AdminOrganizationMember } from '~/types/domain'
import { getErrorMessage } from '~/utils/api-errors'
import { formatRoleCode, formatTableDate } from '~/utils/table'

definePageMeta({
  layout: 'dashboard',
  middleware: ['admin']
})

const route = useRoute()
const organizationId = computed(() => route.params.id as string)

const { inspectOrganization, suspendOrganization, reactivateOrganization } = useAdmin()
const { confirm } = useConfirm()
const toast = useAppToast()

const { data, pending, error, refresh } = await useAsyncData(
  'admin-inspect-organization',
  () => inspectOrganization(organizationId.value),
  { watch: [organizationId] }
)

function resolveOrganization(
  inspection: AdminOrganizationInspection | null | undefined
): AdminOrganization | null {
  if (!inspection) {
    return null
  }

  if (inspection.organization) {
    return inspection.organization
  }

  if (inspection.id && inspection.name) {
    return {
      id: inspection.id,
      name: inspection.name,
      slug: inspection.slug ?? '',
      status: inspection.status,
      created_at: inspection.created_at,
      updated_at: inspection.updated_at
    }
  }

  return null
}

const organization = computed(() => resolveOrganization(data.value))
const members = computed(() => data.value?.members ?? data.value?.memberships ?? [])
const isActive = computed(() => organization.value?.status !== 'SUSPENDED')

const breadcrumbs = computed(() => [
  { label: 'Admin', to: '/admin' },
  { label: 'Organizations', to: '/admin/organizations' },
  { label: organization.value?.name ?? 'Organization' }
])

function memberDisplayName(member: AdminOrganizationMember) {
  return member.full_name ?? member.email ?? member.user_id ?? '—'
}

const statCards = computed(() => {
  const inspection = data.value
  if (!inspection) {
    return []
  }

  const entries = [
    { key: 'member_count', label: 'Members' },
    { key: 'service_count', label: 'Services' },
    { key: 'consumer_count', label: 'Consumers' }
  ] as const

  return entries
    .filter(entry => typeof inspection[entry.key] === 'number')
    .map(entry => ({
      label: entry.label,
      value: inspection[entry.key] as number
    }))
})

async function toggleOrganizationStatus() {
  if (!organization.value) {
    return
  }

  const suspend = isActive.value
  const accepted = await confirm({
    title: suspend ? 'Suspend organization?' : 'Reactivate organization?',
    description: suspend
      ? `${organization.value.name} and its members will lose access until reactivated.`
      : `${organization.value.name} and its members will regain access.`,
    confirmLabel: suspend ? 'Suspend' : 'Reactivate',
    confirmColor: suspend ? 'error' : 'primary',
    destructive: suspend
  })

  if (!accepted) {
    return
  }

  try {
    if (suspend) {
      await suspendOrganization(organization.value.id)
    } else {
      await reactivateOrganization(organization.value.id)
    }

    toast.showActionSuccess(suspend ? 'Organization suspended' : 'Organization reactivated')
    await refresh()
  } catch (error) {
    toast.showActionError(error)
  }
}
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <LayoutTopbar
        :title="organization?.name ?? 'Organization inspection'"
        :breadcrumbs="breadcrumbs"
      />
    </template>

    <template #body>
      <div class="mx-auto flex w-full max-w-4xl flex-col gap-6 p-4 sm:p-6">
        <UiPageHeader
          title="Organization inspection"
          description="Support view for organization details and membership"
        >
          <template #actions>
            <UButton
              to="/admin/organizations"
              color="neutral"
              variant="ghost"
              icon="i-lucide-arrow-left"
            >
              Back to organizations
            </UButton>
          </template>
        </UiPageHeader>

        <UiLoadingState
          v-if="pending && !data"
          message="Loading organization details..."
        />

        <UiErrorState
          v-else-if="error"
          title="Failed to load organization"
          :message="getErrorMessage(error)"
          retryable
          @retry="refresh()"
        />

        <template v-else-if="organization">
          <UCard>
            <template #header>
              <div class="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 class="text-base font-semibold text-highlighted">
                    {{ organization.name }}
                  </h2>
                  <p class="text-sm text-muted">
                    {{ organization.slug }}
                  </p>
                </div>

                <div class="flex flex-wrap items-center gap-2">
                  <UiStatusBadge :status="organization.status ?? 'ACTIVE'" />
                  <UButton
                    :to="`/org/${organization.id}`"
                    color="neutral"
                    variant="soft"
                    size="sm"
                    icon="i-lucide-arrow-right"
                  >
                    Open dashboard
                  </UButton>
                  <UButton
                    :color="isActive ? 'error' : 'primary'"
                    variant="soft"
                    size="sm"
                    :icon="isActive ? 'i-lucide-pause' : 'i-lucide-play'"
                    @click="toggleOrganizationStatus()"
                  >
                    {{ isActive ? 'Suspend' : 'Reactivate' }}
                  </UButton>
                </div>
              </div>
            </template>

            <dl class="grid gap-4 sm:grid-cols-2">
              <div>
                <dt class="text-sm text-muted">
                  Organization ID
                </dt>
                <dd class="mt-1 font-mono text-sm text-highlighted">
                  {{ organization.id }}
                </dd>
              </div>
              <div>
                <dt class="text-sm text-muted">
                  Created
                </dt>
                <dd class="mt-1 text-sm text-highlighted">
                  {{ formatTableDate(organization.created_at) }}
                </dd>
              </div>
              <div>
                <dt class="text-sm text-muted">
                  Updated
                </dt>
                <dd class="mt-1 text-sm text-highlighted">
                  {{ formatTableDate(organization.updated_at) }}
                </dd>
              </div>
            </dl>
          </UCard>

          <div
            v-if="statCards.length"
            class="grid gap-4 sm:grid-cols-3"
          >
            <UCard
              v-for="stat in statCards"
              :key="stat.label"
            >
              <div class="space-y-1">
                <p class="text-sm text-muted">
                  {{ stat.label }}
                </p>
                <p class="text-2xl font-semibold text-highlighted">
                  {{ stat.value.toLocaleString() }}
                </p>
              </div>
            </UCard>
          </div>

          <UCard>
            <template #header>
              <h2 class="text-base font-semibold text-highlighted">
                Members
              </h2>
            </template>

            <UiEmptyState
              v-if="!members.length"
              title="No members"
              description="This organization has no members yet."
              icon="i-lucide-users"
            />

            <div
              v-else
              class="divide-y divide-default"
            >
              <div
                v-for="(member, index) in members"
                :key="member.id ?? member.user_id ?? index"
                class="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
              >
                <div class="min-w-0">
                  <p class="truncate font-medium text-highlighted">
                    {{ memberDisplayName(member) }}
                  </p>
                  <p
                    v-if="member.email && member.full_name"
                    class="truncate text-sm text-muted"
                  >
                    {{ member.email }}
                  </p>
                </div>

                <div class="flex shrink-0 items-center gap-2">
                  <UiStatusBadge
                    v-if="member.status"
                    :status="member.status"
                  />
                  <UBadge
                    color="neutral"
                    variant="subtle"
                    size="xs"
                  >
                    {{ formatRoleCode(member.role_code) }}
                  </UBadge>
                </div>
              </div>
            </div>
          </UCard>
        </template>

        <UiEmptyState
          v-else
          title="Organization not found"
          description="The requested organization could not be loaded."
          icon="i-lucide-building-2"
        >
          <template #actions>
            <UButton
              to="/admin/organizations"
              icon="i-lucide-arrow-left"
            >
              Back to organizations
            </UButton>
          </template>
        </UiEmptyState>
      </div>
    </template>
  </UDashboardPanel>
</template>
