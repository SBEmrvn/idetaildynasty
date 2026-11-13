import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../supabase'
import { Toggle, Spinner, useToasts, Modal, describeError } from './kit'
import { PlusIcon, CheckIcon, TagIcon } from '../icons'

const EMPTY = { tag: '', title: '', description: '', code: '', expiry: '', active: true }

function PromoEditor({ initial, isNew, onCancel, onSave }) {
  const [form, setForm] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) { setError('Give the promo a title.'); return }
    setError('')
    setSaving(true)
    const ok = await onSave(form)
    if (!ok) setSaving(false)
  }

  return (
    <Modal
      title={isNew ? 'Add promo' : 'Edit promo'}
      subtitle="Active promos show on the Promos page, and the first one also on the home page."
      onClose={saving ? () => {} : onCancel}
      width={560}
      footer={
        <>
          <button type="button" className="btn-outline" onClick={onCancel} disabled={saving}>Cancel</button>
          <button type="submit" form="promo-form" className="btn-primary" disabled={saving}>
            {saving ? <><Spinner light /> Saving…</> : isNew ? <><PlusIcon /> Create promo</> : <><CheckIcon /> Save changes</>}
          </button>
        </>
      }
    >
      <form id="promo-form" onSubmit={submit} noValidate>
        <div className="form-grid">
          <div className="form-group full">
            <label htmlFor="pr-title">Title *</label>
            <input id="pr-title" value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Grand Opening Special" />
            {error && <span className="field-error">{error}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="pr-tag">Tag</label>
            <input id="pr-tag" value={form.tag} onChange={e => set('tag', e.target.value)} placeholder="e.g. Limited Time" />
          </div>
          <div className="form-group">
            <label htmlFor="pr-code">Promo code</label>
            <input id="pr-code" value={form.code} onChange={e => set('code', e.target.value.toUpperCase())} placeholder="e.g. SAVE20" />
          </div>
          <div className="form-group full">
            <label htmlFor="pr-desc">Description</label>
            <textarea id="pr-desc" value={form.description} onChange={e => set('description', e.target.value)} placeholder="What the customer gets" />
          </div>
          <div className="form-group">
            <label htmlFor="pr-exp">Expiry text</label>
            <input id="pr-exp" value={form.expiry} onChange={e => set('expiry', e.target.value)} placeholder="e.g. Ends 30 November" />
          </div>
          <div className="form-group">
            <label>Visibility</label>
            <div className="toggle-row">
              <Toggle checked={form.active} onChange={v => set('active', v)} label="Promo is active" />
              <span>{form.active ? <><b>Active</b> · shown on the website</> : <><b>Paused</b> · hidden</>}</span>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  )
}

export default function PromoManager() {
  const [promos, setPromos] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null) // { promo|null, isNew }
  const [deleting, setDeleting] = useState(null)
  const [busy, setBusy] = useState(null)
  const { push, view: toastView } = useToasts()

  const load = useCallback(async () => {
    const { data, error } = await supabase.from('promos').select('*').order('created_at', { ascending: false })
    if (error) push('error', describeError(error))
    else setPromos(data || [])
    setLoading(false)
  }, [push])

  useEffect(() => {
    load()
    const ch = supabase.channel('admin-promos')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'promos' }, load)
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [load])

  const save = async (form) => {
    const row = {
      tag: form.tag.trim(), title: form.title.trim(), description: form.description.trim(),
      code: form.code.trim(), expiry: form.expiry.trim(), active: !!form.active,
    }
    const q = editing.isNew
      ? supabase.from('promos').insert(row).select()
      : supabase.from('promos').update(row).eq('id', editing.promo.id).select()
    const { data, error } = await q
    if (error || !data?.length) { push('error', describeError(error)); return false }
    setPromos(p => editing.isNew ? [data[0], ...p] : p.map(x => x.id === data[0].id ? data[0] : x))
    push('success', editing.isNew ? `"${data[0].title}" created.` : `"${data[0].title}" saved.`)
    setEditing(null)
    return true
  }

  const setActive = async (p, active) => {
    setBusy(p.id)
    const { data, error } = await supabase.from('promos').update({ active }).eq('id', p.id).select()
    setBusy(null)
    if (error || !data?.length) { push('error', describeError(error)); return }
    setPromos(list => list.map(x => x.id === p.id ? data[0] : x))
    push('success', active ? `"${p.title}" is live.` : `"${p.title}" is paused.`)
  }

  const remove = async () => {
    const p = deleting
    setBusy(p.id)
    const { data, error } = await supabase.from('promos').delete().eq('id', p.id).select()
    setBusy(null)
    if (error || !data?.length) { push('error', describeError(error)); return }
    setPromos(list => list.filter(x => x.id !== p.id))
    setDeleting(null)
    push('success', `"${p.title}" deleted.`)
  }

  return (
    <div className="svc-admin">
      {toastView}
      <div className="svc-admin-head">
        <div>
          <h2>Promotions</h2>
          <p>Create, edit and pause deals. Changes show on the website straight away.</p>
        </div>
        <button className="btn-primary" onClick={() => setEditing({ promo: null, isNew: true })}><PlusIcon /> Add promo</button>
      </div>

      {loading ? (
        <div className="empty"><Spinner /> <span style={{ marginLeft: 8 }}>Loading promos…</span></div>
      ) : promos.length === 0 ? (
        <div className="empty">No promos yet. Add your first deal.</div>
      ) : (
        <div className="svc-admin-grid">
          {promos.map(p => (
            <div key={p.id} className={`card svc-admin-card${p.active === false ? ' inactive' : ''}`}>
              <div className="svc-admin-top">
                <span className="tile-icon peach" style={{ width: 40, height: 40, borderRadius: 12 }}><TagIcon /></span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="svc-admin-name">{p.title}</div>
                  <div className="svc-admin-tags">{p.tag && <span className="mini-chip dark">{p.tag}</span>}</div>
                </div>
                <div className="svc-admin-toggle">
                  {busy === p.id ? <Spinner /> : <Toggle checked={p.active !== false} onChange={v => setActive(p, v)} label={`${p.title} active`} />}
                </div>
              </div>
              {p.description && <p className="svc-admin-desc">{p.description}</p>}
              <div className="svc-admin-meta">
                {p.expiry && <span>⏳ {p.expiry}</span>}
                <span className={`status-chip ${p.active !== false ? 'confirmed' : 'no-show'}`}>{p.active !== false ? 'Active' : 'Paused'}</span>
              </div>
              <div className="svc-admin-foot">
                <div className="svc-admin-price" style={{ fontSize: '1.05rem', letterSpacing: '0.12em' }}>{p.code || '—'}</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn-danger-soft" onClick={() => setDeleting(p)}>Delete</button>
                  <button className="btn-primary btn-sm" onClick={() => setEditing({ promo: p, isNew: false })}>Edit</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <PromoEditor
          initial={editing.isNew ? EMPTY : { ...EMPTY, ...Object.fromEntries(Object.entries(editing.promo).map(([k, v]) => [k, v ?? ''])), active: editing.promo.active !== false }}
          isNew={editing.isNew}
          onCancel={() => setEditing(null)}
          onSave={save}
        />
      )}
      {deleting && (
        <Modal
          title="Delete promo?"
          subtitle="This can't be undone. Pause it instead if you may reuse it."
          onClose={() => setDeleting(null)}
          width={460}
          footer={
            <>
              <button className="btn-outline" onClick={() => setDeleting(null)}>Cancel</button>
              {deleting.active !== false && <button className="btn-mint" onClick={async () => { await setActive(deleting, false); setDeleting(null) }}>Pause instead</button>}
              <button className="btn-danger" onClick={remove} disabled={busy === deleting.id}>{busy === deleting.id ? <><Spinner light /> Deleting…</> : 'Delete'}</button>
            </>
          }
        >
          <p style={{ fontSize: '0.9rem', color: 'var(--muted)' }}><b style={{ color: 'var(--ink)' }}>{deleting.title}</b>{deleting.code ? ` (code ${deleting.code})` : ''} will be removed from the website.</p>
        </Modal>
      )}
    </div>
  )
}
