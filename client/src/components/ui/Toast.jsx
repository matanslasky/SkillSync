import { createContext, useContext, useState, useCallback } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

const ToastContext = createContext(null)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, options = {}) => {
    const id = Date.now()
    const toast = {
      id,
      message,
      type: options.type || 'info',
      duration: options.duration || 3000,
      ...options
    }

    setToasts(prev => [...prev, toast])

    if (toast.duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, toast.duration)
    }

    return id
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const success = useCallback((message, options) => {
    return addToast(message, { ...options, type: 'success' })
  }, [addToast])

  const error = useCallback((message, options) => {
    return addToast(message, { ...options, type: 'error' })
  }, [addToast])

  const warning = useCallback((message, options) => {
    return addToast(message, { ...options, type: 'warning' })
  }, [addToast])

  const info = useCallback((message, options) => {
    return addToast(message, { ...options, type: 'info' })
  }, [addToast])

  return (
    <ToastContext.Provider value={{ addToast, removeToast, success, error, warning, info }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  )
}

const Toast = ({ toast, onClose }) => {
  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  }

  const styles = {
    success: 'bg-neon-green/10 border-neon-green text-neon-green shadow-neon-green',
    error: 'bg-neon-pink/10 border-neon-pink text-neon-pink shadow-neon-pink',
    warning: 'bg-neon-yellow/10 border-neon-yellow text-neon-yellow',
    info: 'bg-neon-blue/10 border-neon-blue text-neon-blue shadow-neon-blue',
  }

  const Icon = icons[toast.type]

  return (
    <div
      className={`
        pointer-events-auto
        glass-effect rounded-lg p-4 border
        flex items-start gap-3
        animate-slide-in
        ${styles[toast.type]}
      `}
    >
      <Icon size={20} className="flex-shrink-0 mt-0.5" />
      
      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className="font-semibold text-white mb-1">{toast.title}</p>
        )}
        <p className="text-sm text-gray-300">{toast.message}</p>
      </div>

      <button
        onClick={onClose}
        className="flex-shrink-0 text-gray-400 hover:text-white transition-colors duration-200"
      >
        <X size={18} />
      </button>
    </div>
  )
}

export default ToastProvider
