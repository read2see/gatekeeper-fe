<script setup lang="ts" generic="T">
import type { DataTableBulkAction } from '~/types/table'

const props = defineProps<{
  actions?: DataTableBulkAction<T>[]
  organizationId?: string
  selectedRows: T[]
  selectedCount: number
}>()

const emit = defineEmits<{
  clear: []
}>()

const access = useAccess()
const { confirm } = useConfirm()
const toast = useAppToast()
const pendingActionId = ref<string | null>(null)

const visibleActions = computed(() =>
  (props.actions ?? []).filter((action) => {
    if (action.requiredPermission && !access.can(action.requiredPermission, props.organizationId)) {
      return false
    }

    return true
  })
)

const hasActions = computed(() => visibleActions.value.length > 0 && props.selectedCount > 0)

async function runAction(action: DataTableBulkAction<T>) {
  if (action.confirm) {
    const accepted = await confirm({
      title: action.confirm.title,
      description: action.confirm.description,
      confirmLabel: action.label,
      confirmColor: action.destructive ? 'error' : 'primary',
      destructive: action.destructive
    })

    if (!accepted) {
      return
    }
  }

  pendingActionId.value = action.id

  try {
    await action.onClick(props.selectedRows)
    emit('clear')
  } catch (error) {
    toast.showActionError(error)
  } finally {
    pendingActionId.value = null
  }
}
</script>

<template>
  <div
    v-if="hasActions"
    class="flex flex-wrap items-center justify-between gap-3 border-b border-default bg-elevated/50 px-4 py-3"
  >
    <p class="text-sm text-muted">
      {{ selectedCount }} row{{ selectedCount === 1 ? '' : 's' }} selected
    </p>

    <div class="flex flex-wrap items-center gap-2">
      <UButton
        v-for="action in visibleActions"
        :key="action.id"
        :icon="action.icon"
        :color="action.destructive ? 'error' : 'primary'"
        variant="soft"
        size="sm"
        :loading="pendingActionId === action.id"
        @click="runAction(action)"
      >
        {{ action.label }}
      </UButton>

      <UButton
        color="neutral"
        variant="ghost"
        size="sm"
        @click="emit('clear')"
      >
        Clear selection
      </UButton>
    </div>
  </div>
</template>
