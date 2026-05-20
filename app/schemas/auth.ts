import { z } from 'zod'

const emailField = z
  .string()
  .trim()
  .min(1, 'Email is required')
  .email('Enter a valid email address')

const passwordField = z
  .string()
  .min(8, 'Password must be at least 8 characters')

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, 'Password is required')
})

export const registerSchema = z.object({
  email: emailField,
  password: passwordField,
  full_name: z.string().trim().min(1, 'Full name is required'),
  invite_token: z.string().optional()
})

export const resendVerificationSchema = z.object({
  email: emailField
})

export const forgotPasswordSchema = z.object({
  email: emailField
})

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: passwordField
})

export const changePasswordSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  new_password: passwordField
})

export const updateProfileSchema = z.object({
  full_name: z.string().trim().min(1, 'Full name is required')
})

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type ResendVerificationFormData = z.infer<typeof resendVerificationSchema>
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>
export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>
