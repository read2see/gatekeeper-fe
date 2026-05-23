<script setup lang="ts" generic="T">
import type { DataTableConfig } from '~/types/table'
import { formatRoleCode } from '~/utils/table'

const props = defineProps<{
  config: DataTableConfig<T>
  items: T[]
  getRowId: (row: T) => string
}>()

const mobileRow = computed(() => props.config.mobileRow)
</script>

<template>
  <div
    v-if="mobileRow"
    class="divide-y divide-default md:hidden"
  >
    <div
      v-for="item in items"
      :key="getRowId(item)"
      class="flex items-start justify-between gap-3 px-4 py-3"
    >
      <div class="min-w-0 flex-1 space-y-2">
        <div class="min-w-0 space-y-0.5">
          <p class="truncate font-medium text-highlighted">
            {{ mobileRow.primary(item) }}
          </p>
          <p
            v-if="mobileRow.detail?.(item)"
            class="truncate text-sm text-muted"
          >
            {{ mobileRow.detail?.(item) }}
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <UiStatusBadge
            v-if="mobileRow.status?.(item)"
            :status="mobileRow.status(item)"
          />
          <UBadge
            v-if="mobileRow.role?.(item)"
            color="neutral"
            variant="subtle"
            size="xs"
          >
            {{ formatRoleCode(mobileRow.role(item)) }}
          </UBadge>
        </div>

        <p
          v-if="mobileRow.meta?.(item)"
          class="text-xs text-muted"
        >
          {{ mobileRow.meta(item) }}
        </p>
      </div>

      <DataTableRowActionsMenu
        :row="item"
        :actions="config.rowActions"
        :organization-id="config.organizationId"
      />
    </div>
  </div>
</template>
