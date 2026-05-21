<script setup lang="ts" generic="T extends Record<string, unknown>">
import type { FormSubmitEvent } from '@nuxt/ui'
import type { ZodType } from 'zod'

withDefaults(defineProps<{
  title: string
  description?: string
  schema: ZodType
  state: T
  submitLabel?: string
  loading?: boolean
  formError?: string | null
}>(), {
  submitLabel: 'Save',
  loading: false,
  formError: null
})

const emit = defineEmits<{
  submit: [event: FormSubmitEvent<T>]
  close: []
}>()

const open = defineModel<boolean>('open', { default: false })
</script>

<template>
  <UModal
    v-model:open="open"
    :title="title"
    :description="description"
  >
    <template #body>
      <UForm
        :schema="schema"
        :state="state"
        class="space-y-4"
        @submit="emit('submit', $event)"
      >
        <slot />

        <UiFormErrorAlert :message="formError" />

        <div class="flex justify-end gap-2">
          <UButton
            color="neutral"
            variant="ghost"
            @click="emit('close'); open = false"
          >
            Cancel
          </UButton>
          <UButton
            type="submit"
            :loading="loading"
          >
            {{ submitLabel }}
          </UButton>
        </div>
      </UForm>
    </template>
  </UModal>
</template>
