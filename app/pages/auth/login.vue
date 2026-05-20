<script setup lang="ts">
import { loginSchema, type LoginFormData } from '~/schemas/auth'
import { isEmailNotVerifiedError } from '~/utils/api-errors'
import { buildAuthCrossLinks } from '~/utils/invite-auth-links'
import { resolvePostLoginRedirect } from '~/utils/redirect'

definePageMeta({
  layout: 'auth',
  middleware: ['guest']
})

const route = useRoute()
const { login } = useAuth()

const registerLink = computed(() => buildAuthCrossLinks(route.query).registerLink)

const state = reactive<LoginFormData>({
  email: '',
  password: ''
})

const emailNotVerified = ref(false)
const toast = useAppToast()

onMounted(() => {
  if (route.query.reason === 'session_expired') {
    toast.showInfo('Please sign in again to continue.', 'Session expired')
  }

  if (route.query.verified === '1') {
    toast.showSuccess('Your email has been verified. You can now sign in.', 'Email verified')
  }
})

const { onSubmit, loading, formError } = useFormSubmit<LoginFormData>({
  showSuccessToast: false,
  async submit(data) {
    emailNotVerified.value = false
    await login(data)
  },
  async onSuccess() {
    const redirectTo = typeof route.query.redirect === 'string'
      ? route.query.redirect
      : undefined

    if (redirectTo) {
      await navigateTo(redirectTo)
      return
    }

    const { session } = useUserSession()
    await navigateTo(resolvePostLoginRedirect({
      platformRoles: session.value?.platformRoles,
      organizations: session.value?.organizations
    }))
  },
  onError(error) {
    if (isEmailNotVerifiedError(error)) {
      emailNotVerified.value = true
    }
  }
})
</script>

<template>
  <FormsAuthFormLayout
    title="Sign in"
    description="Access your Gatekeeper account"
  >
    <UForm
      :schema="loginSchema"
      :state="state"
      class="space-y-4"
      @submit="onSubmit"
    >
      <div class="mx-auto w-fit max-w-sm space-y-4">
        <UFormField
          label="Email"
          name="email"
          required
          class="w-full"
        >
          <UInput
            v-model="state.email"
            type="email"
            autocomplete="email"
            placeholder="you@example.com"
          />
        </UFormField>

        <UFormField
          label="Password"
          name="password"
          required
          class="w-full"
        >
          <UInput
            v-model="state.password"
            type="password"
            autocomplete="current-password"
            placeholder="Enter your password"
          />
        </UFormField>

        <UButton
          type="submit"
          block
          :loading="loading"
        >
          Sign in
        </UButton>
      </div>

      <UAlert
        v-if="emailNotVerified"
        color="warning"
        variant="subtle"
        title="Email not verified"
        description="Verify your email address before signing in."
      >
        <template #actions>
          <UButton
            :to="{ path: '/auth/resend-verification', query: { email: state.email } }"
            variant="soft"
            color="warning"
            size="xs"
          >
            Resend verification email
          </UButton>
        </template>
      </UAlert>

      <UiFormErrorAlert
        v-else-if="formError"
        :message="formError"
      />
    </UForm>

    <template #footer>
      <p>
        <NuxtLink
          to="/auth/forgot-password"
          class="font-medium text-primary hover:underline"
        >
          Forgot password?
        </NuxtLink>
      </p>
      <p class="mt-2">
        Don't have an account?
        <NuxtLink
          :to="registerLink"
          class="font-medium text-primary hover:underline"
        >
          Create one
        </NuxtLink>
      </p>
    </template>
  </FormsAuthFormLayout>
</template>
