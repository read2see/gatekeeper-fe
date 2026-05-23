<script setup lang="ts">
import {
  changePasswordSchema,
  updateProfileSchema,
  type ChangePasswordFormData,
  type UpdateProfileFormData
} from '~/schemas/auth'
import { apiSpec } from '~/types/api-spec'
import type { AuthMeResponse, UserProfile } from '~/types/domain'
import { formatRoleCode } from '~/utils/table'

definePageMeta({
  layout: 'dashboard'
})

const { user, platformRoles, organizations } = useAuth()
const { session } = useUserSession()
const api = useApiClient()
const { syncHasAvatar } = useProfileAvatar()

await useAsyncData('profile-me', async () => {
  const profile = await api.get<AuthMeResponse>(apiSpec.users.me.path)

  syncHasAvatar(profile.has_avatar === true)

  return profile
})

const profileState = reactive<UpdateProfileFormData>({
  full_name: user.value?.full_name ?? ''
})

watch(user, (currentUser) => {
  if (!currentUser) {
    return
  }

  profileState.full_name = currentUser.full_name ?? ''
})

const {
  onSubmit: onProfileSubmit,
  loading: profileLoading,
  formError: profileError
} = useFormSubmit<UpdateProfileFormData>({
  successMessage: 'Profile updated successfully',
  async submit(data) {
    await api.patch<{ full_name: string }>(apiSpec.users.updateMe.path, {
      body: { full_name: data.full_name }
    })

    const profile = await api.get<UserProfile>(apiSpec.users.me.path)

    if (session.value?.user) {
      session.value = {
        ...session.value,
        user: {
          ...session.value.user,
          full_name: profile.full_name
        }
      }
    }
  }
})

const passwordState = reactive<ChangePasswordFormData>({
  current_password: '',
  new_password: ''
})

const {
  onSubmit: onPasswordSubmit,
  loading: passwordLoading,
  formError: passwordError
} = useFormSubmit<ChangePasswordFormData>({
  async submit(data) {
    return await $fetch<{ message?: string }>('/api/auth/change-password', {
      method: 'POST',
      body: data
    })
  },
  successMessage: result => result?.message ?? 'Password changed successfully',
  onSuccess() {
    passwordState.current_password = ''
    passwordState.new_password = ''
  }
})
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <LayoutTopbar title="Profile" />
    </template>

    <template #body>
      <div class="mx-auto flex w-full max-w-3xl flex-col gap-6 p-4 sm:p-6">
        <UiPageHeader
          title="Profile"
          description="Manage your account settings and organization memberships"
        />

        <UCard>
          <template #header>
            <h2 class="text-base font-semibold text-highlighted">
              Identity
            </h2>
          </template>

          <ProfileAvatarEditor
            :full-name="user?.full_name"
            :email="user?.email"
            class="mb-6"
          />

          <div class="mb-6 space-y-1 text-sm">
            <p class="text-muted">
              Email
            </p>
            <p class="font-medium text-highlighted">
              {{ user?.email }}
            </p>
            <UBadge
              v-if="user?.email_verified"
              color="success"
              variant="subtle"
              size="xs"
              class="mt-2"
            >
              Verified
            </UBadge>
            <UBadge
              v-else
              color="warning"
              variant="subtle"
              size="xs"
              class="mt-2"
            >
              Email not verified
            </UBadge>
          </div>

          <UForm
            :schema="updateProfileSchema"
            :state="profileState"
            class="space-y-4"
            @submit="onProfileSubmit"
          >
            <UFormField
              label="Full name"
              name="full_name"
              required
            >
              <UInput
                v-model="profileState.full_name"
                autocomplete="name"
                placeholder="Jane Doe"
              />
            </UFormField>

            <UiFormErrorAlert :message="profileError" />

            <UButton
              type="submit"
              :loading="profileLoading"
            >
              Save changes
            </UButton>
          </UForm>
        </UCard>

        <UCard>
          <template #header>
            <h2 class="text-base font-semibold text-highlighted">
              Change password
            </h2>
          </template>

          <UForm
            :schema="changePasswordSchema"
            :state="passwordState"
            class="space-y-4"
            @submit="onPasswordSubmit"
          >
            <UFormField
              label="Current password"
              name="current_password"
              required
            >
              <UInput
                v-model="passwordState.current_password"
                type="password"
                autocomplete="current-password"
              />
            </UFormField>

            <UFormField
              label="New password"
              name="new_password"
              required
            >
              <UInput
                v-model="passwordState.new_password"
                type="password"
                autocomplete="new-password"
                placeholder="At least 8 characters"
              />
            </UFormField>

            <UiFormErrorAlert :message="passwordError" />

            <UButton
              type="submit"
              :loading="passwordLoading"
            >
              Update password
            </UButton>
          </UForm>
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

        <UCard>
          <template #header>
            <div class="flex items-center justify-between gap-4">
              <h2 class="text-base font-semibold text-highlighted">
                Organizations
              </h2>
              <UButton
                to="/app/organizations/new"
                size="xs"
                icon="i-lucide-plus"
              >
                Create
              </UButton>
            </div>
          </template>

          <div
            v-if="organizations.length"
            class="divide-y divide-default"
          >
            <div
              v-for="organization in organizations"
              :key="organization.id"
              class="flex flex-col gap-3 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
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
                  :to="`/org/${organization.id}`"
                  size="xs"
                  variant="ghost"
                  trailing-icon="i-lucide-arrow-right"
                >
                  Open
                </UButton>
              </div>
            </div>
          </div>

          <UiEmptyState
            v-else
            title="No organizations"
            description="Create an organization to start managing API services."
            icon="i-lucide-building-2"
          >
            <template #actions>
              <UButton
                to="/app/organizations/new"
                icon="i-lucide-plus"
              >
                Create organization
              </UButton>
            </template>
          </UiEmptyState>
        </UCard>
      </div>
    </template>
  </UDashboardPanel>
</template>
