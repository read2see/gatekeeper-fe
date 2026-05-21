export interface ConfirmOptions {
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  confirmColor?: 'primary' | 'error' | 'neutral' | 'warning'
  destructive?: boolean
}

let pendingResolve: ((value: boolean) => void) | null = null

export function useConfirm() {
  const isOpen = useState('confirm-dialog-open', () => false)
  const options = useState<ConfirmOptions | null>('confirm-dialog-options', () => null)

  function confirm(confirmOptions: ConfirmOptions) {
    options.value = confirmOptions
    isOpen.value = true

    return new Promise<boolean>((resolve) => {
      pendingResolve = resolve
    })
  }

  function accept() {
    isOpen.value = false
    pendingResolve?.(true)
    pendingResolve = null
    options.value = null
  }

  function dismiss() {
    isOpen.value = false
    pendingResolve?.(false)
    pendingResolve = null
    options.value = null
  }

  return {
    isOpen,
    options,
    confirm,
    accept,
    dismiss
  }
}
