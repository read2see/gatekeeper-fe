<script setup lang="ts">
import {
  postmanImportSchema,
  toPostmanImportQuery,
  type PostmanImportFormData
} from '~/schemas/postman-import'
import type { PostmanImportResult } from '~/types/domain'
import {
  POSTMAN_ACCEPT,
  type PostmanPreview,
  parsePostmanPreview,
  validatePostmanFile
} from '~/utils/postman-preview'

definePageMeta({
  layout: 'dashboard',
  middleware: ['org']
})

const route = useRoute()
const organizationId = route.params.organizationId as string
const queryServiceId = typeof route.query.serviceId === 'string' ? route.query.serviceId : ''

const { listServices } = useServices(organizationId)
const { importPostman, importing } = usePostmanImport(organizationId)
const { organizationName, can } = useOrgContext()

const canManage = computed(() => can('org:services:manage'))

const { data: servicesData, pending: servicesPending } = await useAsyncData(
  () => `postman-import-services-${organizationId}`,
  () => listServices({ page: 0, size: 100 }),
  { watch: [() => organizationId] }
)

const serviceOptions = computed(() =>
  (servicesData.value?.items ?? []).map(service => ({
    label: service.name,
    value: service.id
  }))
)

type PostmanImportState = {
  import_mode: 'new' | 'existing'
  default_required_scope: string
  name: string
  slug: string
  base_url: string
  service_id: string
}

const state = reactive<PostmanImportState>({
  import_mode: queryServiceId ? 'existing' : 'new',
  default_required_scope: '',
  name: '',
  slug: '',
  base_url: '',
  service_id: queryServiceId
})

const fileInputRef = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const selectedFileName = ref<string | null>(null)
const fileError = ref<string | null>(null)
const preview = ref<PostmanPreview | null>(null)
const isDragging = ref(false)
const importedServiceId = ref<string>()

const { onSubmit, loading, formError } = useFormSubmit<PostmanImportState>({
  successMessage: result => result?.message,
  async submit(data) {
    if (!selectedFile.value) {
      throw new Error('Select a Postman collection file.')
    }

    if (fileError.value) {
      throw new Error(fileError.value)
    }

    const response = await importPostman(
      selectedFile.value,
      toPostmanImportQuery(data as PostmanImportFormData)
    )
    importedServiceId.value = response.data.service.id

    return {
      message: formatImportSummary(response.data, response.message)
    }
  },
  async onSuccess() {
    await refreshNuxtData(`datatable-services-${organizationId}`)

    if (importedServiceId.value) {
      await navigateTo(`/org/${organizationId}/services/${importedServiceId.value}`)
      return
    }

    await navigateTo(`/org/${organizationId}/services`)
  }
})

const submitLoading = computed(() => loading.value || importing.value)
const canSubmit = computed(() => Boolean(selectedFile.value) && !fileError.value)

function formatImportSummary(result: PostmanImportResult, message?: string): string {
  if (message) {
    return message
  }

  const parts: string[] = []

  if (result.routes_created > 0) {
    parts.push(`Created ${result.routes_created} route rule${result.routes_created === 1 ? '' : 's'}`)
  }

  if (result.routes_updated > 0) {
    parts.push(`Updated ${result.routes_updated} route rule${result.routes_updated === 1 ? '' : 's'}`)
  }

  if (result.routes_skipped > 0) {
    parts.push(`${result.routes_skipped} skipped`)
  }

  if (result.issues.length > 0) {
    parts.push(`${result.issues.length} issue${result.issues.length === 1 ? '' : 's'}`)
  }

  if (parts.length === 0) {
    return 'Postman collection imported successfully'
  }

  return parts.join(' · ')
}

function openFilePicker() {
  fileInputRef.value?.click()
}

async function processFile(file: File) {
  const validationError = validatePostmanFile(file)

  if (validationError) {
    selectedFile.value = null
    selectedFileName.value = null
    preview.value = null
    fileError.value = validationError
    return
  }

  try {
    const json = JSON.parse(await file.text()) as unknown
    const parsedPreview = parsePostmanPreview(json)

    if (parsedPreview.error) {
      selectedFile.value = null
      selectedFileName.value = null
      preview.value = null
      fileError.value = parsedPreview.error
      return
    }

    selectedFile.value = file
    selectedFileName.value = file.name
    preview.value = parsedPreview
    fileError.value = null

    if (state.import_mode === 'new') {
      if (!state.name && parsedPreview.name) {
        state.name = parsedPreview.name
      }

      if (!state.base_url && parsedPreview.baseUrl) {
        state.base_url = parsedPreview.baseUrl
      }
    }
  } catch {
    selectedFile.value = null
    selectedFileName.value = null
    preview.value = null
    fileError.value = 'Invalid JSON file.'
  }
}

async function onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''

  if (!file) {
    return
  }

  await processFile(file)
}

function onDragOver(event: DragEvent) {
  event.preventDefault()
  isDragging.value = true
}

function onDragLeave() {
  isDragging.value = false
}

async function onDrop(event: DragEvent) {
  event.preventDefault()
  isDragging.value = false

  const file = event.dataTransfer?.files[0]

  if (!file) {
    return
  }

  await processFile(file)
}

function clearFile() {
  selectedFile.value = null
  selectedFileName.value = null
  preview.value = null
  fileError.value = null
}

async function handleSubmit(event: Parameters<typeof onSubmit>[0]) {
  if (!canSubmit.value) {
    fileError.value = fileError.value ?? 'Select a valid Postman collection file.'
    return
  }

  await onSubmit(event)
}

const breadcrumbs = computed(() => [
  { label: organizationName.value ?? 'Organization', to: `/org/${organizationId}` },
  { label: 'Services', to: `/org/${organizationId}/services` },
  { label: 'Import from Postman' }
])
</script>

<template>
  <FormsResourceFormPage
    v-if="canManage"
    title="Import from Postman"
    description="Upload a Postman Collection v2.x JSON file to create route rules"
    topbar-title="Import from Postman"
    :breadcrumbs="breadcrumbs"
    :schema="postmanImportSchema"
    :state="state"
    submit-label="Import collection"
    :loading="submitLoading"
    :form-error="formError"
    :cancel-to="`/org/${organizationId}/services`"
    @submit="handleSubmit"
  >
    <UFormField
      label="Import mode"
      name="import_mode"
    >
      <div class="flex flex-wrap gap-2">
        <UButton
          type="button"
          :variant="state.import_mode === 'new' ? 'solid' : 'soft'"
          :color="state.import_mode === 'new' ? 'primary' : 'neutral'"
          icon="i-lucide-plus"
          @click="state.import_mode = 'new'"
        >
          Create new service
        </UButton>
        <UButton
          type="button"
          :variant="state.import_mode === 'existing' ? 'solid' : 'soft'"
          :color="state.import_mode === 'existing' ? 'primary' : 'neutral'"
          icon="i-lucide-server"
          @click="state.import_mode = 'existing'"
        >
          Add to existing service
        </UButton>
      </div>
    </UFormField>

    <UFormField
      label="Postman collection"
      name="collection_file"
      required
    >
      <div class="space-y-3">
        <div
          class="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-8 text-center transition-colors"
          :class="isDragging ? 'border-primary bg-primary/5' : 'border-default hover:border-primary/50'"
          @click="openFilePicker"
          @dragover="onDragOver"
          @dragleave="onDragLeave"
          @drop="onDrop"
        >
          <UIcon
            name="i-lucide-file-json"
            class="size-8 text-muted"
          />
          <div class="space-y-1">
            <p class="text-sm font-medium text-highlighted">
              Drop a collection file here, or click to browse
            </p>
            <p class="text-sm text-muted">
              Postman Collection v2.x JSON, max 5 MB
            </p>
          </div>
        </div>

        <div
          v-if="selectedFileName"
          class="flex items-center justify-between gap-3 rounded-lg border border-default px-3 py-2"
        >
          <div class="min-w-0">
            <p class="truncate text-sm font-medium text-highlighted">
              {{ selectedFileName }}
            </p>
            <p
              v-if="preview"
              class="text-sm text-muted"
            >
              {{ preview.requestCount }} route{{ preview.requestCount === 1 ? '' : 's' }} detected
            </p>
          </div>
          <UButton
            type="button"
            color="neutral"
            variant="ghost"
            icon="i-lucide-x"
            aria-label="Remove file"
            @click.stop="clearFile"
          />
        </div>

        <UAlert
          v-if="fileError"
          color="error"
          variant="subtle"
          :title="fileError"
        />

        <UCard
          v-if="preview"
          variant="subtle"
        >
          <div class="space-y-2 text-sm">
            <p>
              <span class="text-muted">Collection:</span>
              <span class="font-medium text-highlighted">
                {{ preview.name ?? 'Untitled collection' }}
              </span>
            </p>
            <p v-if="preview.baseUrl">
              <span class="text-muted">Base URL hint:</span>
              <span class="font-medium text-highlighted">{{ preview.baseUrl }}</span>
            </p>
            <p class="text-muted">
              {{ preview.requestCount }} route{{ preview.requestCount === 1 ? '' : 's' }} will be imported
            </p>
          </div>
        </UCard>
      </div>

      <input
        ref="fileInputRef"
        type="file"
        :accept="POSTMAN_ACCEPT"
        class="hidden"
        @change="onFileSelected"
      >
    </UFormField>

    <UFormField
      label="Default required scope"
      name="default_required_scope"
      hint="Applied to each imported route rule"
      required
    >
      <UInput
        v-model="state.default_required_scope"
        placeholder="api:read"
      />
    </UFormField>

    <template v-if="state.import_mode === 'new'">
      <UFormField
        label="Service name"
        name="name"
        required
      >
        <UInput
          v-model="state.name"
          placeholder="Payments API"
        />
      </UFormField>

      <UFormField
        label="Slug"
        name="slug"
        hint="Optional. Used in URLs."
      >
        <UInput
          v-model="state.slug"
          placeholder="payments-api"
        />
      </UFormField>

      <UFormField
        label="Base URL"
        name="base_url"
        hint="Optional upstream base URL"
      >
        <UInput
          v-model="state.base_url"
          placeholder="https://api.example.com"
        />
      </UFormField>
    </template>

    <template v-else>
      <UFormField
        label="Service"
        name="service_id"
        required
      >
        <USelect
          v-model="state.service_id"
          :items="serviceOptions"
          value-key="value"
          label-key="label"
          placeholder="Select a service"
          :loading="servicesPending"
        />
      </UFormField>
    </template>

    <template #actions>
      <p
        v-if="!canSubmit"
        class="text-sm text-muted"
      >
        Select a valid collection file to import.
      </p>
    </template>
  </FormsResourceFormPage>

  <UDashboardPanel v-else>
    <template #header>
      <LayoutTopbar
        title="Import from Postman"
        :breadcrumbs="breadcrumbs"
      />
    </template>

    <template #body>
      <div class="mx-auto w-full max-w-lg p-4 sm:p-6">
        <UiPageHeader
          title="Import from Postman"
          description="Upload a Postman Collection v2.x JSON file to create route rules"
        />

        <UAlert
          color="neutral"
          variant="subtle"
          title="Access denied"
          description="You need service management permissions to import Postman collections."
        />
      </div>
    </template>
  </UDashboardPanel>
</template>
