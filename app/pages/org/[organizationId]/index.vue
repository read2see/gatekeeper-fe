<script setup lang="ts">
import { getErrorMessage } from '~/utils/api-errors'
import { formatRoleCode, formatTableDate } from '~/utils/table'

definePageMeta({
  layout: 'dashboard',
  middleware: ['org']
})

const { orgBasePath, organization, pending, error, refresh, membershipRole, can } = useOrgContext()

const quickLinks = computed(() => {
  const base = orgBasePath.value
  const links = [
    {
      title: 'API management',
      description: 'Manage API services, route rules, and keys',
      icon: 'i-lucide-blocks',
      to: `${base}/apis`,
      permission: 'org:services:manage' as const
    },
    {
      title: 'Consumers',
      description: 'Manage API consumers and access',
      icon: 'i-lucide-plug',
      to: `${base}/consumers`,
      permission: 'org:consumers:manage' as const
    },
    {
      title: 'Members',
      description: 'Invite and manage organization members',
      icon: 'i-lucide-users',
      to: `${base}/members`,
      permission: 'org:members:manage' as const
    },
    {
      title: 'Analytics',
      description: 'Usage metrics, trends, and breakdowns',
      icon: 'i-lucide-bar-chart-3',
      to: `${base}/analytics`,
      permission: 'org:analytics:read' as const
    },
    {
      title: 'Usage logs',
      description: 'Browse recent API request logs',
      icon: 'i-lucide-scroll-text',
      to: `${base}/usage-logs`,
      permission: 'org:read' as const
    },
    {
      title: 'Settings',
      description: 'Update organization name and slug',
      icon: 'i-lucide-settings',
      to: `${base}/settings`,
      permission: 'org:manage' as const
    }
  ]

  return links.filter(link => can(link.permission))
})
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <LayoutTopbar :title="organization?.name ?? 'Organization'" />
    </template>

    <template #body>
      <div class="flex flex-col gap-6 p-4 sm:p-6">
        <UiPageHeader
          :title="organization?.name ?? 'Organization overview'"
          description="Manage services, consumers, members, and settings"
        />

        <UiLoadingState
          v-if="pending && !organization"
          message="Loading organization..."
        />

        <UiErrorState
          v-else-if="error"
          title="Failed to load organization"
          :message="getErrorMessage(error)"
          retryable
          @retry="refresh()"
        />

        <template v-else-if="organization">
          <UCard>
            <template #header>
              <div class="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 class="text-base font-semibold text-highlighted">
                    {{ organization.name }}
                  </h2>
                  <p class="text-sm text-muted">
                    {{ organization.slug }}
                  </p>
                </div>

                <div class="flex flex-wrap items-center gap-2">
                  <UiStatusBadge :status="organization.status ?? 'ACTIVE'" />
                  <UBadge
                    v-if="membershipRole"
                    color="neutral"
                    variant="subtle"
                    size="xs"
                  >
                    {{ formatRoleCode(membershipRole) }}
                  </UBadge>
                </div>
              </div>
            </template>

            <dl class="grid gap-4 sm:grid-cols-2">
              <div>
                <dt class="text-sm text-muted">
                  Organization ID
                </dt>
                <dd class="mt-1 font-mono text-sm text-highlighted">
                  {{ organization.id }}
                </dd>
              </div>
              <div>
                <dt class="text-sm text-muted">
                  Created
                </dt>
                <dd class="mt-1 text-sm text-highlighted">
                  {{ formatTableDate(organization.created_at) }}
                </dd>
              </div>
            </dl>
          </UCard>

          <div
            v-if="quickLinks.length"
            class="grid gap-4 md:grid-cols-2"
          >
            <UCard
              v-for="link in quickLinks"
              :key="link.to"
              :ui="{ body: 'p-0 sm:p-0' }"
            >
              <NuxtLink
                :to="link.to"
                class="flex items-start gap-4 p-4 transition-colors hover:bg-elevated/50 sm:p-6"
              >
                <div class="rounded-lg bg-primary/10 p-2">
                  <UIcon
                    :name="link.icon"
                    class="size-5 text-primary"
                  />
                </div>
                <div class="min-w-0 space-y-1">
                  <p class="font-semibold text-highlighted">
                    {{ link.title }}
                  </p>
                  <p class="text-sm text-muted">
                    {{ link.description }}
                  </p>
                </div>
                <UIcon
                  name="i-lucide-arrow-right"
                  class="ml-auto size-4 shrink-0 text-muted"
                />
              </NuxtLink>
            </UCard>
          </div>
        </template>
      </div>
    </template>
  </UDashboardPanel>
</template>
