<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import {
  isOrgRoleCode,
  memberRoleOptions,
  updateMemberRoleSchema,
  type UpdateMemberRoleFormData
} from '~/schemas/membership'

const props = defineProps<{
  organizationId: string
}>()

const { isOpen, member, close } = useChangeMemberRoleModal(props.organizationId)
const { updateMemberRole } = useMembers(props.organizationId)

const state = reactive<UpdateMemberRoleFormData>({
  role_code: 'ORG_VIEWER'
})

watch(member, (value) => {
  if (value && isOrgRoleCode(value.role_code)) {
    state.role_code = value.role_code
  }
})

const memberLabel = computed(() =>
  member.value?.full_name ?? member.value?.email ?? member.value?.user_id ?? 'Member'
)

const { onSubmit, loading, formError } = useFormSubmit<UpdateMemberRoleFormData>({
  successMessage: 'Member role updated',
  async submit(data) {
    if (!member.value) {
      return
    }

    await updateMemberRole(member.value.id, { role_code: data.role_code })
  },
  async onSuccess() {
    await refreshNuxtData(`datatable-members-${props.organizationId}`)
    close()
  }
})

function handleSubmit(event: FormSubmitEvent<UpdateMemberRoleFormData>) {
  void onSubmit(event)
}

function handleClose() {
  close()
}
</script>

<template>
  <FormsFormModal
    v-model:open="isOpen"
    title="Change member role"
    :description="`Update the role for ${memberLabel}.`"
    :schema="updateMemberRoleSchema"
    :state="state"
    submit-label="Save role"
    :loading="loading"
    :form-error="formError"
    @submit="handleSubmit"
    @close="handleClose"
  >
    <UFormField
      label="Role"
      name="role_code"
      required
    >
      <USelect
        v-model="state.role_code"
        :items="[...memberRoleOptions]"
        value-key="value"
        label-key="label"
      />
    </UFormField>
  </FormsFormModal>
</template>
