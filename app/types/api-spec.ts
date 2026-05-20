/* eslint-disable -- copied verbatim from backend API spec */
/* eslint-disable -- copied verbatim from backend API spec */
/* eslint-disable -- copied verbatim from backend API spec */
export type HttpVerb = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
export type UUID = string;
export type DateTimeString = string;

export type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "HEAD"
  | "OPTIONS"
  | "ANY";

export type AnalyticsTimeBucket = "HOUR" | "DAY" | "MONTH";
export type ApiConsumerStatus = "ACTIVE" | "SUSPENDED" | "ARCHIVED";
export type ApiConsumerType = "INTERNAL" | "EXTERNAL" | "PARTNER";
export type ApiKeyStatus = "ACTIVE" | "REVOKED";
export type ApiServiceStatus = "ACTIVE" | "SUSPENDED" | "ARCHIVED";
export type MembershipStatus = "ACTIVE" | "SUSPENDED" | "REMOVED";
export type OrganizationStatus = "ACTIVE" | "SUSPENDED";
export type RateLimitWindowUnit = "SECONDS" | "MINUTES" | "HOURS" | "DAYS";

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };
export type JsonObject = { [key: string]: JsonValue };

export interface PageQuery {
  page?: number;
  size?: number;
  sort?: string | string[];
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PageMeta {
  currentPage?: number
  perPage?: number
  total?: number
  totalPages?: number
  nextPage?: number | null
  prevPage?: number | null
}

export interface ListResponse<T> {
  items: T[]
  meta?: PageMeta
}

export type UnknownResponse = JsonObject;

// Request body shapes intentionally use the REST wire format. Keep keys snake_case.
export interface RegisterRequestBody {
  email: string;
  password: string;
  full_name: string;
  invite_token?: string;
}

export interface LoginRequestBody {
  email: string;
  password: string;
}

export interface ResendVerificationRequestBody {
  email: string;
}

export interface ForgotPasswordRequestBody {
  email: string;
}

export interface ResetPasswordRequestBody {
  token: string;
  password: string;
}

export interface ChangePasswordRequestBody {
  current_password: string;
  new_password: string;
}

export interface CreateOrganizationInviteRequestBody {
  email: string;
  role_code: string;
}

export interface UpdateUserProfileRequestBody {
  full_name?: string;
}

export interface UpdateUserStatusRequestBody {
  active: boolean;
}

export interface AdminUserStatusRequestBody {
  active: boolean;
}

export interface AdminOrganizationStatusRequestBody {
  status: OrganizationStatus;
}

export type AssignPlatformRoleRequestBody =
  | { role_code: string; role_id?: never }
  | { role_code?: never; role_id: UUID };

export interface CreateOrganizationRequestBody {
  name: string;
  slug?: string;
}

export interface UpdateOrganizationRequestBody {
  name?: string;
  slug?: string;
}

export type CreateMembershipRequestBody =
  | { user_id: UUID; email?: never; role_code: string }
  | { user_id?: never; email: string; role_code: string };

export interface UpdateMembershipRoleRequestBody {
  role_code: string;
}

export interface CreateApiConsumerRequestBody {
  name: string;
  type: ApiConsumerType;
}

export interface UpdateApiConsumerRequestBody {
  name?: string;
  type?: ApiConsumerType;
}

export interface UpdateApiConsumerStatusRequestBody {
  status: ApiConsumerStatus;
}

export interface CreateApiServiceRequestBody {
  name: string;
  slug?: string;
  base_url: string;
  internal_auth_header_name?: string;
  internal_secret?: string;
}

export interface UpdateApiServiceRequestBody {
  name?: string;
  slug?: string;
  base_url?: string;
  internal_auth_header_name?: string;
  internal_secret?: string;
}

export interface UpdateApiServiceStatusRequestBody {
  status: ApiServiceStatus;
}

export interface PostmanImportQuery {
  defaultRequiredScope: string;
  serviceId?: UUID;
  name?: string;
  slug?: string;
  baseUrl?: string;
}

export interface CreateRouteRuleRequestBody {
  method: HttpMethod;
  path_pattern: string;
  required_scope: string;
}

export interface UpdateRouteRuleRequestBody {
  method?: HttpMethod;
  path_pattern?: string;
  required_scope?: string;
  active?: boolean;
}

export interface UpdateRouteRuleStatusRequestBody {
  active: boolean;
}

export interface CreateApiKeyRequestBody {
  consumer_id: UUID;
  name: string;
  scopes: string[];
  expires_at?: DateTimeString;
}

export interface UpdateApiKeyStatusRequestBody {
  status: ApiKeyStatus;
}

export interface UpdateApiKeyScopesRequestBody {
  scopes: string[];
}

export interface CreateApiRateLimitPolicyRequestBody {
  request_limit: number;
  window_unit: RateLimitWindowUnit;
  window_size: number;
}

export interface UpdateApiRateLimitPolicyRequestBody {
  request_limit?: number;
  window_unit?: RateLimitWindowUnit;
  window_size?: number;
  active?: boolean;
}

export interface UpdateApiRateLimitPolicyStatusRequestBody {
  active: boolean;
}

export interface AnalyticsQuery {
  service_id?: UUID;
  consumer_id?: UUID;
  api_key_id?: UUID;
  status_code?: number;
  rate_limited?: boolean;
  method?: HttpMethod;
  created_from?: DateTimeString;
  created_to?: DateTimeString;
}

export interface PlatformAnalyticsQuery extends AnalyticsQuery {
  organization_id?: UUID;
}

export interface UsageLogQuery extends AnalyticsQuery, PageQuery {
  error_code?: string;
  search?: string;
}

export interface EndpointSpec<
  TPath extends string = string,
  TQuery extends JsonObject | undefined = JsonObject | undefined,
  TBody extends JsonObject | FormData | undefined = JsonObject | FormData | undefined,
  TResponse = UnknownResponse,
> {
  method: HttpVerb;
  path: TPath;
  query?: TQuery;
  body?: TBody;
  response?: TResponse;
}

export const apiSpec = {
  requestBodyKeyPolicy: "snake_case",

  auth: {
    register: {
      method: "POST",
      path: "/api/auth/register",
      body: undefined as unknown as RegisterRequestBody,
    },
    login: {
      method: "POST",
      path: "/api/auth/login",
      body: undefined as unknown as LoginRequestBody,
    },
    logout: {
      method: "POST",
      path: "/api/auth/logout",
    },
    me: {
      method: "GET",
      path: "/api/auth/me",
    },
    invite: {
      method: "GET",
      path: "/api/auth/invite",
      query: undefined as unknown as { token: string },
    },
    verifyEmail: {
      method: "GET",
      path: "/api/auth/verify-email",
      query: undefined as unknown as { token: string },
    },
    resendVerification: {
      method: "POST",
      path: "/api/auth/resend-verification",
      body: undefined as unknown as ResendVerificationRequestBody,
    },
    forgotPassword: {
      method: "POST",
      path: "/api/auth/forgot-password",
      body: undefined as unknown as ForgotPasswordRequestBody,
    },
    resetPassword: {
      method: "POST",
      path: "/api/auth/reset-password",
      body: undefined as unknown as ResetPasswordRequestBody,
    },
    changePassword: {
      method: "POST",
      path: "/api/auth/change-password",
      body: undefined as unknown as ChangePasswordRequestBody,
    },
  },

  users: {
    me: {
      method: "GET",
      path: "/api/users/me",
    },
    updateMe: {
      method: "PATCH",
      path: "/api/users/me",
      body: undefined as unknown as UpdateUserProfileRequestBody,
    },
    updateMyStatus: {
      method: "PATCH",
      path: "/api/users/me/status",
      body: undefined as unknown as UpdateUserStatusRequestBody,
    },
    uploadAvatar: {
      method: "PUT",
      path: "/api/users/me/avatar",
      body: undefined as unknown as FormData,
    },
    deleteAvatar: {
      method: "DELETE",
      path: "/api/users/me/avatar",
    },
    avatar: {
      method: "GET",
      path: "/api/users/{userId}/avatar",
    },
  },

  admin: {
    health: {
      method: "GET",
      path: "/api/admin/health",
    },
    organizations: {
      method: "GET",
      path: "/api/admin/organizations",
      query: undefined as unknown as PageQuery & {
        id?: UUID;
        name?: string;
        slug?: string;
        status?: OrganizationStatus;
        search?: string;
      },
    },
    users: {
      method: "GET",
      path: "/api/admin/users",
      query: undefined as unknown as PageQuery & {
        id?: UUID;
        email?: string;
        fullName?: string;
        active?: boolean;
        emailVerified?: boolean;
        includeDeleted?: boolean;
        search?: string;
      },
    },
    user: {
      method: "GET",
      path: "/api/admin/users/{userId}",
    },
    organization: {
      method: "GET",
      path: "/api/admin/organizations/{organizationId}",
    },
    updateUserStatus: {
      method: "PATCH",
      path: "/api/admin/users/{userId}/status",
      body: undefined as unknown as AdminUserStatusRequestBody,
    },
    updateOrganizationStatus: {
      method: "PATCH",
      path: "/api/admin/organizations/{organizationId}/status",
      body: undefined as unknown as AdminOrganizationStatusRequestBody,
    },
    suspendUser: {
      method: "POST",
      path: "/api/admin/users/{userId}/suspend",
    },
    reactivateUser: {
      method: "POST",
      path: "/api/admin/users/{userId}/reactivate",
    },
    deleteUser: {
      method: "DELETE",
      path: "/api/admin/users/{userId}",
    },
    suspendOrganization: {
      method: "POST",
      path: "/api/admin/organizations/{organizationId}/suspend",
    },
    reactivateOrganization: {
      method: "POST",
      path: "/api/admin/organizations/{organizationId}/reactivate",
    },
    inspectUser: {
      method: "GET",
      path: "/api/admin/support/users/{userId}",
    },
    inspectOrganization: {
      method: "GET",
      path: "/api/admin/support/organizations/{organizationId}",
    },
    roles: {
      method: "GET",
      path: "/api/admin/roles",
    },
    userRoles: {
      method: "GET",
      path: "/api/admin/users/{userId}/roles",
    },
    assignUserRole: {
      method: "POST",
      path: "/api/admin/users/{userId}/roles",
      body: undefined as unknown as AssignPlatformRoleRequestBody,
    },
    removeUserRole: {
      method: "DELETE",
      path: "/api/admin/users/{userId}/roles/{roleId}",
    },
    usageLogs: {
      method: "GET",
      path: "/api/admin/usage-logs",
      query: undefined as unknown as UsageLogQuery & PlatformAnalyticsQuery,
    },
    usageLog: {
      method: "GET",
      path: "/api/admin/usage-logs/{usageLogId}",
    },
    analyticsOverview: {
      method: "GET",
      path: "/api/admin/analytics/overview",
      query: undefined as unknown as PlatformAnalyticsQuery,
    },
    analyticsTimeSeries: {
      method: "GET",
      path: "/api/admin/analytics/timeseries",
      query: undefined as unknown as PlatformAnalyticsQuery & { bucket: AnalyticsTimeBucket },
    },
    analyticsOrganizationBreakdown: {
      method: "GET",
      path: "/api/admin/analytics/breakdown/organizations",
      query: undefined as unknown as PlatformAnalyticsQuery,
    },
    analyticsServiceBreakdown: {
      method: "GET",
      path: "/api/admin/analytics/breakdown/services",
      query: undefined as unknown as PlatformAnalyticsQuery,
    },
    analyticsConsumerBreakdown: {
      method: "GET",
      path: "/api/admin/analytics/breakdown/consumers",
      query: undefined as unknown as PlatformAnalyticsQuery,
    },
    analyticsApiKeyBreakdown: {
      method: "GET",
      path: "/api/admin/analytics/breakdown/api-keys",
      query: undefined as unknown as PlatformAnalyticsQuery,
    },
    analyticsStatusCodeBreakdown: {
      method: "GET",
      path: "/api/admin/analytics/breakdown/status-codes",
      query: undefined as unknown as PlatformAnalyticsQuery,
    },
    analyticsTopPaths: {
      method: "GET",
      path: "/api/admin/analytics/breakdown/top-paths",
      query: undefined as unknown as PlatformAnalyticsQuery & { limit?: number },
    },
    analyticsSlowestPaths: {
      method: "GET",
      path: "/api/admin/analytics/breakdown/slowest-paths",
      query: undefined as unknown as PlatformAnalyticsQuery & { limit?: number },
    },
  },

  organizations: {
    create: {
      method: "POST",
      path: "/api/organizations",
      body: undefined as unknown as CreateOrganizationRequestBody,
    },
    list: {
      method: "GET",
      path: "/api/organizations",
      query: undefined as unknown as PageQuery & {
        id?: UUID;
        name?: string;
        slug?: string;
        status?: OrganizationStatus;
        role_code?: string;
        search?: string;
      },
    },
    get: {
      method: "GET",
      path: "/api/organizations/{organizationId}",
    },
    update: {
      method: "PATCH",
      path: "/api/organizations/{organizationId}",
      body: undefined as unknown as UpdateOrganizationRequestBody,
    },
    delete: {
      method: "DELETE",
      path: "/api/organizations/{organizationId}",
    },
  },

  organizationInvites: {
    create: {
      method: "POST",
      path: "/api/organizations/{organizationId}/invites",
      body: undefined as unknown as CreateOrganizationInviteRequestBody,
    },
  },

  memberships: {
    create: {
      method: "POST",
      path: "/api/organizations/{organizationId}/memberships",
      body: undefined as unknown as CreateMembershipRequestBody,
    },
    list: {
      method: "GET",
      path: "/api/organizations/{organizationId}/memberships",
      query: undefined as unknown as PageQuery & {
        id?: UUID;
        status?: MembershipStatus;
        role_code?: string;
        email?: string;
        full_name?: string;
        search?: string;
      },
    },
    get: {
      method: "GET",
      path: "/api/organizations/{organizationId}/memberships/{membershipId}",
    },
    remove: {
      method: "DELETE",
      path: "/api/organizations/{organizationId}/memberships/{membershipId}",
    },
    updateRole: {
      method: "PATCH",
      path: "/api/organizations/{organizationId}/memberships/{membershipId}/role",
      body: undefined as unknown as UpdateMembershipRoleRequestBody,
    },
  },

  consumers: {
    create: {
      method: "POST",
      path: "/api/organizations/{organizationId}/consumers",
      body: undefined as unknown as CreateApiConsumerRequestBody,
    },
    list: {
      method: "GET",
      path: "/api/organizations/{organizationId}/consumers",
      query: undefined as unknown as PageQuery & {
        id?: UUID;
        name?: string;
        type?: ApiConsumerType;
        status?: ApiConsumerStatus;
        include_archived?: boolean;
        search?: string;
      },
    },
    get: {
      method: "GET",
      path: "/api/organizations/{organizationId}/consumers/{consumerId}",
    },
    update: {
      method: "PATCH",
      path: "/api/organizations/{organizationId}/consumers/{consumerId}",
      body: undefined as unknown as UpdateApiConsumerRequestBody,
    },
    updateStatus: {
      method: "PATCH",
      path: "/api/organizations/{organizationId}/consumers/{consumerId}/status",
      body: undefined as unknown as UpdateApiConsumerStatusRequestBody,
    },
    delete: {
      method: "DELETE",
      path: "/api/organizations/{organizationId}/consumers/{consumerId}",
    },
  },

  services: {
    create: {
      method: "POST",
      path: "/api/organizations/{organizationId}/services",
      body: undefined as unknown as CreateApiServiceRequestBody,
    },
    list: {
      method: "GET",
      path: "/api/organizations/{organizationId}/services",
      query: undefined as unknown as PageQuery & {
        id?: UUID;
        name?: string;
        slug?: string;
        status?: ApiServiceStatus;
        include_archived?: boolean;
        search?: string;
      },
    },
    get: {
      method: "GET",
      path: "/api/organizations/{organizationId}/services/{serviceId}",
    },
    update: {
      method: "PATCH",
      path: "/api/organizations/{organizationId}/services/{serviceId}",
      body: undefined as unknown as UpdateApiServiceRequestBody,
    },
    updateStatus: {
      method: "PATCH",
      path: "/api/organizations/{organizationId}/services/{serviceId}/status",
      body: undefined as unknown as UpdateApiServiceStatusRequestBody,
    },
    delete: {
      method: "DELETE",
      path: "/api/organizations/{organizationId}/services/{serviceId}",
    },
    importPostman: {
      method: "POST",
      path: "/api/organizations/{organizationId}/services/import/postman",
      query: undefined as unknown as PostmanImportQuery,
      body: undefined as unknown as FormData,
    },
  },

  routeRules: {
    create: {
      method: "POST",
      path: "/api/organizations/{organizationId}/services/{serviceId}/route-rules",
      body: undefined as unknown as CreateRouteRuleRequestBody,
    },
    list: {
      method: "GET",
      path: "/api/organizations/{organizationId}/services/{serviceId}/route-rules",
      query: undefined as unknown as PageQuery & {
        id?: UUID;
        method?: HttpMethod;
        pathPattern?: string;
        requiredScope?: string;
        active?: boolean;
        search?: string;
      },
    },
    get: {
      method: "GET",
      path: "/api/organizations/{organizationId}/services/{serviceId}/route-rules/{routeRuleId}",
    },
    update: {
      method: "PATCH",
      path: "/api/organizations/{organizationId}/services/{serviceId}/route-rules/{routeRuleId}",
      body: undefined as unknown as UpdateRouteRuleRequestBody,
    },
    updateStatus: {
      method: "PATCH",
      path: "/api/organizations/{organizationId}/services/{serviceId}/route-rules/{routeRuleId}/status",
      body: undefined as unknown as UpdateRouteRuleStatusRequestBody,
    },
    delete: {
      method: "DELETE",
      path: "/api/organizations/{organizationId}/services/{serviceId}/route-rules/{routeRuleId}",
    },
  },

  apiKeys: {
    create: {
      method: "POST",
      path: "/api/organizations/{organizationId}/services/{serviceId}/api-keys",
      body: undefined as unknown as CreateApiKeyRequestBody,
    },
    list: {
      method: "GET",
      path: "/api/organizations/{organizationId}/services/{serviceId}/api-keys",
      query: undefined as unknown as PageQuery & {
        id?: UUID;
        consumer_id?: UUID;
        name?: string;
        status?: ApiKeyStatus;
        search?: string;
      },
    },
    get: {
      method: "GET",
      path: "/api/organizations/{organizationId}/services/{serviceId}/api-keys/{keyId}",
    },
    updateStatus: {
      method: "PATCH",
      path: "/api/organizations/{organizationId}/services/{serviceId}/api-keys/{keyId}/status",
      body: undefined as unknown as UpdateApiKeyStatusRequestBody,
    },
    updateScopes: {
      method: "PATCH",
      path: "/api/organizations/{organizationId}/services/{serviceId}/api-keys/{keyId}/scopes",
      body: undefined as unknown as UpdateApiKeyScopesRequestBody,
    },
    delete: {
      method: "DELETE",
      path: "/api/organizations/{organizationId}/services/{serviceId}/api-keys/{keyId}",
    },
  },

  rateLimitPolicy: {
    create: {
      method: "POST",
      path: "/api/organizations/{organizationId}/services/{serviceId}/api-keys/{apiKeyId}/rate-limit-policy",
      body: undefined as unknown as CreateApiRateLimitPolicyRequestBody,
    },
    get: {
      method: "GET",
      path: "/api/organizations/{organizationId}/services/{serviceId}/api-keys/{apiKeyId}/rate-limit-policy",
    },
    update: {
      method: "PATCH",
      path: "/api/organizations/{organizationId}/services/{serviceId}/api-keys/{apiKeyId}/rate-limit-policy",
      body: undefined as unknown as UpdateApiRateLimitPolicyRequestBody,
    },
    updateStatus: {
      method: "PATCH",
      path: "/api/organizations/{organizationId}/services/{serviceId}/api-keys/{apiKeyId}/rate-limit-policy/status",
      body: undefined as unknown as UpdateApiRateLimitPolicyStatusRequestBody,
    },
    delete: {
      method: "DELETE",
      path: "/api/organizations/{organizationId}/services/{serviceId}/api-keys/{apiKeyId}/rate-limit-policy",
    },
  },

  usageLogs: {
    list: {
      method: "GET",
      path: "/api/organizations/{organizationId}/usage-logs",
      query: undefined as unknown as UsageLogQuery,
    },
    get: {
      method: "GET",
      path: "/api/organizations/{organizationId}/usage-logs/{logId}",
    },
  },

  analytics: {
    overview: {
      method: "GET",
      path: "/api/organizations/{organizationId}/analytics/overview",
      query: undefined as unknown as AnalyticsQuery,
    },
    timeSeries: {
      method: "GET",
      path: "/api/organizations/{organizationId}/analytics/timeseries",
      query: undefined as unknown as AnalyticsQuery & { bucket: AnalyticsTimeBucket },
    },
    serviceBreakdown: {
      method: "GET",
      path: "/api/organizations/{organizationId}/analytics/breakdown/services",
      query: undefined as unknown as AnalyticsQuery,
    },
    consumerBreakdown: {
      method: "GET",
      path: "/api/organizations/{organizationId}/analytics/breakdown/consumers",
      query: undefined as unknown as AnalyticsQuery,
    },
    apiKeyBreakdown: {
      method: "GET",
      path: "/api/organizations/{organizationId}/analytics/breakdown/api-keys",
      query: undefined as unknown as AnalyticsQuery,
    },
    methodBreakdown: {
      method: "GET",
      path: "/api/organizations/{organizationId}/analytics/breakdown/methods",
      query: undefined as unknown as AnalyticsQuery,
    },
    statusCodeBreakdown: {
      method: "GET",
      path: "/api/organizations/{organizationId}/analytics/breakdown/status-codes",
      query: undefined as unknown as AnalyticsQuery,
    },
    topPaths: {
      method: "GET",
      path: "/api/organizations/{organizationId}/analytics/breakdown/top-paths",
      query: undefined as unknown as AnalyticsQuery & { limit?: number },
    },
    slowestPaths: {
      method: "GET",
      path: "/api/organizations/{organizationId}/analytics/breakdown/slowest-paths",
      query: undefined as unknown as AnalyticsQuery & { limit?: number },
    },
  },
} as const;

export type ApiSpec = typeof apiSpec;
