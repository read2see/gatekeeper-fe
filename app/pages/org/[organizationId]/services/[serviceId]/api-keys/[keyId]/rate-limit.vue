<script setup lang="ts">
import { getErrorMessage, normalizeApiError } from '~/utils/api-errors'
import {
  formatRateLimitSummary,
  rateLimitPolicySchema,
  rateLimitWindowUnitOptions,
  type RateLimitPolicyFormData
} from '~/schemas/api-key'

definePageMeta({
  layout: 'dashboard',
  middleware: ['org']
})

const route = useRoute()
const organizationId = route.params.organizationId as string
const serviceId = route.params.serviceId as string
const keyId = route.params.keyId as string

const { getService } = useServices(organizationId)
const {
  getApiKey,
  getRateLimitPolicy,
  createRateLimitPolicy,
  updateRateLimitPolicy,
  deleteRateLimitPolicy
} = useApiKeys(organizationId, serviceId)
const { organizationName } = useOrgContext()
const { confirm } = useConfirm()
const toast = useAppToast()

const { data: service } = await useAsyncData(
  () => `service-api-key-rate-limit-${organizationId}-${serviceId}`,
  () => getService(serviceId)
)

const {
  data: existingKey,
  pending: keyPending,
  error: keyError,
  refresh: refreshKey
} = await useAsyncData(
  () => `api-key-rate-limit-${organizationId}-${serviceId}-${keyId}`,
  () => getApiKey(keyId)
)

async function fetchRateLimitPolicy() {
  try {
    return await getRateLimitPolicy(keyId)
  } catch (error) {
    if (normalizeApiError(error).statusCode === 404) {
      return null
    }

    throw error
  }
}

const {
  data: existingPolicy,
  pending: policyPending,
  error: policyError,
  refresh: refreshPolicy
} = await useAsyncData(
  () => `api-key-rate-limit-policy-${organizationId}-${serviceId}-${keyId}`,
  fetchRateLimitPolicy
)

const state = reactive<RateLimitPolicyFormData>({
  request_limit: 100,
  window_size: 1,
  window_unit: 'MINUTES'
})

watch(existingPolicy, (policy) => {
  if (!policy) {
    return
  }

  state.request_limit = policy.request_limit
  state.window_size = policy.window_size
  state.window_unit = policy.window_unit
}, { immediate: true })

const isEditMode = computed(() => existingPolicy.value != null)

const readyForForm = computed(() =>
  !!existingKey.value && !policyPending.value && !policyError.value
)

const rateLimitSummary = computed(() =>
  formatRateLimitSummary(state.request_limit, state.window_size, state.window_unit)
)

const { onSubmit, loading, formError } = useFormSubmit<RateLimitPolicyFormData>({
  successMessage: () => isEditMode.value ? 'Rate limit updated' : 'Rate limit created',
  async submit(data) {
    if (existingPolicy.value) {
      await updateRateLimitPolicy(keyId, data)
      return
    }

    await createRateLimitPolicy(keyId, data)
  },
  async onSuccess() {
    await navigateTo(`/org/${organizationId}/services/${serviceId}/api-keys`)
  }
})

const removing = ref(false)

async function removeRateLimit() {
  const accepted = await confirm({
    title: 'Remove rate limit?',
    description: `Rate limiting will be removed from ${existingKey.value?.name}.`,
    confirmLabel: 'Remove',
    confirmColor: 'error',
    destructive: true
  })

  if (!accepted) {
    return
  }

  removing.value = true

  try {
    await deleteRateLimitPolicy(keyId)
    toast.showActionSuccess('Rate limit removed')
    await navigateTo(`/org/${organizationId}/services/${serviceId}/api-keys`)
  } catch (error) {
    toast.showActionError(error, 'Remove failed')
  } finally {
    removing.value = false
  }
}

const breadcrumbs = computed(() => [
  { label: organizationName.value ?? 'Organization', to: `/org/${organizationId}` },
  { label: 'Services', to: `/org/${organizationId}/services` },
  { label: service.value?.name ?? 'Service', to: `/org/${organizationId}/services/${serviceId}` },
  { label: 'API keys', to: `/org/${organizationId}/services/${serviceId}/api-keys` },
  { label: isEditMode.value ? 'Edit rate limit' : 'Set rate limit' }
])
</script>

<template>
  <FormsResourceFormPage
    v-if="readyForForm"
    :title="isEditMode ? 'Edit rate limit' : 'Set rate limit'"
    :description="`${isEditMode ? 'Update' : 'Configure'} rate limiting for ${existingKey?.name}`"
    :topbar-title="isEditMode ? 'Edit rate limit' : 'Set rate limit'"
    :breadcrumbs="breadcrumbs"
    :schema="rateLimitPolicySchema"
    :state="state"
    :submit-label="isEditMode ? 'Save changes' : 'Set rate limit'"
    :loading="loading"
    :form-error="formError"
    :cancel-to="`/org/${organizationId}/services/${serviceId}/api-keys`"
    @submit="onSubmit"
  >
    <UFormField
      label="Request limit"
      name="request_limit"
      hint="Maximum number of requests allowed in the window"
      required
    >
      <UInput
        v-model="state.request_limit"
        type="number"
        min="1"
      />
    </UFormField>

    <UFormField
      label="Window size"
      name="window_size"
      required
    >
      <UInput
        v-model="state.window_size"
        type="number"
        min="1"
      />
    </UFormField>

    <UFormField
      label="Window unit"
      name="window_unit"
      required
    >
      <USelect
        v-model="state.window_unit"
        :items="[...rateLimitWindowUnitOptions]"
        value-key="value"
        label-key="label"
      />
    </UFormField>

    <p class="text-sm text-muted">
      {{ rateLimitSummary }}
    </p>

    <template
      v-if="isEditMode"
      #actions
    >
      <UButton
        color="error"
        variant="ghost"
        icon="i-lucide-trash-2"
        :loading="removing"
        @click="removeRateLimit"
      >
        Remove rate limit
      </UButton>
    </template>
  </FormsResourceFormPage>

  <UDashboardPanel v-else>
    <template #body>
      <UiLoadingState
        v-if="keyPending"
        message="Loading API key..."
      />

      <UiErrorState
        v-else-if="keyError"
        title="Failed to load API key"
        :message="getErrorMessage(keyError)"
        retryable
        @retry="refreshKey()"
      />

      <UiEmptyState
        v-else-if="!existingKey"
        title="API key not found"
        description="The requested API key could not be loaded."
        icon="i-lucide-key"
      >
        <template #actions>
          <UButton
            :to="`/org/${organizationId}/services/${serviceId}/api-keys`"
            icon="i-lucide-arrow-left"
          >
            Back to API keys
          </UButton>
        </template>
      </UiEmptyState>

      <UiLoadingState
        v-else-if="policyPending"
        message="Loading rate limit..."
      />

      <UiErrorState
        v-else-if="policyError"
        title="Failed to load rate limit"
        :message="getErrorMessage(policyError)"
        retryable
        @retry="refreshPolicy()"
      />
    </template>
  </UDashboardPanel>
</template>
