import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '../../supabase'
import {
  PlusIcon, ClockIcon, TagIcon, CheckIcon, XIcon, SparkleIcon, CarIcon, DropIcon, ShieldIcon, TrendIcon,
} from '../icons'

/* ───────────────────────── helpers ───────────────────────── */

const formatRWF = (n) => `RWF ${Math.round(Number(n) || 0).toLocaleString('en-US')}`

// `activities` is stored as alternating lines: title, description, title, description…
// (that is how the public Services page reads it).
const parseFeatures = (text = '') => {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  const out = []
  for (let i = 0; i < lines.length; i += 2) out.push({ title: lines[i], desc: lines[i + 1] || '' })
  return out
}
const serializeFeatures = (rows) =>
  rows
    .filter(r => r.title.trim())
    .map(r => `${r.title.trim()}\n${(r.desc || '').trim() || '—'}`)
    .join('\n')

const EMPTY = {
  name: '', description: '', price: '', suv_surcharge: '', duration: '',
  category: '', badge: '', active: true, features: [],
}

const toForm = (s) => ({
  name: s.name || '',
  description: s.description || '',
  price: s.price ?? '',
  suv_surcharge: s.suv_surcharge ?? '',
  duration: s.duration || '',
  category: s.category || '',
  badge: s.badge || '',
  active: s.active !== false,
  features: parseFeatures(s.activities || ''),
})

const PERMISSION_HINT = 'Supabase refused the change. Make sure you are logged in as the admin and that the services security migration has been applied.'

const describeError = (error) => {
  if (!error) return 'Something went wrong.'
  if (error.code === '42501' || /row-level security|permission/i.test(error.message || '')) return PERMISSION_HINT
  return error.message || 'Something went wrong.'
}

const ICONS = [CarIcon, DropIcon, ShieldIcon, SparkleIcon]

/* ───────────────────────── small UI pieces ───────────────────────── */

function Toggle({ checked, onChange, disabled, label }) {
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

function Spinner({ light }) {
  return <span className={`spinner${light ? ' light' : ''}`} aria-hidden="true" />
}

function useToasts() {
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

function Modal({ title, subtitle, onClose, children, footer, width = 680 }) {
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

/* ───────────────────────── editor modal ───────────────────────── */

function ServiceEditor({ initial, isNew, categories, onCancel, onSave }) {
  const [form, setForm] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const setFeature = (i, k, v) => setForm(f => ({ ...f, features: f.features.map((r, j) => j === i ? { ...r, [k]: v } : r) }))
  const addFeature = () => setForm(f => ({ ...f, features: [...f.features, { title: '', desc: '' }] }))
  const removeFeature = (i) => setForm(f => ({ ...f, features: f.features.filter((_, j) => j !== i) }))
  const moveFeature = (i, d) => setForm(f => {
    const rows = [...f.features]; const j = i + d
    if (j < 0 || j >= rows.length) return f
    ;[rows[i], rows[j]] = [rows[j], rows[i]]
    return { ...f, features: rows }
  })

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Give the service a name.'
    const p = Number(form.price)
    if (form.price === '' || !Number.isFinite(p) || p < 0) e.price = 'Enter a price of 0 or more.'
    if (form.suv_surcharge !== '' && (!Number.isFinite(Number(form.suv_surcharge)) || Number(form.suv_surcharge) < 0)) e.suv_surcharge = 'Must be 0 or more.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = async (e) => {
    e?.preventDefault()
    if (!validate()) return
    setSaving(true)
    const ok = await onSave(form)
    if (!ok) setSaving(false)
  }

  return (
    <Modal
      title={isNew ? 'Add new service' : 'Edit service'}
      subtitle={isNew ? 'It appears on the website as soon as it is saved and active.' : 'Changes go live on the website immediately after saving.'}
      onClose={saving ? () => {} : onCancel}
      footer={
        <>
          <button type="button" className="btn-outline" onClick={onCancel} disabled={saving}>Cancel</button>
          <button type="submit" form="service-form" className="btn-primary" disabled={saving}>
            {saving ? <><Spinner light /> Saving…</> : isNew ? <><PlusIcon /> Create service</> : <><CheckIcon /> Save changes</>}
          </button>
        </>
      }
    >
      <form id="service-form" onSubmit={submit} noValidate>
        <div className="form-grid">
          <div className="form-group full">
            <label htmlFor="sv-name">Service name *</label>
            <input id="sv-name" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Basic Exterior Wash" />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="sv-price">Price (RWF) *</label>
            <input id="sv-price" type="number" inputMode="numeric" min="0" step="500" value={form.price} onChange={e => set('price', e.target.value)} placeholder="35000" />
            {errors.price ? <span className="field-error">{errors.price}</span> : form.price !== '' && <span className="field-hint">Shows as <b>{formatRWF(form.price)}</b></span>}
          </div>
          <div className="form-group">
            <label htmlFor="sv-suv">SUV / 4x4 surcharge (RWF)</label>
            <input id="sv-suv" type="number" inputMode="numeric" min="0" step="500" value={form.suv_surcharge} onChange={e => set('suv_surcharge', e.target.value)} placeholder="0" />
            {errors.suv_surcharge ? <span className="field-error">{errors.suv_surcharge}</span> : <span className="field-hint">Leave empty for no surcharge</span>}
          </div>

          <div className="form-group">
            <label htmlFor="sv-duration">Estimated duration</label>
            <input id="sv-duration" value={form.duration} onChange={e => set('duration', e.target.value)} placeholder="e.g. 1.5 hours" />
          </div>
          <div className="form-group">
            <label htmlFor="sv-cat">Category</label>
            <input id="sv-cat" list="sv-cats" value={form.category} onChange={e => set('category', e.target.value)} placeholder="exterior, interior, combo…" />
            <datalist id="sv-cats">{categories.map(c => <option key={c} value={c} />)}</datalist>
          </div>

          <div className="form-group">
            <label htmlFor="sv-badge">Badge</label>
            <input id="sv-badge" value={form.badge} onChange={e => set('badge', e.target.value)} placeholder="e.g. Popular, Best Value" />
          </div>
          <div className="form-group">
            <label>Availability</label>
            <div className="toggle-row">
              <Toggle checked={form.active} onChange={v => set('active', v)} label="Service is active" />
              <span>{form.active ? <><b>Active</b> · visible and bookable</> : <><b>Inactive</b> · hidden from the website</>}</span>
            </div>
          </div>

          <div className="form-group full">
            <label htmlFor="sv-desc">Description</label>
            <textarea id="sv-desc" value={form.description} onChange={e => set('description', e.target.value)} placeholder="Short summary customers see on the service card" />
          </div>

          <div className="form-group full">
            <label>Included activities</label>
            <div className="feature-list">
              {form.features.length === 0 && <div className="field-hint" style={{ padding: '6px 2px' }}>No activities yet. Add the steps included in this package.</div>}
              {form.features.map((r, i) => (
                <div className="feature-row" key={i}>
                  <span className="feature-num">{i + 1}</span>
                  <div className="feature-inputs">
                    <input value={r.title} onChange={e => setFeature(i, 'title', e.target.value)} placeholder="Activity, e.g. Snow foam application" aria-label={`Activity ${i + 1} title`} />
                    <input value={r.desc} onChange={e => setFeature(i, 'desc', e.target.value)} placeholder="Short explanation (optional)" aria-label={`Activity ${i + 1} description`} />
                  </div>
                  <div className="feature-actions">
                    <button type="button" className="icon-btn" onClick={() => moveFeature(i, -1)} disabled={i === 0} aria-label="Move up">↑</button>
                    <button type="button" className="icon-btn" onClick={() => moveFeature(i, 1)} disabled={i === form.features.length - 1} aria-label="Move down">↓</button>
                    <button type="button" className="icon-btn danger" onClick={() => removeFeature(i)} aria-label="Remove activity"><XIcon /></button>
                  </div>
                </div>
              ))}
              <button type="button" className="btn-mint" style={{ alignSelf: 'flex-start', padding: '0.55rem 1rem', fontSize: '0.8rem' }} onClick={addFeature}><PlusIcon /> Add activity</button>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  )
}

/* ───────────────────────── delete confirm ───────────────────────── */

function DeleteDialog({ service, onCancel, onConfirm, onDeactivate }) {
  const [typed, setTyped] = useState('')
  const [busy, setBusy] = useState(false)
  const match = typed.trim().toLowerCase() === service.name.trim().toLowerCase()
  const run = async (fn) => { setBusy(true); const ok = await fn(); if (!ok) setBusy(false) }
  return (
    <Modal
      title="Delete service?"
      subtitle="This permanently removes it from the database. It cannot be undone."
      onClose={busy ? () => {} : onCancel}
      width={480}
      footer={
        <>
          <button className="btn-outline" onClick={onCancel} disabled={busy}>Cancel</button>
          {service.active && <button className="btn-mint" onClick={() => run(onDeactivate)} disabled={busy}>Deactivate instead</button>}
          <button className="btn-danger" onClick={() => run(onConfirm)} disabled={!match || busy}>
            {busy ? <><Spinner light /> Working…</> : 'Delete forever'}
          </button>
        </>
      }
    >
      <p style={{ fontSize: '0.9rem', color: 'var(--muted)', marginBottom: 14 }}>
        Past bookings keep their service name, but <b style={{ color: 'var(--ink)' }}>{service.name}</b> will disappear from the website and the booking form.
        If you only want to pause it, deactivate it instead.
      </p>
      <div className="form-group">
        <label htmlFor="del-confirm">Type <b>{service.name}</b> to confirm</label>
        <input id="del-confirm" value={typed} onChange={e => setTyped(e.target.value)} autoComplete="off" />
      </div>
    </Modal>
  )
}

/* ───────────────────────── main section ───────────────────────── */

export default function ServiceManager({ onServicesChange }) {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [catFilter, setCatFilter] = useState('all')
  const [editing, setEditing] = useState(null)      // { service|null, isNew }
  const [deleting, setDeleting] = useState(null)    // service
  const [toggling, setToggling] = useState(null)    // id
  const { push, view: toastView } = useToasts()

  const publish = useCallback((list) => {
    setServices(list)
    onServicesChange?.(list)
  }, [onServicesChange])

  const load = useCallback(async () => {
    const { data, error } = await supabase.from('services').select('*').order('created_at', { ascending: true })
    if (error) { setLoadError(describeError(error)); setLoading(false); return }
    setLoadError('')
    publish(data || [])
    setLoading(false)
  }, [publish])

  useEffect(() => {
    load()
    const channel = supabase.channel('admin-services')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'services' }, load)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [load])

  const categories = useMemo(() => [...new Set(services.map(s => s.category).filter(Boolean))].sort(), [services])

  const visible = services.filter(s => {
    if (statusFilter === 'active' && !s.active) return false
    if (statusFilter === 'inactive' && s.active) return false
    if (catFilter !== 'all' && s.category !== catFilter) return false
    const q = query.trim().toLowerCase()
    if (q && !`${s.name} ${s.description} ${s.category} ${s.badge}`.toLowerCase().includes(q)) return false
    return true
  })

  const activeCount = services.filter(s => s.active).length
  const prices = services.filter(s => s.active).map(s => Number(s.price) || 0)
  const avg = prices.length ? prices.reduce((a, b) => a + b, 0) / prices.length : 0

  const toRow = (f) => ({
    name: f.name.trim(),
    description: f.description.trim(),
    price: Math.round(Number(f.price)),
    suv_surcharge: f.suv_surcharge === '' ? 0 : Math.round(Number(f.suv_surcharge)),
    duration: f.duration.trim(),
    category: f.category.trim().toLowerCase(),
    badge: f.badge.trim(),
    active: !!f.active,
    activities: serializeFeatures(f.features),
  })

  // Every write asks for the changed row back. If RLS blocks an UPDATE/DELETE,
  // Supabase returns no error but zero rows, so we treat "no row" as a failure.
  const saveService = async (form) => {
    const row = toRow(form)
    if (editing.isNew) {
      const { data, error } = await supabase.from('services').insert(row).select().single()
      if (error || !data) { push('error', describeError(error)); return false }
      publish([...services, data])
      push('success', `${data.name} created${data.active ? ' and live on the website' : ' (inactive)'}.`)
    } else {
      const { data, error } = await supabase.from('services').update(row).eq('id', editing.service.id).select()
      if (error || !data?.length) { push('error', error ? describeError(error) : PERMISSION_HINT); return false }
      publish(services.map(s => s.id === data[0].id ? data[0] : s))
      const before = Number(editing.service.price)
      push('success', before !== data[0].price
        ? `${data[0].name} saved. Price ${formatRWF(before)} → ${formatRWF(data[0].price)}.`
        : `${data[0].name} saved.`)
    }
    setEditing(null)
    return true
  }

  const setActive = async (s, active) => {
    setToggling(s.id)
    const { data, error } = await supabase.from('services').update({ active }).eq('id', s.id).select()
    setToggling(null)
    if (error || !data?.length) { push('error', error ? describeError(error) : PERMISSION_HINT); return false }
    publish(services.map(x => x.id === s.id ? data[0] : x))
    push('success', active ? `${s.name} is live and bookable again.` : `${s.name} is hidden from the website.`)
    return true
  }

  const deleteService = async () => {
    const s = deleting
    const { data, error } = await supabase.from('services').delete().eq('id', s.id).select()
    if (error || !data?.length) { push('error', error ? describeError(error) : PERMISSION_HINT); return false }
    publish(services.filter(x => x.id !== s.id))
    setDeleting(null)
    push('success', `${s.name} deleted.`)
    return true
  }

  return (
    <div className="svc-admin">
      {toastView}

      <div className="svc-admin-head">
        <div>
          <h2>Service &amp; Pricing Management</h2>
          <p>Everything here is what customers see. Saving updates the website instantly.</p>
        </div>
        <button className="btn-primary" onClick={() => setEditing({ service: null, isNew: true })}><PlusIcon /> Add new service</button>
      </div>

      <div className="stat-row" style={{ marginBottom: 16 }}>
        <div className="card stat-card"><div className="stat-top"><span className="tile-icon"><SparkleIcon /></span>Total services</div><div className="stat-value">{services.length}</div></div>
        <div className="card stat-card"><div className="stat-top"><span className="tile-icon turq"><CheckIcon /></span>Active</div><div className="stat-value">{activeCount}</div></div>
        <div className="card stat-card"><div className="stat-top"><span className="tile-icon cream"><XIcon /></span>Inactive</div><div className="stat-value">{services.length - activeCount}</div></div>
        <div className="card stat-card"><div className="stat-top"><span className="tile-icon peach"><TrendIcon /></span>Average price</div><div className="stat-value" style={{ fontSize: '1.45rem' }}>{formatRWF(avg)}</div></div>
      </div>

      <div className="svc-toolbar">
        <input className="svc-search" type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search services…" aria-label="Search services" />
        <div className="pill-tabs" role="tablist" aria-label="Filter by status">
          {[['all', 'All'], ['active', 'Active'], ['inactive', 'Inactive']].map(([k, l]) => (
            <button key={k} role="tab" aria-selected={statusFilter === k} onClick={() => setStatusFilter(k)}
              style={{ background: statusFilter === k ? 'var(--forest)' : 'transparent', color: statusFilter === k ? '#fff' : 'var(--muted)', border: 'none', cursor: 'pointer' }}>{l}</button>
          ))}
        </div>
        {categories.length > 0 && (
          <select className="svc-select" value={catFilter} onChange={e => setCatFilter(e.target.value)} aria-label="Filter by category">
            <option value="all">All categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        )}
      </div>

      {loading ? (
        <div className="empty"><Spinner /> <span style={{ marginLeft: 8 }}>Loading services…</span></div>
      ) : loadError ? (
        <div className="empty" style={{ color: '#A8412F' }}>
          <p style={{ marginBottom: 12 }}>Couldn't load services: {loadError}</p>
          <button className="btn-outline" onClick={() => { setLoading(true); load() }}>Try again</button>
        </div>
      ) : visible.length === 0 ? (
        <div className="empty">{services.length === 0 ? 'No services yet. Add your first package.' : 'No services match these filters.'}</div>
      ) : (
        <div className="svc-admin-grid">
          {visible.map((s, i) => {
            const Icon = ICONS[i % ICONS.length]
            const features = parseFeatures(s.activities || '')
            return (
              <div key={s.id} className={`card svc-admin-card${s.active ? '' : ' inactive'}`}>
                <div className="svc-admin-top">
                  <span className="tile-icon" style={{ width: 40, height: 40, borderRadius: 12 }}><Icon /></span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="svc-admin-name">{s.name}</div>
                    <div className="svc-admin-tags">
                      {s.category && <span className="mini-chip">{s.category}</span>}
                      {s.badge && <span className="mini-chip dark">{s.badge}</span>}
                    </div>
                  </div>
                  <div className="svc-admin-toggle" title={s.active ? 'Active: click to hide from website' : 'Inactive: click to publish'}>
                    {toggling === s.id ? <Spinner /> : <Toggle checked={!!s.active} onChange={v => setActive(s, v)} label={`${s.name} active`} />}
                  </div>
                </div>

                {s.description && <p className="svc-admin-desc">{s.description}</p>}

                <div className="svc-admin-meta">
                  <span><ClockIcon /> {s.duration || 'No duration'}</span>
                  <span><TagIcon /> {features.length} {features.length === 1 ? 'activity' : 'activities'}</span>
                  <span className={`status-chip ${s.active ? 'confirmed' : 'no-show'}`}>{s.active ? 'Active' : 'Inactive'}</span>
                </div>

                <div className="svc-admin-foot">
                  <div>
                    <div className="svc-admin-price">{formatRWF(s.price)}</div>
                    {Number(s.suv_surcharge) > 0 && <div className="field-hint">SUV / 4x4 +{formatRWF(s.suv_surcharge)}</div>}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn-danger-soft" onClick={() => setDeleting(s)}>Delete</button>
                    <button className="btn-primary btn-sm" onClick={() => setEditing({ service: s, isNew: false })}>Edit</button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {editing && (
        <ServiceEditor
          initial={editing.isNew ? EMPTY : toForm(editing.service)}
          isNew={editing.isNew}
          categories={categories}
          onCancel={() => setEditing(null)}
          onSave={saveService}
        />
      )}
      {deleting && (
        <DeleteDialog
          service={deleting}
          onCancel={() => setDeleting(null)}
          onConfirm={deleteService}
          onDeactivate={async () => { const ok = await setActive(deleting, false); if (ok) setDeleting(null); return ok }}
        />
      )}
    </div>
  )
}
