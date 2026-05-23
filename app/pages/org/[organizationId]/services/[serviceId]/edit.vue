<script setup lang="ts">
import { getErrorMessage } from '~/utils/api-errors'
import {
  updateServiceSchema,
  type UpdateServiceFormData
} from '~/schemas/service'

definePageMeta({
  layout: 'dashboard',
  middleware: ['org']
})

const route = useRoute()
const organizationId = route.params.organizationId as string
const serviceId = route.params.serviceId as string
const { getService, updateService } = useServices(organizationId)
const { organizationName } = useOrgContext()

const { data: existing, pending, error, refresh } = await useAsyncData(
  () => `service-edit-${organizationId}-${serviceId}`,
  () => getService(serviceId)
)

const state = reactive<UpdateServiceFormData>({
  name: '',
  slug: '',
  base_url: '',
  internal_auth_header_name: '',
  internal_secret: ''
})

watch(existing, (service) => {
  if (!service) {
    return
  }

  state.name = service.name
  state.slug = service.slug
  state.base_url = service.base_url
  state.internal_auth_header_name = service.internal_auth_header_name ?? ''
  state.internal_secret = ''
}, { immediate: true })

const { onSubmit, loading, formError } = useFormSubmit<UpdateServiceFormData>({
  successMessage: 'Service updated successfully',
  async submit(data) {
    await updateService(serviceId, {
      ...(data.name ? { name: data.name } : {}),
      ...(data.slug ? { slug: data.slug } : {}),
      ...(data.base_url ? { base_url: data.base_url } : {}),
      ...(data.internal_auth_header_name ? { internal_auth_header_name: data.internal_auth_header_name } : {}),
      ...(data.internal_secret ? { internal_secret: data.internal_secret } : {})
    })
  },
  async onSuccess() {
    await navigateTo(`/org/${organizationId}/services/${serviceId}`)
  }
})

const breadcrumbs = computed(() => [
  { label: organizationName.value ?? 'Organization', to: `/org/${organizationId}` },
  { label: 'Services', to: `/org/${organizationId}/services` },
  { label: existing.value?.name ?? 'Service', to: `/org/${organizationId}/services/${serviceId}` },
  { label: 'Edit' }
])
</script>

<template>
  <FormsResourceFormPage
    v-if="existing"
    title="Edit service"
    description="Update service configuration"
    topbar-title="Edit service"
    :breadcrumbs="breadcrumbs"
    :schema="updateServiceSchema"
    :state="state"
    submit-label="Save changes"
    :loading="loading"
    :form-error="formError"
    :cancel-to="`/org/${organizationId}/services/${serviceId}`"
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
      label="Slug"
      name="slug"
    >
      <UInput v-model="state.slug" />
    </UFormField>

    <UFormField
      label="Base URL"
      name="base_url"
      required
    >
      <UInput v-model="state.base_url" />
    </UFormField>

    <UFormField
      label="Internal auth header"
      name="internal_auth_header_name"
    >
      <UInput v-model="state.internal_auth_header_name" />
    </UFormField>

    <UFormField
      label="Internal secret"
      name="internal_secret"
      hint="Leave blank to keep the current secret"
    >
      <UInput
        v-model="state.internal_secret"
        type="password"
        placeholder="••••••••"
      />
    </UFormField>
  </FormsResourceFormPage>

  <UDashboardPanel v-else>
    <template #body>
      <UiLoadingState
        v-if="pending"
        message="Loading service..."
      />

      <UiErrorState
        v-else-if="error"
        title="Failed to load service"
        :message="getErrorMessage(error)"
        retryable
        @retry="refresh()"
      />

      <UiEmptyState
        v-else
        title="Service not found"
        description="The requested service could not be loaded."
        icon="i-lucide-server"
      >
        <template #actions>
          <UButton
            :to="`/org/${organizationId}/services`"
            icon="i-lucide-arrow-left"
          >
            Back to services
          </UButton>
        </template>
      </UiEmptyState>
    </template>
  </UDashboardPanel>
</template>
