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

export interface RegisterRequestBody {
  email: string
  password: string
  full_name: string
  invite_token?: string
}

export interface LoginRequestBody {
  email: string
  password: string
}

export interface ResendVerificationRequestBody {
  email: string
}

export interface ForgotPasswordRequestBody {
  email: string
}

export interface ResetPasswordRequestBody {
  token: string
  password: string
}

export interface ChangePasswordRequestBody {
  current_password: string
  new_password: string
}
