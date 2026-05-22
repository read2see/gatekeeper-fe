<script setup lang="ts">
import {
  createOrganizationSchema,
  type CreateOrganizationFormData
} from '~/schemas/organization'

definePageMeta({
  layout: 'dashboard'
})

const { createOrganization } = useOrganizations()
const { fetch: fetchSession } = useUserSession()

const state = reactive<CreateOrganizationFormData>({
  name: '',
  slug: ''
})

const createdOrganizationId = ref<string>()

const { onSubmit, loading, formError } = useFormSubmit<CreateOrganizationFormData>({
  successMessage: 'Organization created successfully',
  async submit(data) {
    const organization = await createOrganization({
      name: data.name,
      ...(data.slug ? { slug: data.slug } : {})
    })

    createdOrganizationId.value = organization.id
    await fetchSession()
  },
  async onSuccess() {
    if (createdOrganizationId.value) {
      await navigateTo(`/org/${createdOrganizationId.value}`)
      return
    }

    await navigateTo('/app/organizations')
  }
})
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <LayoutTopbar
        title="Create organization"
        :breadcrumbs="[
          { label: 'App', to: '/app/organizations' },
          { label: 'Organizations', to: '/app/organizations' },
          { label: 'Create' }
        ]"
      />
    </template>

    <template #body>
      <div class="mx-auto w-full max-w-lg p-4 sm:p-6">
        <UiPageHeader
          title="Create organization"
          description="Set up a new organization to manage API services"
        />

        <UCard>
          <UForm
            :schema="createOrganizationSchema"
            :state="state"
            class="space-y-4"
            @submit="onSubmit"
          >
            <UFormField
              label="Name"
              name="name"
              required
            >
              <UInput
                v-model="state.name"
                placeholder="Acme Corp"
              />
            </UFormField>

            <UFormField
              label="Slug"
              name="slug"
              hint="Optional. Used in URLs. Lowercase letters, numbers, and hyphens only."
            >
              <UInput
                v-model="state.slug"
                placeholder="acme-corp"
              />
            </UFormField>

            <UiFormErrorAlert :message="formError" />

            <div class="flex flex-wrap items-center gap-2">
              <UButton
                type="submit"
                :loading="loading"
              >
                Create organization
              </UButton>
              <UButton
                to="/app/organizations"
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
