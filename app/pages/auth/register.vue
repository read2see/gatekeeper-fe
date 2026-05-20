<script setup lang="ts">
import { registerSchema, type RegisterFormData } from '~/schemas/auth'
import type { OrganizationInvitePreview } from '~/types/domain'
import { getErrorMessage, normalizeApiError } from '~/utils/api-errors'
import { buildAuthCrossLinks } from '~/utils/invite-auth-links'
import { resolvePostLoginRedirect } from '~/utils/redirect'

definePageMeta({
  layout: 'auth',
  middleware: ['guest']
})

const route = useRoute()
const { loggedIn, session, fetch: fetchSession } = useUserSession()

const inviteToken = computed(() => typeof route.query.token === 'string' ? route.query.token : '')
const invitePreview = ref<OrganizationInvitePreview>()

const state = reactive<RegisterFormData>({
  email: '',
  password: '',
  full_name: '',
  invite_token: inviteToken.value || undefined
})

function extractInvitePreview(source: unknown): OrganizationInvitePreview | undefined {
  if (!source || typeof source !== 'object') {
    return undefined
  }

  const record = source as Record<string, unknown>
  const nested = record.data && typeof record.data === 'object'
    ? record.data as Record<string, unknown>
    : record

  const organization = nested.organization
  const hasPreviewFields = typeof nested.email === 'string'
    || typeof nested.role_code === 'string'
    || (organization && typeof organization === 'object' && 'name' in organization)

  if (!hasPreviewFields) {
    return undefined
  }

  return nested as OrganizationInvitePreview
}

async function loadInvitePreview() {
  if (!inviteToken.value) {
    return
  }

  state.invite_token = inviteToken.value

  try {
    const result = await $fetch<{ data?: OrganizationInvitePreview, message?: string }>('/api/auth/invite', {
      query: { token: inviteToken.value }
    })

    const preview = extractInvitePreview(result) ?? extractInvitePreview(result.data)
    if (preview) {
      invitePreview.value = preview
      if (preview.email && !state.email) {
        state.email = preview.email
      }
    }
  } catch (error) {
    const normalized = normalizeApiError(error)
    const preview = extractInvitePreview(normalized.data)

    if (preview && (normalized.statusCode === 401 || normalized.statusCode === 403)) {
      invitePreview.value = preview
      if (preview.email && !state.email) {
        state.email = preview.email
      }
      return
    }

    useAppToast().showError(
      getErrorMessage(error, 'Unable to load invitation details.'),
      'Invitation unavailable'
    )
  }
}

function resolveInviteOrganizationRedirect(): string | undefined {
  const organizationId = invitePreview.value?.organization?.id
  if (organizationId) {
    return `/org/${organizationId}`
  }

  return undefined
}

const pageTitle = computed(() => {
  if (invitePreview.value?.organization?.name) {
    return `Join ${invitePreview.value.organization.name}`
  }

  if (inviteToken.value) {
    return 'Complete your invitation'
  }

  return 'Create account'
})

const pageDescription = computed(() => {
  if (invitePreview.value?.organization?.name) {
    return `Create an account to join ${invitePreview.value.organization.name}`
  }

  if (inviteToken.value) {
    return 'Create an account to accept your organization invitation'
  }

  return 'Register for a new Gatekeeper account'
})

const submitLabel = computed(() => inviteToken.value ? 'Create account and join' : 'Create account')

const loginLink = computed(() => buildAuthCrossLinks(route.query).loginLink)

const { onSubmit, loading, formError } = useFormSubmit<RegisterFormData>({
  async submit(data) {
    return await $fetch<{ message?: string }>('/api/auth/register', {
      method: 'POST',
      body: data
    })
  },
  successMessage: result => result?.message ?? (
    inviteToken.value
      ? 'Account created. Welcome to your organization.'
      : 'Account created. Check your email to verify your address.'
  ),
  async onSuccess() {
    await fetchSession()

    if (!loggedIn.value) {
      return
    }

    const orgRedirect = resolveInviteOrganizationRedirect()
    if (orgRedirect) {
      await navigateTo(orgRedirect)
      return
    }

    await navigateTo(resolvePostLoginRedirect({
      platformRoles: session.value?.platformRoles,
      organizations: session.value?.organizations
    }))
  }
})

onMounted(() => {
  loadInvitePreview()
})
</script>

<template>
  <FormsAuthFormLayout
    :title="pageTitle"
    :description="pageDescription"
  >
    <UForm
      :schema="registerSchema"
      :state="state"
      class="space-y-4 w-fit mx-auto"
      @submit="onSubmit"
    >
      <UFormField
        label="Full name"
        name="full_name"
        required
      >
        <UInput
          v-model="state.full_name"
          autocomplete="name"
          placeholder="Jane Doe"
        />
      </UFormField>

      <UFormField
        label="Email"
        name="email"
        required
      >
        <UInput
          v-model="state.email"
          type="email"
          autocomplete="email"
          placeholder="you@example.com"
        />
      </UFormField>

      <UFormField
        label="Password"
        name="password"
        required
      >
        <UInput
          v-model="state.password"
          type="password"
          autocomplete="new-password"
          placeholder="At least 8 characters"
        />
      </UFormField>

      <UiFormErrorAlert :message="formError" />

      <UButton
        type="submit"
        block
        :loading="loading"
      >
        {{ submitLabel }}
      </UButton>
    </UForm>

    <template #footer>
      <p>
        Already have an account?
        <NuxtLink
          :to="loginLink"
          class="font-medium text-primary hover:underline"
        >
          Sign in
        </NuxtLink>
      </p>
    </template>
  </FormsAuthFormLayout>
</template>
