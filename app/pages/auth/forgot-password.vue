<script setup lang="ts">
import { forgotPasswordSchema, type ForgotPasswordFormData } from '~/schemas/auth'

definePageMeta({
  layout: 'auth',
  middleware: ['guest']
})

const state = reactive<ForgotPasswordFormData>({
  email: ''
})

const { onSubmit, loading, formError } = useFormSubmit<ForgotPasswordFormData>({
  async submit(data) {
    return await $fetch<{ message?: string }>('/api/auth/forgot-password', {
      method: 'POST',
      body: data
    })
  },
  successMessage: result => result?.message ?? 'If an account exists for that email, a reset link has been sent.'
})
</script>

<template>
  <FormsAuthFormLayout
    title="Forgot password"
    description="Enter your email and we'll send a reset link"
  >
    <UForm
      :schema="forgotPasswordSchema"
      :state="state"
      class="space-y-4 w-fit mx-auto"
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
          autocomplete="email"
          placeholder="you@example.com"
        />
      </UFormField>

      <UiFormErrorAlert :message="formError" />

      <UButton
        type="submit"
        block
        :loading="loading"
      >
        Send reset link
      </UButton>
    </UForm>

    <template #footer>
      <p>
        Remember your password?
        <NuxtLink
          to="/auth/login"
          class="font-medium text-primary hover:underline"
        >
          Sign in
        </NuxtLink>
      </p>
    </template>
  </FormsAuthFormLayout>
</template>
