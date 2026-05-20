import type { FormSubmitEvent } from '@nuxt/ui'
import { getErrorMessage } from '~/utils/api-errors'

export interface FormSubmitResult {
  message?: string
}

export interface UseFormSubmitOptions<T extends Record<string, unknown>> {
  submit: (data: T) => Promise<FormSubmitResult | undefined>
  successMessage?: string | ((result: FormSubmitResult | undefined) => string | undefined)
  onSuccess?: (result: FormSubmitResult | undefined) => void | Promise<void>
  onError?: (error: unknown) => void
  showErrorToast?: boolean
  showSuccessToast?: boolean
}

export function useFormSubmit<T extends Record<string, unknown>>(
  options: UseFormSubmitOptions<T>
) {
  const toast = useAppToast()
  const loading = ref(false)
  const formError = ref<string | null>(null)

  async function onSubmit(event: FormSubmitEvent<T>) {
    loading.value = true
    formError.value = null

    try {
      const result = await options.submit(event.data)
      const message = resolveSuccessMessage(options.successMessage, result)

      if (message && options.showSuccessToast !== false) {
        toast.showSuccess(message)
      }

      await options.onSuccess?.(result)
    } catch (error) {
      const message = getErrorMessage(error)
      formError.value = message

      if (options.showErrorToast !== false) {
        toast.showError(error)
      }

      options.onError?.(error)
    } finally {
      loading.value = false
    }
  }

  return {
    onSubmit,
    loading,
    formError
  }
}

function resolveSuccessMessage<T extends Record<string, unknown>>(
  successMessage: UseFormSubmitOptions<T>['successMessage'],
  result: FormSubmitResult | undefined
): string | undefined {
  if (typeof successMessage === 'function') {
    return successMessage(result)
  }

  if (successMessage) {
    return successMessage
  }

  return result?.message
}
