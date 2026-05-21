<script setup lang="ts" generic="T extends Record<string, unknown>">
import type { FormSubmitEvent } from '@nuxt/ui'
import type { ZodType } from 'zod'

defineProps<{
  title: string
  description?: string
  topbarTitle?: string
  breadcrumbs?: Array<{ label: string, to?: string }>
  schema: ZodType
  state: T
  submitLabel?: string
  loading?: boolean
  formError?: string | null
  cancelTo?: string
}>()

const emit = defineEmits<{
  submit: [event: FormSubmitEvent<T>]
}>()
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <LayoutTopbar
        :title="topbarTitle ?? title"
        :breadcrumbs="breadcrumbs"
      />
    </template>

    <template #body>
      <div class="mx-auto w-full max-w-lg p-4 sm:p-6">
        <UiPageHeader
          :title="title"
          :description="description"
        />

        <UCard>
          <UForm
            :schema="schema"
            :state="state"
            class="space-y-4"
            @submit="emit('submit', $event)"
          >
            <slot />

            <UiFormErrorAlert :message="formError" />

            <div class="flex flex-wrap items-center gap-2">
              <UButton
                type="submit"
                :loading="loading"
              >
                {{ submitLabel ?? 'Save' }}
              </UButton>
              <UButton
                v-if="cancelTo"
                :to="cancelTo"
                color="neutral"
                variant="ghost"
              >
                Cancel
              </UButton>
              <slot name="actions" />
            </div>
          </UForm>
        </UCard>
      </div>
    </template>
  </UDashboardPanel>
</template>
