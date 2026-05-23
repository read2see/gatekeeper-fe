import { apiSpec } from '~/types/api-spec'
import type { PostmanImportQuery } from '~/types/api-spec'
import type { PostmanImportResult } from '~/types/domain'
import { interpolatePath } from '~/utils/api-path'
import { parsePostmanPreview, validatePostmanFile } from '~/utils/postman-preview'

export interface PostmanImportResponse {
  data: PostmanImportResult
  message?: string
}

export function usePostmanImport(organizationId: string) {
  const importing = ref(false)

  async function importPostman(file: File, query: PostmanImportQuery): Promise<PostmanImportResponse> {
    const validationError = validatePostmanFile(file)
    if (validationError) {
      throw new Error(validationError)
    }

    importing.value = true

    try {
      const formData = new FormData()
      formData.append('file', file)

      const path = interpolatePath(apiSpec.services.importPostman.path, { organizationId })

      return await $fetch<PostmanImportResponse>(path, {
        method: apiSpec.services.importPostman.method,
        query,
        body: formData
      })
    } finally {
      importing.value = false
    }
  }

  return {
    importing,
    importPostman,
    parsePostmanPreview,
    validatePostmanFile
  }
}
