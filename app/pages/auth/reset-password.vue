<script setup lang="ts">
import { resetPasswordSchema, type ResetPasswordFormData } from '~/schemas/auth'

definePageMeta({
  layout: 'auth',
  middleware: ['guest']
})

const route = useRoute()

const state = reactive<ResetPasswordFormData>({
  token: typeof route.query.token === 'string' ? route.query.token : '',
  password: ''
})

const missingToken = computed(() => !state.token)

const { onSubmit, loading, formError } = useFormSubmit<ResetPasswordFormData>({
  async submit(data) {
    return await $fetch<{ message?: string }>('/api/auth/reset-password', {
      method: 'POST',
      body: data
    })
  },
  successMessage: result => result?.message ?? 'Password updated. You can now sign in.',
  async onSuccess() {
    await navigateTo('/auth/login')
  }
})
</script>

<template>
  <FormsAuthFormLayout
    title="Reset password"
    description="Choose a new password for your account"
  >
    <UAlert
      v-if="missingToken"
      color="warning"
      variant="subtle"
      title="Invalid reset link"
      description="This password reset link is missing a token. Request a new link to continue."
    >
      <template #actions>
        <UButton
          to="/auth/forgot-password"
          variant="soft"
          color="warning"
          size="xs"
        >
          Request reset link
        </UButton>
      </template>
    </UAlert>

    <UForm
      v-else
      :schema="resetPasswordSchema"
      :state="state"
      class="space-y-4"
      @submit="onSubmit"
    >
      <UFormField
        label="New password"
        name="password"
        required
      >
        <UInput
          v-model="state.password"
          type="password"
          autocomplete="new-password"
          placeholder="At least 8 characters"
        />
      </UFormField>

      <UiFormErrorAlert :message="formError" />

      <UButton
        type="submit"
        block
        :loading="loading"
      >
        Update password
      </UButton>
    </UForm>

    <template #footer>
      <p>
        <NuxtLink
          to="/auth/login"
          class="font-medium text-primary hover:underline"
        >
          Back to sign in
        </NuxtLink>
      </p>
    </template>
  </FormsAuthFormLayout>
</template>
