<script setup lang="ts">
import { getErrorMessage } from '~/utils/api-errors'
import {
  consumerTypeOptions,
  updateConsumerSchema,
  type UpdateConsumerFormData
} from '~/schemas/consumer'

definePageMeta({
  layout: 'dashboard',
  middleware: ['org']
})

const route = useRoute()
const organizationId = route.params.organizationId as string
const consumerId = route.params.consumerId as string
const { getConsumer, updateConsumer } = useConsumers(organizationId)
const { organizationName } = useOrgContext()

const { data: existing, pending, error, refresh } = await useAsyncData(
  () => `consumer-edit-${organizationId}-${consumerId}`,
  () => getConsumer(consumerId)
)

const state = reactive<UpdateConsumerFormData>({
  name: '',
  type: 'EXTERNAL'
})

watch(existing, (consumer) => {
  if (!consumer) {
    return
  }

  state.name = consumer.name
  state.type = consumer.type
}, { immediate: true })

const { onSubmit, loading, formError } = useFormSubmit<UpdateConsumerFormData>({
  successMessage: 'Consumer updated successfully',
  async submit(data) {
    await updateConsumer(consumerId, {
      ...(data.name ? { name: data.name } : {}),
      ...(data.type ? { type: data.type } : {})
    })
  },
  async onSuccess() {
    await navigateTo(`/org/${organizationId}/consumers`)
  }
})

const breadcrumbs = computed(() => [
  { label: organizationName.value ?? 'Organization', to: `/org/${organizationId}` },
  { label: 'Consumers', to: `/org/${organizationId}/consumers` },
  { label: existing.value?.name ?? 'Consumer' },
  { label: 'Edit' }
])
</script>

<template>
  <FormsResourceFormPage
    v-if="existing"
    title="Edit consumer"
    description="Update consumer details"
    topbar-title="Edit consumer"
    :breadcrumbs="breadcrumbs"
    :schema="updateConsumerSchema"
    :state="state"
    submit-label="Save changes"
    :loading="loading"
    :form-error="formError"
    :cancel-to="`/org/${organizationId}/consumers`"
    @submit="onSubmit"
  >
    <UFormField
      label="Name"
      name="name"
      required
    >
      <UInput v-model="state.name" />
    </UFormField>

    <UFormField
      label="Type"
      name="type"
      required
    >
      <USelect
        v-model="state.type"
        :items="[...consumerTypeOptions]"
        value-key="value"
        label-key="label"
      />
    </UFormField>
  </FormsResourceFormPage>

  <UDashboardPanel v-else>
    <template #body>
      <UiLoadingState
        v-if="pending"
        message="Loading consumer..."
      />

      <UiErrorState
        v-else-if="error"
        title="Failed to load consumer"
        :message="getErrorMessage(error)"
        retryable
        @retry="refresh()"
      />

      <UiEmptyState
        v-else
        title="Consumer not found"
        description="The requested consumer could not be loaded."
        icon="i-lucide-plug"
      >
        <template #actions>
          <UButton
            :to="`/org/${organizationId}/consumers`"
            icon="i-lucide-arrow-left"
          >
            Back to consumers
          </UButton>
        </template>
      </UiEmptyState>
    </template>
  </UDashboardPanel>
</template>
