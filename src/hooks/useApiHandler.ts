import { useCallback } from 'react'
import { useDialog } from '../context/DialogContext'
import { MyTokriError, UnauthorisedError } from '../api/errors'

export function useApiHandler() {
  const { setLoading, showError } = useDialog()

  const run = useCallback(
    async <T,>(
      fn: () => Promise<T>,
      opts?: { fallback?: string; silent?: boolean },
    ): Promise<T | null> => {
      try {
        setLoading(true)
        return await fn()
      } catch (e) {
        if (e instanceof UnauthorisedError) {
          // Handled globally — redirect to login by setUnauthorisedHandler
          return null
        }
        if (!opts?.silent) {
          if (e instanceof MyTokriError) {
            showError('Error', e.message || opts?.fallback || 'Request failed', e.errorCode)
          } else {
            showError('Error', opts?.fallback || (e as Error).message || 'Request failed')
          }
        }
        return null
      } finally {
        setLoading(false)
      }
    },
    [setLoading, showError],
  )

  return { run }
}
