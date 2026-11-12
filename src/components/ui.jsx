import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from './icons'

export function Card({ as: Tag = 'div', className = '', hover, tone, children, ...rest }) {
  const cls = ['card', hover && 'hover', tone, className].filter(Boolean).join(' ')
  return <Tag className={cls} {...rest}>{children}</Tag>
}

export function CardHead({ title, chip, children }) {
  return (
    <div className="card-head">
      <h3 className="card-title">{title}{chip != null && <span className="count-chip">{chip}</span>}</h3>
      {children}
    </div>
  )
}

/** Small animated count-up for statistics. */
export function useCountUp(target, duration = 900) {
  const [v, setV] = useState(0)
  useEffect(() => {
    const n = Number(target) || 0
    if (!n) { setV(0); return }
    let raf, start
    const step = (t) => {
      if (!start) start = t
      const p = Math.min(1, (t - start) / duration)
      setV(n * (1 - Math.pow(1 - p, 3)))
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])
  return v
}

export function StatCard({ icon: Icon, tone, label, value, decimals = 0, prefix = '', suffix = '', sub }) {
  const isNum = typeof value === 'number'
  const animated = useCountUp(isNum ? value : 0)
  const shown = isNum
    ? prefix + animated.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix
    : value
  return (
    <Card hover className="stat-card">
      <div className="stat-top">
        {Icon && <span className={`tile-icon ${tone || ''}`}><Icon /></span>}
        {label}
      </div>
      <div className="stat-value">{shown}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </Card>
  )
}

const DAY = 86400000
const iso = (d) => {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
  return z.toISOString().slice(0, 10)
}

/** Week strip calendar. `marks` = { 'YYYY-MM-DD': count } shows dots under a day. */
export function WeekCalendar({ onPick, marks = {}, disablePast = true }) {
  const [offset, setOffset] = useState(0)
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const start = new Date(today.getTime() - ((today.getDay() + 6) % 7) * DAY + offset * 7 * DAY)
  const days = Array.from({ length: 7 }, (_, i) => new Date(start.getTime() + i * DAY))
  const monthLabel = days[3].toLocaleDateString(undefined, { month: 'long', year: 'numeric' })

  return (
    <div>
      <div className="card-head">
        <h3 className="card-title" style={{ fontSize: '1.25rem' }}>{monthLabel}</h3>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="icon-btn" aria-label="Previous week" disabled={offset <= 0} style={{ opacity: offset <= 0 ? 0.4 : 1 }} onClick={() => setOffset(o => Math.max(0, o - 1))}><ChevronLeft /></button>
          <button className="icon-btn" aria-label="Next week" onClick={() => setOffset(o => o + 1)}><ChevronRight /></button>
        </div>
      </div>
      <div className="week-cal">
        {days.map((d) => {
          const key = iso(d)
          const isToday = d.getTime() === today.getTime()
          const past = disablePast && d < today
          const n = Math.min(3, marks[key] || 0)
          return (
            <button
              key={key}
              className={`week-day${isToday ? ' today' : ''}`}
              disabled={past}
              onClick={() => onPick && onPick(key)}
              title={past ? undefined : `Book ${d.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' })}`}
            >
              <span className="wd">{d.toLocaleDateString(undefined, { weekday: 'short' })}</span>
              <span className="dn">{d.getDate()}</span>
              <span className="dots">{Array.from({ length: n }, (_, i) => <i key={i} />)}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

/** Vertical pill bar chart. data = [{ label, value, tip }] ; highlight index = `hi`. */
export function PillBarChart({ data, hi, height = 170 }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { const t = setTimeout(() => setMounted(true), 60); return () => clearTimeout(t) }, [])
  const max = Math.max(1, ...data.map(d => d.value))
  return (
    <div className="pill-chart" style={{ height }}>
      {data.map((d, i) => (
        <div key={d.label + i} className={`pill-col${i === hi ? ' hi' : ''}`}>
          <div className="pill-track">
            <div className="pill-fill" style={{ height: mounted ? `${Math.max(6, (d.value / max) * 100)}%` : '6%' }} />
            <span className="pill-tip">{d.tip ?? d.value}</span>
          </div>
          <span className="pill-label">{d.label}</span>
        </div>
      ))}
    </div>
  )
}

export function HBars({ rows }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { const t = setTimeout(() => setMounted(true), 60); return () => clearTimeout(t) }, [])
  const max = Math.max(1, ...rows.map(r => r.value))
  return (
    <div>
      {rows.map(r => (
        <div className="hbar" key={r.label}>
          <span>{r.label}</span>
          <div className="hbar-track"><div className="hbar-fill" style={{ width: mounted ? `${(r.value / max) * 100}%` : 0 }} /></div>
          <span style={{ textAlign: 'right', color: 'var(--ink)', fontWeight: 600 }}>{r.value}</span>
        </div>
      ))}
    </div>
  )
}

export const initials = (name = '') =>
  name.trim().split(/\s+/).slice(0, 2).map(s => s[0]?.toUpperCase() || '').join('') || '?'

export function timeAgo(dateStr) {
  const d = new Date(dateStr)
  if (isNaN(d)) return ''
  const s = (Date.now() - d.getTime()) / 1000
  if (s < 60) return 'just now'
  const m = s / 60; if (m < 60) return `${Math.floor(m)} min ago`
  const h = m / 60; if (h < 24) return `${Math.floor(h)} hour${h >= 2 ? 's' : ''} ago`
  const dd = h / 24; if (dd < 30) return `${Math.floor(dd)} day${dd >= 2 ? 's' : ''} ago`
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}
