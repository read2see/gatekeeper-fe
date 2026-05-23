<script setup lang="ts">
import {
  createRouteRuleSchema,
  httpMethodOptions,
  type CreateRouteRuleFormData
} from '~/schemas/route-rule'

definePageMeta({
  layout: 'dashboard',
  middleware: ['org']
})

const route = useRoute()
const organizationId = route.params.organizationId as string
const serviceId = route.params.serviceId as string

const { getService } = useServices(organizationId)
const { createRouteRule } = useRouteRules(organizationId, serviceId)
const { organizationName } = useOrgContext()

const { data: service } = await useAsyncData(
  () => `service-route-rule-new-${organizationId}-${serviceId}`,
  () => getService(serviceId)
)

const state = reactive<CreateRouteRuleFormData>({
  method: 'GET',
  path_pattern: '',
  required_scope: ''
})

const { onSubmit, loading, formError } = useFormSubmit<CreateRouteRuleFormData>({
  successMessage: 'Route rule created',
  async submit(data) {
    await createRouteRule(data)
  },
  async onSuccess() {
    await navigateTo(`/org/${organizationId}/services/${serviceId}/route-rules`)
  }
})

const breadcrumbs = computed(() => [
  { label: organizationName.value ?? 'Organization', to: `/org/${organizationId}` },
  { label: 'Services', to: `/org/${organizationId}/services` },
  { label: service.value?.name ?? 'Service', to: `/org/${organizationId}/services/${serviceId}` },
  { label: 'Route rules', to: `/org/${organizationId}/services/${serviceId}/route-rules` },
  { label: 'Create' }
])
</script>

<template>
  <FormsResourceFormPage
    title="Add route rule"
    description="Define a path pattern and required scope for this service"
    topbar-title="Add route rule"
    :breadcrumbs="breadcrumbs"
    :schema="createRouteRuleSchema"
    :state="state"
    submit-label="Create route rule"
    :loading="loading"
    :form-error="formError"
    :cancel-to="`/org/${organizationId}/services/${serviceId}/route-rules`"
    @submit="onSubmit"
  >
    <UFormField
      label="Method"
      name="method"
      required
    >
      <USelect
        v-model="state.method"
        :items="httpMethodOptions"
        value-key="value"
        label-key="label"
      />
    </UFormField>

    <UFormField
      label="Path pattern"
      name="path_pattern"
      required
    >
      <UInput
        v-model="state.path_pattern"
        placeholder="/api/v1/users/*"
      />
    </UFormField>

    <UFormField
      label="Required scope"
      name="required_scope"
      required
    >
      <UInput
        v-model="state.required_scope"
        placeholder="users:read"
      />
    </UFormField>
  </FormsResourceFormPage>
</template>
