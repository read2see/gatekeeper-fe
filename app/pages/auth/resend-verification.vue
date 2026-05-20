<script setup lang="ts">
import { resendVerificationSchema, type ResendVerificationFormData } from '~/schemas/auth'

definePageMeta({
  layout: 'auth',
  middleware: ['guest']
})

const route = useRoute()

const state = reactive<ResendVerificationFormData>({
  email: typeof route.query.email === 'string' ? route.query.email : ''
})

const { onSubmit, loading, formError } = useFormSubmit<ResendVerificationFormData>({
  async submit(data) {
    return await $fetch<{ message?: string }>('/api/auth/resend-verification', {
      method: 'POST',
      body: data
    })
  },
  successMessage: result => result?.message ?? 'Verification email sent. Check your inbox.'
})
</script>

<template>
  <FormsAuthFormLayout
    title="Resend verification"
    description="We'll send a new verification link to your email"
  >
    <UForm
      :schema="resendVerificationSchema"
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
        Send verification email
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
