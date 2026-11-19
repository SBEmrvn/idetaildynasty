import { useCallback, useRef, useState } from 'react'

/**
 * Drag-to-compare before/after slider.
 * The "after" photo fills the frame; the "before" photo sits on top, clipped
 * to the left of the handle. Works with mouse, touch and keyboard (← →).
 */
export default function BeforeAfter({ before, after, alt = '', start = 50, hint = true, className = '', eager = false }) {
  const [pos, setPos] = useState(start)
  const [dragging, setDragging] = useState(false)
  const [touched, setTouched] = useState(false)
  const [loaded, setLoaded] = useState(0)
  const ref = useRef(null)
  const drag = useRef(false)

  const moveTo = useCallback((clientX) => {
    const r = ref.current?.getBoundingClientRect()
    if (!r) return
    const p = ((clientX - r.left) / r.width) * 100
    setPos(Math.max(0, Math.min(100, p)))
  }, [])

  const onPointerDown = (e) => {
    if (e.button != null && e.button !== 0) return
    e.stopPropagation()
    setTouched(true)
    drag.current = true
    setDragging(true)
    try { e.currentTarget.setPointerCapture(e.pointerId) } catch { /* older browsers */ }
    moveTo(e.clientX)
  }
  const onPointerMove = (e) => { if (drag.current) moveTo(e.clientX) }
  const endDrag = () => { drag.current = false; setDragging(false) }

  const onKey = (e) => {
    const step = e.shiftKey ? 10 : 4
    if (e.key === 'ArrowLeft') { e.preventDefault(); setTouched(true); setPos(p => Math.max(0, p - step)) }
    if (e.key === 'ArrowRight') { e.preventDefault(); setTouched(true); setPos(p => Math.min(100, p + step)) }
    if (e.key === 'Home') { e.preventDefault(); setPos(0) }
    if (e.key === 'End') { e.preventDefault(); setPos(100) }
  }

  const ready = loaded >= 2
  const loading = eager ? 'eager' : 'lazy'

  return (
    <div
      ref={ref}
      className={`ba${dragging ? ' dragging' : ''}${ready ? ' ready' : ''} ${className}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onLostPointerCapture={endDrag}
      style={{ '--pos': `${pos}%` }}
    >
      <img className="ba-img" src={after} alt={`${alt} after detailing`} loading={loading} decoding="async" draggable="false" onLoad={() => setLoaded(n => n + 1)} />
      <div className="ba-before">
        <img className="ba-img" src={before} alt={`${alt} before detailing`} loading={loading} decoding="async" draggable="false" onLoad={() => setLoaded(n => n + 1)} />
      </div>

      <span className="ba-tag before" style={{ opacity: pos < 12 ? 0 : 1 }}>Before</span>
      <span className="ba-tag after" style={{ opacity: pos > 88 ? 0 : 1 }}>After</span>

      <div className="ba-line" aria-hidden="true" />
      <button
        type="button"
        className="ba-knob"
        role="slider"
        aria-label={`Compare before and after${alt ? ` for ${alt}` : ''}`}
        aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pos)}
        aria-valuetext={`${Math.round(pos)}% before`}
        onKeyDown={onKey}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m9 6-6 6 6 6" /><path d="m15 6 6 6-6 6" />
        </svg>
      </button>

      {hint && !touched && <span className="ba-hint">Drag to compare</span>}
    </div>
  )
}
