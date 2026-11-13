// Shared building blocks for admin editors: modal, toggle, spinner, toasts.
import { useCallback, useEffect, useRef, useState } from 'react'
import { CheckIcon, XIcon } from '../icons'

export const PERMISSION_HINT = 'Supabase refused the change. Make sure you are logged in as the admin and that the admin security migration has been run.'

export const describeError = (error) => {
  if (!error) return PERMISSION_HINT
  if (error.code === '42501' || /row-level security|permission/i.test(error.message || '')) return PERMISSION_HINT
  if (error.code === '42703' || error.code === 'PGRST204' || /column .* does not exist|schema cache/i.test(error.message || '')) return 'The database is missing a new column. Run the latest admin migration in Supabase, then try again.'
  return error.message || 'Something went wrong.'
}

export function Toggle({ checked, onChange, disabled, label }) {
  return (
    <button
      type="button" role="switch" aria-checked={checked} aria-label={label}
      className={`toggle${checked ? ' on' : ''}`} disabled={disabled}
      onClick={() => onChange(!checked)}
    >
      <span className="toggle-knob" />
    </button>
  )
}

export function Spinner({ light }) {
  return <span className={`spinner${light ? ' light' : ''}`} aria-hidden="true" />
}

export function useToasts() {
  const [toasts, setToasts] = useState([])
  const push = useCallback((type, text) => {
    const id = Math.random().toString(36).slice(2)
    setToasts(t => [...t, { id, type, text }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), type === 'error' ? 7000 : 3500)
  }, [])
  const dismiss = (id) => setToasts(t => t.filter(x => x.id !== id))
  const view = (
    <div className="toast-stack" role="status" aria-live="polite">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>
          <span className="toast-icon">{t.type === 'error' ? <XIcon /> : <CheckIcon />}</span>
          <span style={{ flex: 1 }}>{t.text}</span>
          <button className="toast-x" onClick={() => dismiss(t.id)} aria-label="Dismiss"><XIcon /></button>
        </div>
      ))}
    </div>
  )
  return { push, view }
}

export function Modal({ title, subtitle, onClose, children, footer, width = 680 }) {
  const ref = useRef(null)
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    ref.current?.querySelector('input, textarea, select, button')?.focus()
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev }
  }, [onClose])
  return (
    <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal" style={{ maxWidth: width }} role="dialog" aria-modal="true" aria-label={title} ref={ref}>
        <div className="modal-head">
          <div>
            <h3>{title}</h3>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close"><XIcon /></button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  )
}
