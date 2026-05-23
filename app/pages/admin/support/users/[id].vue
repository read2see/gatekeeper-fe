<script setup lang="ts">
import type { AdminUser, AdminUserInspection } from '~/types/domain'
import { getErrorMessage } from '~/utils/api-errors'
import { formatRoleCode, formatTableDate } from '~/utils/table'

definePageMeta({
  layout: 'dashboard',
  middleware: ['admin']
})

const route = useRoute()
const userId = computed(() => route.params.id as string)

const { inspectUser, suspendUser, reactivateUser } = useAdmin()
const { confirm } = useConfirm()
const toast = useAppToast()

const { data, pending, error, refresh } = await useAsyncData(
  'admin-inspect-user',
  () => inspectUser(userId.value),
  { watch: [userId] }
)

function resolveUser(inspection: AdminUserInspection | null | undefined): AdminUser | null {
  if (!inspection) {
    return null
  }

  if (inspection.user) {
    return inspection.user
  }

  if (inspection.id && inspection.email) {
    return {
      id: inspection.id,
      email: inspection.email,
      full_name: inspection.full_name ?? '',
      active: inspection.active,
      email_verified: inspection.email_verified,
      platform_roles: inspection.platform_roles,
      created_at: inspection.created_at,
      updated_at: inspection.updated_at
    }
  }

  return null
}

const user = computed(() => resolveUser(data.value))
const platformRoles = computed(() =>
  data.value?.platform_roles ?? user.value?.platform_roles ?? []
)
const organizations = computed(() => data.value?.organizations ?? [])
const memberships = computed(() => data.value?.memberships ?? [])

const isActive = computed(() => user.value?.active !== false)

async function toggleUserStatus() {
  if (!user.value) {
    return
  }

  const suspend = isActive.value
  const accepted = await confirm({
    title: suspend ? 'Suspend user?' : 'Reactivate user?',
    description: suspend
      ? `${user.value.full_name || user.value.email} will lose access until reactivated.`
      : `${user.value.full_name || user.value.email} will regain access to the platform.`,
    confirmLabel: suspend ? 'Suspend' : 'Reactivate',
    confirmColor: suspend ? 'error' : 'primary',
    destructive: suspend
  })

  if (!accepted) {
    return
  }

  try {
    if (suspend) {
      await suspendUser(user.value.id)
    } else {
      await reactivateUser(user.value.id)
    }

    toast.showActionSuccess(suspend ? 'User suspended' : 'User reactivated')
    await refresh()
  } catch (error) {
    toast.showActionError(error)
  }
}
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <LayoutTopbar title="User inspection" />
    </template>

    <template #body>
      <div class="mx-auto flex w-full max-w-4xl flex-col gap-6 p-4 sm:p-6">
        <UiPageHeader
          title="User inspection"
          description="Support view for platform user account details"
        >
          <template #actions>
            <UButton
              to="/admin/users"
              color="neutral"
              variant="ghost"
              icon="i-lucide-arrow-left"
            >
              Back to users
            </UButton>
          </template>
        </UiPageHeader>

        <UiLoadingState
          v-if="pending && !data"
          message="Loading user details..."
        />

        <UiErrorState
          v-else-if="error"
          title="Failed to load user"
          :message="getErrorMessage(error)"
          retryable
          @retry="refresh()"
        />

        <template v-else-if="user">
          <UCard>
            <template #header>
              <div class="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 class="text-base font-semibold text-highlighted">
                    {{ user.full_name || user.email }}
                  </h2>
                  <p class="text-sm text-muted">
                    {{ user.email }}
                  </p>
                </div>

                <div class="flex flex-wrap items-center gap-2">
                  <UiStatusBadge :status="isActive ? 'ACTIVE' : 'SUSPENDED'" />
                  <UBadge
                    :color="user.email_verified ? 'success' : 'warning'"
                    variant="subtle"
                    size="xs"
                  >
                    {{ user.email_verified ? 'Verified' : 'Unverified' }}
                  </UBadge>
                  <UButton
                    :color="isActive ? 'error' : 'primary'"
                    variant="soft"
                    size="sm"
                    :icon="isActive ? 'i-lucide-pause' : 'i-lucide-play'"
                    @click="toggleUserStatus()"
                  >
                    {{ isActive ? 'Suspend' : 'Reactivate' }}
                  </UButton>
                </div>
              </div>
            </template>

            <dl class="grid gap-4 sm:grid-cols-2">
              <div>
                <dt class="text-sm text-muted">
                  User ID
                </dt>
                <dd class="mt-1 font-mono text-sm text-highlighted">
                  {{ user.id }}
                </dd>
              </div>
              <div>
                <dt class="text-sm text-muted">
                  Created
                </dt>
                <dd class="mt-1 text-sm text-highlighted">
                  {{ formatTableDate(user.created_at) }}
                </dd>
              </div>
              <div>
                <dt class="text-sm text-muted">
                  Updated
                </dt>
                <dd class="mt-1 text-sm text-highlighted">
                  {{ formatTableDate(user.updated_at) }}
                </dd>
              </div>
            </dl>
          </UCard>

          <UCard v-if="platformRoles.length">
            <template #header>
              <h2 class="text-base font-semibold text-highlighted">
                Platform roles
              </h2>
            </template>

            <div class="flex flex-wrap gap-2">
              <UBadge
                v-for="role in platformRoles"
                :key="role"
                color="primary"
                variant="subtle"
              >
                {{ formatRoleCode(role) }}
              </UBadge>
            </div>
          </UCard>

          <UCard v-if="organizations.length">
            <template #header>
              <h2 class="text-base font-semibold text-highlighted">
                Organizations
              </h2>
            </template>

            <div class="divide-y divide-default">
              <div
                v-for="organization in organizations"
                :key="organization.id"
                class="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
              >
                <div class="min-w-0">
                  <p class="truncate font-medium text-highlighted">
                    {{ organization.name }}
                  </p>
                  <p class="truncate text-sm text-muted">
                    {{ organization.slug }}
                  </p>
                </div>

                <div class="flex shrink-0 items-center gap-2">
                  <UBadge
                    color="neutral"
                    variant="subtle"
                    size="xs"
                  >
                    {{ formatRoleCode(organization.role_code) }}
                  </UBadge>
                  <UButton
                    :to="`/admin/support/organizations/${organization.id}`"
                    size="xs"
                    variant="ghost"
                    trailing-icon="i-lucide-arrow-right"
                  >
                    Inspect
                  </UButton>
                </div>
              </div>
            </div>
          </UCard>

          <UCard v-if="memberships.length">
            <template #header>
              <h2 class="text-base font-semibold text-highlighted">
                Memberships
              </h2>
            </template>

            <div class="divide-y divide-default">
              <div
                v-for="membership in memberships"
                :key="`${membership.organization_id}-${membership.role_code}`"
                class="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
              >
                <div class="min-w-0">
                  <p class="truncate font-medium text-highlighted">
                    {{ membership.organization_name ?? membership.organization_id }}
                  </p>
                  <p
                    v-if="membership.organization_slug"
                    class="truncate text-sm text-muted"
                  >
                    {{ membership.organization_slug }}
                  </p>
                </div>

                <div class="flex shrink-0 items-center gap-2">
                  <UiStatusBadge
                    v-if="membership.status"
                    :status="membership.status"
                  />
                  <UBadge
                    color="neutral"
                    variant="subtle"
                    size="xs"
                  >
                    {{ formatRoleCode(membership.role_code) }}
                  </UBadge>
                </div>
              </div>
            </div>
          </UCard>
        </template>

        <UiEmptyState
          v-else
          title="User not found"
          description="The requested user could not be loaded."
          icon="i-lucide-user-x"
        >
          <template #actions>
            <UButton
              to="/admin/users"
              icon="i-lucide-arrow-left"
            >
              Back to users
            </UButton>
          </template>
        </UiEmptyState>
      </div>
    </template>
  </UDashboardPanel>
</template>
