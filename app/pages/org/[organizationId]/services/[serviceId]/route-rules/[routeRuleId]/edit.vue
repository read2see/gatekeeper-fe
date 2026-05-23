<script setup lang="ts">
import { getErrorMessage } from '~/utils/api-errors'
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
const routeRuleId = route.params.routeRuleId as string

const { getService } = useServices(organizationId)
const { getRouteRule, updateRouteRule } = useRouteRules(organizationId, serviceId)
const { organizationName } = useOrgContext()

const { data: service } = await useAsyncData(
  () => `service-route-rule-edit-${organizationId}-${serviceId}`,
  () => getService(serviceId)
)

const { data: existing, pending, error, refresh } = await useAsyncData(
  () => `route-rule-edit-${organizationId}-${serviceId}-${routeRuleId}`,
  () => getRouteRule(routeRuleId)
)

const state = reactive<CreateRouteRuleFormData>({
  method: 'GET',
  path_pattern: '',
  required_scope: ''
})

watch(existing, (routeRule) => {
  if (!routeRule) {
    return
  }

  state.method = routeRule.method
  state.path_pattern = routeRule.path_pattern
  state.required_scope = routeRule.required_scope
}, { immediate: true })

const { onSubmit, loading, formError } = useFormSubmit<CreateRouteRuleFormData>({
  successMessage: 'Route rule updated',
  async submit(data) {
    await updateRouteRule(routeRuleId, data)
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
  { label: 'Edit' }
])
</script>

<template>
  <FormsResourceFormPage
    v-if="existing"
    title="Edit route rule"
    description="Update path pattern and required scope for this service"
    topbar-title="Edit route rule"
    :breadcrumbs="breadcrumbs"
    :schema="createRouteRuleSchema"
    :state="state"
    submit-label="Save changes"
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

  <UDashboardPanel v-else>
    <template #body>
      <UiLoadingState
        v-if="pending"
        message="Loading route rule..."
      />

      <UiErrorState
        v-else-if="error"
        title="Failed to load route rule"
        :message="getErrorMessage(error)"
        retryable
        @retry="refresh()"
      />

      <UiEmptyState
        v-else
        title="Route rule not found"
        description="The requested route rule could not be loaded."
        icon="i-lucide-route"
      >
        <template #actions>
          <UButton
            :to="`/org/${organizationId}/services/${serviceId}/route-rules`"
            icon="i-lucide-arrow-left"
          >
            Back to route rules
          </UButton>
        </template>
      </UiEmptyState>
    </template>
  </UDashboardPanel>
</template>
