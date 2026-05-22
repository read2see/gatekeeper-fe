<script setup lang="ts" generic="T">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { DataTableRowAction } from '~/types/table'

const props = defineProps<{
  row: T
  actions?: DataTableRowAction<T>[]
  organizationId?: string
}>()

const access = useAccess()

const visibleActions = computed(() =>
  (props.actions ?? []).filter((action) => {
    if (action.requiredPermission && !access.can(action.requiredPermission, props.organizationId)) {
      return false
    }

    return action.visible?.(props.row) ?? true
  })
)

const menuItems = computed<DropdownMenuItem[]>(() =>
  visibleActions.value.map(action => ({
    label: action.label,
    icon: action.icon,
    to: action.to?.(props.row),
    onSelect: action.onClick
      ? () => { void action.onClick?.(props.row) }
      : undefined,
    color: action.destructive ? 'error' as const : undefined
  }))
)

const hasActions = computed(() => menuItems.value.length > 0)
</script>

<template>
  <UDropdownMenu
    v-if="hasActions"
    :items="[menuItems]"
    :content="{ align: 'end' }"
  >
    <UButton
      icon="i-lucide-ellipsis"
      color="neutral"
      variant="ghost"
      size="xs"
      aria-label="Row actions"
    />
  </UDropdownMenu>
</template>
