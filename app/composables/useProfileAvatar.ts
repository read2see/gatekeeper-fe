import { apiSpec } from '~/types/api-spec'
import { buildAvatarUrl, validateAvatarFile } from '~/utils/avatar'

export function useProfileAvatar() {
  const { user, session } = useUserSession()
  const config = useRuntimeConfig()
  const toast = useAppToast()
  const { confirm } = useConfirm()

  const avatarVersion = useState('profile-avatar-version', () => Date.now())
  const uploading = ref(false)
  const deleting = ref(false)

  const hasAvatar = computed(() => user.value?.has_avatar === true)

  const avatarUrl = computed(() => {
    if (!user.value?.id || !hasAvatar.value) {
      return undefined
    }

    return buildAvatarUrl(user.value.id, config.public.gatekeeperApiBase, avatarVersion.value)
  })

  function syncHasAvatar(value: boolean) {
    if (!session.value?.user) {
      return
    }

    session.value = {
      ...session.value,
      user: {
        ...session.value.user,
        has_avatar: value
      }
    }
    avatarVersion.value = Date.now()
  }

  async function uploadAvatar(file: File) {
    const validationError = validateAvatarFile(file)
    if (validationError) {
      toast.showError(validationError, 'Invalid image')
      return
    }

    uploading.value = true

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await $fetch<{ message?: string }>(
        apiSpec.users.uploadAvatar.path,
        {
          method: apiSpec.users.uploadAvatar.method,
          body: formData
        }
      )

      syncHasAvatar(true)
      toast.showSuccess(response.message ?? 'Profile photo updated')
    } catch (error) {
      toast.showActionError(error, 'Upload failed')
      throw error
    } finally {
      uploading.value = false
    }
  }

  async function deleteAvatar() {
    const confirmed = await confirm({
      title: 'Remove profile photo?',
      description: 'Your current profile photo will be deleted.',
      confirmLabel: 'Remove photo',
      confirmColor: 'error',
      destructive: true
    })

    if (!confirmed) {
      return
    }

    deleting.value = true

    try {
      const response = await $fetch<{ message?: string }>(
        apiSpec.users.deleteAvatar.path,
        { method: apiSpec.users.deleteAvatar.method }
      )

      syncHasAvatar(false)
      toast.showSuccess(response.message ?? 'Profile photo removed')
    } catch (error) {
      toast.showActionError(error, 'Remove failed')
      throw error
    } finally {
      deleting.value = false
    }
  }

  return {
    hasAvatar,
    avatarUrl,
    uploading,
    deleting,
    syncHasAvatar,
    uploadAvatar,
    deleteAvatar
  }
}
