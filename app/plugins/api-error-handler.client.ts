export default defineNuxtPlugin(() => {
  const { handleUnauthorized } = useUnauthorizedHandler()

  const apiFetch = $fetch.create({
    async onResponseError({ response }) {
      if (response.status !== 401) {
        return
      }

      const requestUrl = response.url ?? ''

      if (requestUrl.includes('/api/auth/login')) {
        return
      }

      await handleUnauthorized()
    }
  })

  return {
    provide: {
      apiFetch
    }
  }
})
