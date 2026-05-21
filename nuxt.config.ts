// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@nuxt/ui', 'nuxt-auth-utils'],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    gatekeeperApiBase: 'http://localhost:8080',
    public: {
      gatekeeperApiBase: 'http://localhost:8080'
    }
  },

  compatibilityDate: '2025-01-15',

  auth: {
    loadStrategy: 'server-first'
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  icon: {
    serverBundle: 'local',
    clientBundle: {
      scan: true,
      icons: ['lucide:sun', 'lucide:moon']
    }
  }
})
