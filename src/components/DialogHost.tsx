import { useDialog } from '../context/DialogContext'

export default function DialogHost() {
  const { dialog, confirm, closeDialog, closeConfirm } = useDialog()

  return (
    <>
      {dialog.open && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
          <div className="card max-w-md w-full p-5">
            <h3
              className={`text-lg font-semibold mb-2 ${
                dialog.variant === 'error'
                  ? 'text-danger'
                  : dialog.variant === 'success'
                  ? 'text-accent-dark'
                  : 'text-navy'
              }`}
            >
              {dialog.title}
            </h3>
            <p className="text-gray-700 whitespace-pre-line">{dialog.message}</p>
            {dialog.errorCode != null && dialog.errorCode > 0 && (
              <p className="text-xs text-gray-500 mt-2">Code: {dialog.errorCode}</p>
            )}
            <div className="mt-5 flex justify-end">
              <button className="btn-primary" onClick={closeDialog}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {confirm.open && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
          <div className="card max-w-md w-full p-5">
            <h3 className="text-lg font-semibold text-navy mb-2">{confirm.title}</h3>
            <p className="text-gray-700">{confirm.message}</p>
            <div className="mt-5 flex justify-end gap-3">
              <button className="btn-outline" onClick={closeConfirm}>
                {confirm.cancelLabel}
              </button>
              <button
                className="btn-danger"
                onClick={() => {
                  confirm.onConfirm?.()
                  closeConfirm()
                }}
              >
                {confirm.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
