<script setup lang="ts">
import {
  createApiKeySchema,
  parseScopesInput,
  type CreateApiKeyFormData
} from '~/schemas/api-key'

definePageMeta({
  layout: 'dashboard',
  middleware: ['org']
})

const route = useRoute()
const organizationId = route.params.organizationId as string
const serviceId = route.params.serviceId as string

const { getService } = useServices(organizationId)
const { listConsumers } = useConsumers(organizationId)
const { createApiKey } = useApiKeys(organizationId, serviceId)
const { organizationName } = useOrgContext()
const toast = useAppToast()

const { data: service } = await useAsyncData(
  () => `service-api-key-new-${organizationId}-${serviceId}`,
  () => getService(serviceId)
)

const { data: consumersData } = await useAsyncData(
  () => `consumers-for-api-key-new-${organizationId}`,
  () => listConsumers({ size: 100, status: 'ACTIVE' })
)

const consumerOptions = computed(() =>
  (consumersData.value?.items ?? []).map(consumer => ({
    label: consumer.name,
    value: consumer.id
  }))
)

const createdKeyValue = ref<string | null>(null)

const state = reactive<CreateApiKeyFormData>({
  consumer_id: '',
  name: '',
  scopes: '',
  expires_at: ''
})

watch(consumerOptions, (options) => {
  if (!state.consumer_id && options[0]) {
    state.consumer_id = options[0].value
  }
}, { immediate: true })

const { onSubmit, loading, formError } = useFormSubmit<CreateApiKeyFormData>({
  successMessage: 'API key created',
  async submit(data) {
    const apiKey = await createApiKey({
      consumer_id: data.consumer_id,
      name: data.name,
      scopes: parseScopesInput(data.scopes),
      ...(data.expires_at ? { expires_at: data.expires_at } : {})
    })

    if (apiKey.key) {
      createdKeyValue.value = apiKey.key
    }
  },
  async onSuccess() {
    if (!createdKeyValue.value) {
      await navigateTo(`/org/${organizationId}/services/${serviceId}/api-keys`)
    }
  }
})

async function copyCreatedKey() {
  if (!createdKeyValue.value) {
    return
  }

  await navigator.clipboard.writeText(createdKeyValue.value)
  toast.showSuccess('API key copied to clipboard', 'Copied')
}

const breadcrumbs = computed(() => [
  { label: organizationName.value ?? 'Organization', to: `/org/${organizationId}` },
  { label: 'Services', to: `/org/${organizationId}/services` },
  { label: service.value?.name ?? 'Service', to: `/org/${organizationId}/services/${serviceId}` },
  { label: 'API keys', to: `/org/${organizationId}/services/${serviceId}/api-keys` },
  { label: 'Create' }
])
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <LayoutTopbar
        title="Create API key"
        :breadcrumbs="breadcrumbs"
      />
    </template>

    <template #body>
      <div class="mx-auto w-full max-w-lg p-4 sm:p-6">
        <UiPageHeader
          title="Create API key"
          description="Issue a new key to a consumer for this service"
        />

        <UAlert
          v-if="!consumerOptions.length"
          class="mb-4"
          color="warning"
          variant="subtle"
          title="No active consumers"
          description="Create an active consumer before issuing API keys."
        />

        <UCard v-if="createdKeyValue">
          <div class="space-y-4">
            <UAlert
              color="warning"
              variant="subtle"
              title="Save this key"
              description="This is the only time the full key will be displayed."
            />

            <div class="flex items-center gap-2">
              <UInput
                :model-value="createdKeyValue"
                readonly
                class="flex-1 font-mono text-sm"
              />
              <UButton
                icon="i-lucide-copy"
                variant="soft"
                @click="copyCreatedKey()"
              >
                Copy
              </UButton>
            </div>

            <UButton
              :to="`/org/${organizationId}/services/${serviceId}/api-keys`"
            >
              Done
            </UButton>
          </div>
        </UCard>

        <UCard v-else>
          <UForm
            :schema="createApiKeySchema"
            :state="state"
            class="space-y-4"
            @submit="onSubmit"
          >
            <UFormField
              label="Consumer"
              name="consumer_id"
              required
            >
              <USelect
                v-model="state.consumer_id"
                :items="consumerOptions"
                value-key="value"
                label-key="label"
                placeholder="Select a consumer"
              />
            </UFormField>

            <UFormField
              label="Name"
              name="name"
              required
            >
              <UInput
                v-model="state.name"
                placeholder="Production key"
              />
            </UFormField>

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

            <UFormField
              label="Expires at"
              name="expires_at"
              hint="Optional ISO 8601 datetime"
            >
              <UInput
                v-model="state.expires_at"
                placeholder="2026-12-31T23:59:59Z"
              />
            </UFormField>

            <UiFormErrorAlert :message="formError" />

            <div class="flex flex-wrap items-center gap-2">
              <UButton
                type="submit"
                :loading="loading"
                :disabled="!consumerOptions.length"
              >
                Create API key
              </UButton>
              <UButton
                :to="`/org/${organizationId}/services/${serviceId}/api-keys`"
                color="neutral"
                variant="ghost"
              >
                Cancel
              </UButton>
            </div>
          </UForm>
        </UCard>
      </div>
    </template>
  </UDashboardPanel>
</template>
