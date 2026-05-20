<script setup lang="ts">
import { getErrorMessage } from '~/utils/api-errors'

definePageMeta({
  layout: 'auth',
  middleware: ['guest']
})

const route = useRoute()
const toast = useAppToast()

const token = computed(() => typeof route.query.token === 'string' ? route.query.token : '')
const status = ref<'idle' | 'loading' | 'success' | 'error'>('idle')
const message = ref<string>()

async function verifyEmail() {
  if (!token.value) {
    status.value = 'error'
    message.value = 'Verification token is missing from the link.'
    return
  }

  status.value = 'loading'

  try {
    const result = await $fetch<{ message?: string }>('/api/auth/verify-email', {
      query: { token: token.value }
    })

    status.value = 'success'
    message.value = result.message ?? 'Email verified successfully. You can now sign in.'

    toast.showSuccess(message.value ?? 'Email verified successfully. You can now sign in.', 'Email verified')
  } catch (error) {
    status.value = 'error'
    message.value = getErrorMessage(error, 'Unable to verify your email address.')

    toast.showError(message.value, 'Verification failed')
  }
}

onMounted(() => {
  verifyEmail()
})
</script>

<template>
  <FormsAuthFormLayout
    title="Verify email"
    description="Confirming your email address"
  >
    <div class="space-y-4">
      <UiLoadingState
        v-if="status === 'loading'"
        message="Verifying your email address..."
      />

      <UAlert
        v-else-if="status === 'success'"
        color="success"
        variant="subtle"
        title="Email verified"
        :description="message"
      />

      <UAlert
        v-else-if="status === 'error'"
        color="error"
        variant="subtle"
        title="Verification failed"
        :description="message"
      >
        <template #actions>
          <UButton
            to="/auth/resend-verification"
            variant="soft"
            color="error"
            size="xs"
          >
            Resend verification email
          </UButton>
        </template>
      </UAlert>

      <UButton
        v-if="status !== 'loading'"
        to="/auth/login"
        block
      >
        Continue to sign in
      </UButton>
    </div>
  </FormsAuthFormLayout>
</template>
