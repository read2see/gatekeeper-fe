<script setup lang="ts">
import {
  createServiceSchema,
  type CreateServiceFormData
} from '~/schemas/service'

definePageMeta({
  layout: 'dashboard',
  middleware: ['org']
})

const route = useRoute()
const organizationId = route.params.organizationId as string
const { createService } = useServices(organizationId)
const { organizationName } = useOrgContext()

const state = reactive<CreateServiceFormData>({
  name: '',
  slug: '',
  base_url: '',
  internal_auth_header_name: '',
  internal_secret: ''
})

const createdServiceId = ref<string>()

const { onSubmit, loading, formError } = useFormSubmit<CreateServiceFormData>({
  successMessage: 'Service created successfully',
  async submit(data) {
    const service = await createService({
      name: data.name,
      base_url: data.base_url,
      ...(data.slug ? { slug: data.slug } : {}),
      ...(data.internal_auth_header_name ? { internal_auth_header_name: data.internal_auth_header_name } : {}),
      ...(data.internal_secret ? { internal_secret: data.internal_secret } : {})
    })

    createdServiceId.value = service.id
  },
  async onSuccess() {
    if (createdServiceId.value) {
      await navigateTo(`/org/${organizationId}/services/${createdServiceId.value}`)
      return
    }

    await navigateTo(`/org/${organizationId}/services`)
  }
})

const breadcrumbs = computed(() => [
  { label: organizationName.value ?? 'Organization', to: `/org/${organizationId}` },
  { label: 'Services', to: `/org/${organizationId}/services` },
  { label: 'Create' }
])
</script>

<template>
  <FormsResourceFormPage
    title="Create service"
    description="Configure an upstream API service for routing and key management"
    topbar-title="Create service"
    :breadcrumbs="breadcrumbs"
    :schema="createServiceSchema"
    :state="state"
    submit-label="Create service"
    :loading="loading"
    :form-error="formError"
    :cancel-to="`/org/${organizationId}/services`"
    @submit="onSubmit"
  >
    <UFormField
      label="Name"
      name="name"
      required
    >
      <UInput
        v-model="state.name"
        placeholder="Payments API"
      />
    </UFormField>

    <UFormField
      label="Slug"
      name="slug"
      hint="Optional. Used in URLs."
    >
      <UInput
        v-model="state.slug"
        placeholder="payments-api"
      />
    </UFormField>

    <UFormField
      label="Base URL"
      name="base_url"
      required
    >
      <UInput
        v-model="state.base_url"
        placeholder="https://api.example.com"
      />
    </UFormField>

    <UFormField
      label="Internal auth header"
      name="internal_auth_header_name"
      hint="Optional header name for upstream authentication"
    >
      <UInput
        v-model="state.internal_auth_header_name"
        placeholder="X-Internal-Auth"
      />
    </UFormField>

    <UFormField
      label="Internal secret"
      name="internal_secret"
      hint="Optional secret sent to the upstream service"
    >
      <UInput
        v-model="state.internal_secret"
        type="password"
        placeholder="••••••••"
      />
    </UFormField>
  </FormsResourceFormPage>
</template>
