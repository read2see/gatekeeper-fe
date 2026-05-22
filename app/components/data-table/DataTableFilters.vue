<script setup lang="ts">
import type { DataTableFilterDef } from '~/types/table'

const props = defineProps<{
  filters: DataTableFilterDef[]
}>()

const model = defineModel<Record<string, string | undefined>>({ required: true })

const hasFilters = computed(() => props.filters.length > 0)
</script>

<template>
  <div
    v-if="hasFilters"
    class="grid gap-3 border-b border-default px-4 py-3 sm:grid-cols-2 lg:grid-cols-4"
  >
    <UFormField
      v-for="filter in filters"
      :key="filter.id"
      :label="filter.label"
      :ui="{ label: 'text-xs text-muted' }"
    >
      <USelect
        v-if="filter.type === 'select'"
        v-model="model[filter.id]"
        :items="filter.options ?? []"
        value-key="value"
        label-key="label"
        :placeholder="filter.placeholder ?? `All ${filter.label.toLowerCase()}`"
        class="w-full"
      />

      <UInput
        v-else
        v-model="model[filter.id]"
        :placeholder="filter.placeholder ?? `Filter by ${filter.label.toLowerCase()}`"
        class="w-full"
      />
    </UFormField>
  </div>
</template>
