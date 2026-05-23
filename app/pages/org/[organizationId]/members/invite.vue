<script setup lang="ts">
import {
  inviteMemberSchema,
  inviteRoleOptions,
  type InviteMemberFormData
} from '~/schemas/membership'

definePageMeta({
  layout: 'dashboard',
  middleware: ['org']
})

const route = useRoute()
const organizationId = route.params.organizationId as string
const { createInvite } = useOrganizationInvites(organizationId)
const { organizationName } = useOrgContext()

const state = reactive<InviteMemberFormData>({
  email: '',
  role_code: 'ORG_VIEWER'
})

const { onSubmit, loading, formError } = useFormSubmit<InviteMemberFormData>({
  successMessage: 'Invitation sent',
  async submit(data) {
    await createInvite({
      email: data.email,
      role_code: data.role_code
    })
  },
  async onSuccess() {
    await navigateTo(`/org/${organizationId}/members`)
  }
})

const breadcrumbs = computed(() => [
  { label: organizationName.value ?? 'Organization', to: `/org/${organizationId}` },
  { label: 'Members', to: `/org/${organizationId}/members` },
  { label: 'Invite' }
])
</script>

<template>
  <FormsResourceFormPage
    title="Invite member"
    description="Send an email invitation to join this organization"
    topbar-title="Invite member"
    :breadcrumbs="breadcrumbs"
    :schema="inviteMemberSchema"
    :state="state"
    submit-label="Send invitation"
    :loading="loading"
    :form-error="formError"
    :cancel-to="`/org/${organizationId}/members`"
    @submit="onSubmit"
  >
    <UFormField
      label="Email"
      name="email"
      required
    >
      <UInput
        v-model="state.email"
        type="email"
        placeholder="colleague@example.com"
      />
    </UFormField>

    <UFormField
      label="Role"
      name="role_code"
      required
    >
      <USelect
        v-model="state.role_code"
        :items="[...inviteRoleOptions]"
        value-key="value"
        label-key="label"
      />
    </UFormField>
  </FormsResourceFormPage>
</template>
