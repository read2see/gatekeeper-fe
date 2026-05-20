import { getErrorMessage } from '~/utils/api-errors'

export function useAppToast() {
  const toast = useToast()

  function showSuccess(description: string, title = 'Success') {
    toast.add({
      title,
      description,
      color: 'success'
    })
  }

  function showError(error: unknown, title = 'Error', fallback = 'Something went wrong') {
    const description = typeof error === 'string'
      ? error
      : getErrorMessage(error, fallback)

    toast.add({
      title,
      description,
      color: 'error'
    })
  }

  function showInfo(description: string, title = 'Notice') {
    toast.add({
      title,
      description,
      color: 'info'
    })
  }

  function showActionSuccess(description: string) {
    showSuccess(description)
  }

  function showActionError(error: unknown, title = 'Action failed') {
    showError(error, title)
  }

  return {
    showSuccess,
    showError,
    showInfo,
    showActionSuccess,
    showActionError
  }
}
