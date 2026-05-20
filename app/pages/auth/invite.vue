<script setup lang="ts">
import type { OrganizationInvitePreview } from '~/types/domain'
import { getErrorMessage, normalizeApiError } from '~/utils/api-errors'
import { resolvePostLoginRedirect } from '~/utils/redirect'

definePageMeta({
  layout: 'auth'
})

type InviteStatus = 'loading' | 'accepted' | 'preview' | 'error'

const route = useRoute()
const { loggedIn, session, fetch: fetchSession } = useUserSession()
const toast = useAppToast()

const token = computed(() => typeof route.query.token === 'string' ? route.query.token : '')
const status = ref<InviteStatus>('loading')
const preview = ref<OrganizationInvitePreview>()
const message = ref<string>()

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

function resolveOrganizationRedirect(data?: OrganizationInvitePreview): string | undefined {
  const organizationId = data?.organization?.id
  if (organizationId) {
    return `/org/${organizationId}`
  }

  return undefined
}

async function redirectAfterAccept(data?: OrganizationInvitePreview) {
  await fetchSession()

  const orgRedirect = resolveOrganizationRedirect(data)
  if (orgRedirect) {
    await navigateTo(orgRedirect)
    return
  }

  await navigateTo(resolvePostLoginRedirect({
    platformRoles: session.value?.platformRoles,
    organizations: session.value?.organizations
  }))
}

async function processInvite() {
  if (!token.value) {
    status.value = 'error'
    message.value = 'Invite token is missing from the link.'
    return
  }

  status.value = 'loading'

  try {
    const result = await $fetch<{ data?: OrganizationInvitePreview, message?: string }>('/api/auth/invite', {
      query: { token: token.value }
    })

    const inviteData = extractInvitePreview(result) ?? extractInvitePreview(result.data)

    if (loggedIn.value) {
      status.value = 'accepted'
      const successMessage = result.message ?? 'Invitation accepted.'
      toast.showSuccess(successMessage, 'Invitation accepted')
      await redirectAfterAccept(inviteData)
      return
    }

    if (inviteData) {
      preview.value = inviteData
      status.value = 'preview'
      return
    }

    status.value = 'error'
    message.value = result.message ?? 'Unable to load invitation details.'
  } catch (error) {
    const normalized = normalizeApiError(error)
    const invitePreview = extractInvitePreview(normalized.data)

    if (!loggedIn.value && invitePreview && (normalized.statusCode === 401 || normalized.statusCode === 403)) {
      preview.value = invitePreview
      status.value = 'preview'
      return
    }

    status.value = 'error'
    message.value = getErrorMessage(error, 'This invitation link is invalid or has expired.')
  }
}

const registerLink = computed(() => ({
  path: '/auth/register',
  query: { token: token.value }
}))

const loginLink = computed(() => ({
  path: '/auth/login',
  query: { redirect: route.fullPath }
}))

const pageTitle = computed(() => {
  if (status.value === 'preview' && preview.value?.organization?.name) {
    return `Join ${preview.value.organization.name}`
  }

  return 'Organization invitation'
})

const pageDescription = computed(() => {
  if (status.value === 'preview') {
    return 'Sign in or create an account to accept this invitation.'
  }

  if (status.value === 'accepted') {
    return 'Taking you to your organization...'
  }

  if (status.value === 'error') {
    return 'Unable to process this invitation'
  }

  return 'Processing your invitation'
})

onMounted(() => {
  processInvite()
})
</script>

<template>
  <FormsAuthFormLayout
    :title="pageTitle"
    :description="pageDescription"
  >
    <div class="space-y-4">
      <UiLoadingState
        v-if="status === 'loading' || status === 'accepted'"
        :message="status === 'accepted' ? 'Redirecting to your organization...' : 'Processing your invitation...'"
      />

      <template v-else-if="status === 'preview' && preview">
        <UAlert
          color="info"
          variant="subtle"
          title="You have been invited"
          description="Accept this invitation to join the organization below."
        />

        <dl class="space-y-3 rounded-lg border border-default p-4 text-sm">
          <div
            v-if="preview.organization?.name"
            class="flex flex-col gap-1"
          >
            <dt class="text-muted">
              Organization
            </dt>
            <dd class="font-medium text-highlighted">
              {{ preview.organization.name }}
            </dd>
          </div>

          <div
            v-if="preview.email"
            class="flex flex-col gap-1"
          >
            <dt class="text-muted">
              Invited email
            </dt>
            <dd class="font-medium text-highlighted">
              {{ preview.email }}
            </dd>
          </div>

          <div
            v-if="preview.role_code"
            class="flex flex-col gap-1"
          >
            <dt class="text-muted">
              Role
            </dt>
            <dd>
              <UiRoleBadge :role="preview.role_code" />
            </dd>
          </div>
        </dl>

        <div class="space-y-3">
          <UButton
            :to="registerLink"
            block
          >
            Create account
          </UButton>

          <UButton
            :to="loginLink"
            block
            variant="outline"
          >
            Sign in
          </UButton>
        </div>
      </template>

      <template v-else-if="status === 'error'">
        <UAlert
          color="error"
          variant="subtle"
          title="Invitation unavailable"
          :description="message"
        />

        <UButton
          to="/auth/login"
          block
        >
          Go to sign in
        </UButton>
      </template>
    </div>
  </FormsAuthFormLayout>
</template>
