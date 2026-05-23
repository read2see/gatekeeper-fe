<script setup lang="ts">
import { getErrorMessage } from '~/utils/api-errors'
import {
  formatScopesInput,
  parseScopesInput,
  updateApiKeyScopesSchema,
  type UpdateApiKeyScopesFormData
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
const { getApiKey, updateApiKeyScopes } = useApiKeys(organizationId, serviceId)
const { organizationName } = useOrgContext()

const { data: service } = await useAsyncData(
  () => `service-api-key-scopes-${organizationId}-${serviceId}`,
  () => getService(serviceId)
)

const { data: existing, pending, error, refresh } = await useAsyncData(
  () => `api-key-scopes-${organizationId}-${serviceId}-${keyId}`,
  () => getApiKey(keyId)
)

const state = reactive<UpdateApiKeyScopesFormData>({
  scopes: ''
})

watch(existing, (apiKey) => {
  if (!apiKey) {
    return
  }

  state.scopes = formatScopesInput(apiKey.scopes)
}, { immediate: true })

const { onSubmit, loading, formError } = useFormSubmit<UpdateApiKeyScopesFormData>({
  successMessage: 'API key scopes updated',
  async submit(data) {
    await updateApiKeyScopes(keyId, {
      scopes: parseScopesInput(data.scopes)
    })
  },
  async onSuccess() {
    await navigateTo(`/org/${organizationId}/services/${serviceId}/api-keys`)
  }
})

const breadcrumbs = computed(() => [
  { label: organizationName.value ?? 'Organization', to: `/org/${organizationId}` },
  { label: 'Services', to: `/org/${organizationId}/services` },
  { label: service.value?.name ?? 'Service', to: `/org/${organizationId}/services/${serviceId}` },
  { label: 'API keys', to: `/org/${organizationId}/services/${serviceId}/api-keys` },
  { label: 'Edit scopes' }
])
</script>

<template>
  <FormsResourceFormPage
    v-if="existing"
    title="Edit API key scopes"
    :description="`Update scopes for ${existing.name}`"
    topbar-title="Edit API key scopes"
    :breadcrumbs="breadcrumbs"
    :schema="updateApiKeyScopesSchema"
    :state="state"
    submit-label="Save changes"
    :loading="loading"
    :form-error="formError"
    :cancel-to="`/org/${organizationId}/services/${serviceId}/api-keys`"
    @submit="onSubmit"
  >
    <UFormField
      label="Scopes"
      name="scopes"
      hint="Comma-separated list of scopes"
      required
    >
      <UTextarea
        v-model="state.scopes"
        :rows="3"
        placeholder="users:read, users:write"
      />
    </UFormField>
  </FormsResourceFormPage>

  <UDashboardPanel v-else>
    <template #body>
      <UiLoadingState
        v-if="pending"
        message="Loading API key..."
      />

      <UiErrorState
        v-else-if="error"
        title="Failed to load API key"
        :message="getErrorMessage(error)"
        retryable
        @retry="refresh()"
      />

      <UiEmptyState
        v-else
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
    </template>
  </UDashboardPanel>
</template>
