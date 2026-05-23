<script setup lang="ts">
import {
  consumerTypeOptions,
  createConsumerSchema,
  type CreateConsumerFormData
} from '~/schemas/consumer'

definePageMeta({
  layout: 'dashboard',
  middleware: ['org']
})

const route = useRoute()
const organizationId = route.params.organizationId as string
const { createConsumer } = useConsumers(organizationId)
const { organizationName } = useOrgContext()

const state = reactive<CreateConsumerFormData>({
  name: '',
  type: 'EXTERNAL'
})

const { onSubmit, loading, formError } = useFormSubmit<CreateConsumerFormData>({
  successMessage: 'Consumer created successfully',
  async submit(data) {
    await createConsumer(data)
  },
  async onSuccess() {
    await navigateTo(`/org/${organizationId}/consumers`)
  }
})

const breadcrumbs = computed(() => [
  { label: organizationName.value ?? 'Organization', to: `/org/${organizationId}` },
  { label: 'Consumers', to: `/org/${organizationId}/consumers` },
  { label: 'Create' }
])
</script>

<template>
  <FormsResourceFormPage
    title="Create consumer"
    description="Register a consumer that can receive API keys"
    topbar-title="Create consumer"
    :breadcrumbs="breadcrumbs"
    :schema="createConsumerSchema"
    :state="state"
    submit-label="Create consumer"
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
      <UInput
        v-model="state.name"
        placeholder="Mobile App"
      />
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
</template>
