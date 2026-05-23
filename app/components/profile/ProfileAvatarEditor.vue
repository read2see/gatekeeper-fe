<script setup lang="ts">
import { AVATAR_ACCEPT, getAvatarInitials } from '~/utils/avatar'

const props = defineProps<{
  fullName?: string | null
  email?: string | null
}>()

const fileInputRef = ref<HTMLInputElement | null>(null)

const {
  hasAvatar,
  avatarUrl,
  uploading,
  deleting,
  uploadAvatar,
  deleteAvatar
} = useProfileAvatar()

const avatarAlt = computed(() => props.fullName?.trim() || props.email?.trim() || 'Profile photo')
const avatarInitials = computed(() => getAvatarInitials(props.fullName, props.email))

function openFilePicker() {
  fileInputRef.value?.click()
}

async function onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  input.value = ''

  if (!file) {
    return
  }

  await uploadAvatar(file)
}
</script>

<template>
  <div class="flex flex-col gap-4 sm:flex-row sm:items-center">
    <UAvatar
      :src="avatarUrl"
      :alt="avatarAlt"
      :text="avatarInitials"
      size="3xl"
      class="shrink-0"
    />

    <div class="space-y-3">
      <div class="flex flex-wrap items-center gap-2">
        <UButton
          icon="i-lucide-upload"
          :loading="uploading"
          :disabled="deleting"
          @click="openFilePicker"
        >
          Upload photo
        </UButton>

        <UButton
          v-if="hasAvatar"
          color="error"
          variant="soft"
          icon="i-lucide-trash-2"
          :loading="deleting"
          :disabled="uploading"
          @click="deleteAvatar"
        >
          Remove photo
        </UButton>
      </div>

      <p class="text-sm text-muted">
        JPG, PNG, WebP, or GIF. Max 2 MB.
      </p>
    </div>

    <input
      ref="fileInputRef"
      type="file"
      :accept="AVATAR_ACCEPT"
      class="hidden"
      @change="onFileSelected"
    >
  </div>
</template>
