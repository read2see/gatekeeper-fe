<script setup lang="ts">
import {
  createDeleteOrganizationSchema,
  updateOrganizationSchema,
  type DeleteOrganizationFormData,
  type UpdateOrganizationFormData
} from '~/schemas/organization'
import { getErrorMessage, normalizeApiError } from '~/utils/api-errors'
import { formatTableDate } from '~/utils/table'

definePageMeta({
  layout: 'dashboard',
  middleware: ['org']
})

const route = useRoute()
const organizationId = route.params.organizationId as string
const { updateOrganization, deleteOrganization } = useOrganizations()
const { organization, pending, error, refresh, can } = useOrgContext()
const { fetch: fetchSession } = useUserSession()
const toast = useAppToast()

const state = reactive<UpdateOrganizationFormData>({
  name: '',
  slug: ''
})

const deleteModalOpen = ref(false)
const deleteState = reactive<DeleteOrganizationFormData>({
  confirmName: ''
})

watch(organization, (org) => {
  if (!org) {
    return
  }

  state.name = org.name
  state.slug = org.slug
}, { immediate: true })

watch(deleteModalOpen, (open) => {
  if (!open) {
    deleteState.confirmName = ''
  }
})

const deleteSchema = computed(() => {
  if (!organization.value?.name) {
    return createDeleteOrganizationSchema('')
  }

  return createDeleteOrganizationSchema(organization.value.name)
})

const { onSubmit, loading, formError } = useFormSubmit<UpdateOrganizationFormData>({
  successMessage: 'Organization updated successfully',
  async submit(data) {
    await updateOrganization(organizationId, {
      name: data.name,
      ...(data.slug ? { slug: data.slug } : {})
    })
  },
  async onSuccess() {
    await fetchSession()
    await refresh()
  }
})

const {
  onSubmit: onDeleteSubmit,
  loading: deleteLoading,
  formError: deleteFormError
} = useFormSubmit<DeleteOrganizationFormData>({
  showErrorToast: false,
  successMessage: 'Organization deleted successfully',
  async submit() {
    await deleteOrganization(organizationId)
  },
  async onSuccess() {
    deleteModalOpen.value = false
    await fetchSession()
    await navigateTo('/app/organizations')
  },
  onError(error) {
    const { statusCode } = normalizeApiError(error)

    if (statusCode === 404 || statusCode === 501) {
      deleteFormError.value = 'Organization deletion is not yet available. This feature will be enabled when the backend ships.'
      toast.showInfo(deleteFormError.value, 'Not yet available')
      return
    }

    toast.showError(error)
  }
})

const canManage = computed(() => can('org:manage'))
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <LayoutTopbar title="Settings" />
    </template>

    <template #body>
      <div class="mx-auto w-full max-w-lg p-4 sm:p-6">
        <UiPageHeader
          title="Organization settings"
          description="Update your organization name and slug"
        />

        <UiLoadingState
          v-if="pending && !organization"
          message="Loading organization..."
        />

        <UiErrorState
          v-else-if="error"
          title="Failed to load organization"
          :message="getErrorMessage(error)"
          retryable
          @retry="refresh()"
        />

        <template v-else-if="organization">
          <UCard class="mb-6">
            <dl class="grid gap-4">
              <div>
                <dt class="text-sm text-muted">
                  Organization ID
                </dt>
                <dd class="mt-1 font-mono text-sm text-highlighted">
                  {{ organization.id }}
                </dd>
              </div>
              <div>
                <dt class="text-sm text-muted">
                  Status
                </dt>
                <dd class="mt-1">
                  <UiStatusBadge :status="organization.status ?? 'ACTIVE'" />
                </dd>
              </div>
              <div>
                <dt class="text-sm text-muted">
                  Created
                </dt>
                <dd class="mt-1 text-sm text-highlighted">
                  {{ formatTableDate(organization.created_at) }}
                </dd>
              </div>
            </dl>
          </UCard>

          <UCard v-if="canManage">
            <UForm
              :schema="updateOrganizationSchema"
              :state="state"
              class="space-y-4"
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
                hint="Used in URLs. Lowercase letters, numbers, and hyphens only."
              >
                <UInput v-model="state.slug" />
              </UFormField>

              <UiFormErrorAlert :message="formError" />

              <UButton
                type="submit"
                :loading="loading"
              >
                Save changes
              </UButton>
            </UForm>
          </UCard>

          <UAlert
            v-else
            color="neutral"
            variant="subtle"
            title="View only"
            description="You need admin permissions to update organization settings."
          />

          <UCard
            v-if="canManage"
            class="mt-6 border border-error/30"
          >
            <div class="space-y-4">
              <div>
                <h2 class="text-base font-semibold text-error">
                  Danger zone
                </h2>
                <p class="mt-1 text-sm text-muted">
                  Permanently delete this organization and all associated data. This action cannot be undone.
                </p>
              </div>

              <UButton
                color="error"
                variant="soft"
                icon="i-lucide-trash-2"
                @click="deleteModalOpen = true"
              >
                Delete organization
              </UButton>
            </div>
          </UCard>
        </template>
      </div>

      <UModal
        v-model:open="deleteModalOpen"
        title="Delete organization"
        :description="`This will permanently delete ${organization?.name ?? 'this organization'}. Type the organization name to confirm.`"
      >
        <template #body>
          <UForm
            :schema="deleteSchema"
            :state="deleteState"
            class="space-y-4"
            @submit="onDeleteSubmit"
          >
            <UFormField
              label="Organization name"
              name="confirmName"
              required
            >
              <UInput
                v-model="deleteState.confirmName"
                :placeholder="organization?.name"
                autocomplete="off"
              />
            </UFormField>

            <UiFormErrorAlert :message="deleteFormError" />

            <div class="flex justify-end gap-2">
              <UButton
                color="neutral"
                variant="ghost"
                @click="deleteModalOpen = false"
              >
                Cancel
              </UButton>
              <UButton
                type="submit"
                color="error"
                :loading="deleteLoading"
              >
                Delete organization
              </UButton>
            </div>
          </UForm>
        </template>
      </UModal>
    </template>
  </UDashboardPanel>
</template>
