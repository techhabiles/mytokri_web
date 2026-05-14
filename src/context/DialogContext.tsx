import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

interface DialogState {
  open: boolean
  title: string
  message: string
  variant: 'info' | 'error' | 'success'
  errorCode?: number
  onClose?: () => void
}

interface ConfirmState {
  open: boolean
  title: string
  message: string
  confirmLabel: string
  cancelLabel: string
  onConfirm?: () => void
}

interface DialogContextValue {
  loading: boolean
  setLoading: (v: boolean) => void
  showMessage: (title: string, message: string, onClose?: () => void) => void
  showSuccess: (title: string, message: string, onClose?: () => void) => void
  showError: (title: string, message: string, errorCode?: number) => void
  showConfirm: (
    title: string,
    message: string,
    onConfirm: () => void,
    confirmLabel?: string,
    cancelLabel?: string,
  ) => void
  dialog: DialogState
  confirm: ConfirmState
  closeDialog: () => void
  closeConfirm: () => void
}

const DialogContext = createContext<DialogContextValue | undefined>(undefined)

const initialDialog: DialogState = {
  open: false,
  title: '',
  message: '',
  variant: 'info',
}

const initialConfirm: ConfirmState = {
  open: false,
  title: '',
  message: '',
  confirmLabel: 'OK',
  cancelLabel: 'Cancel',
}

export function DialogProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(false)
  const [dialog, setDialog] = useState<DialogState>(initialDialog)
  const [confirm, setConfirm] = useState<ConfirmState>(initialConfirm)

  const showMessage = useCallback(
    (title: string, message: string, onClose?: () => void) => {
      setDialog({ open: true, title, message, variant: 'info', onClose })
    },
    [],
  )

  const showSuccess = useCallback(
    (title: string, message: string, onClose?: () => void) => {
      setDialog({ open: true, title, message, variant: 'success', onClose })
    },
    [],
  )

  const showError = useCallback(
    (title: string, message: string, errorCode?: number) => {
      setDialog({ open: true, title, message, variant: 'error', errorCode })
    },
    [],
  )

  const showConfirm = useCallback(
    (
      title: string,
      message: string,
      onConfirm: () => void,
      confirmLabel = 'Confirm',
      cancelLabel = 'Cancel',
    ) => {
      setConfirm({ open: true, title, message, confirmLabel, cancelLabel, onConfirm })
    },
    [],
  )

  const closeDialog = useCallback(() => {
    setDialog((d) => {
      d.onClose?.()
      return initialDialog
    })
  }, [])

  const closeConfirm = useCallback(() => {
    setConfirm(initialConfirm)
  }, [])

  const value = useMemo<DialogContextValue>(
    () => ({
      loading,
      setLoading,
      showMessage,
      showSuccess,
      showError,
      showConfirm,
      dialog,
      confirm,
      closeDialog,
      closeConfirm,
    }),
    [
      loading,
      dialog,
      confirm,
      showMessage,
      showSuccess,
      showError,
      showConfirm,
      closeDialog,
      closeConfirm,
    ],
  )

  return <DialogContext.Provider value={value}>{children}</DialogContext.Provider>
}

export function useDialog() {
  const ctx = useContext(DialogContext)
  if (!ctx) throw new Error('useDialog must be used inside DialogProvider')
  return ctx
}
