import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../../supabase'
import { DEFAULT_CONTENT, CONTENT_SECTIONS } from '../../content'
import { Spinner, useToasts, describeError } from './kit'
import { CheckIcon, ArrowUpRight } from '../icons'

// Keep only non-empty values that differ from the default, in a stable key order.
const normalize = (obj = {}) => {
  const o = {}
  for (const k of Object.keys(DEFAULT_CONTENT)) {
    const v = typeof obj[k] === 'string' ? obj[k].trim() : ''
    if (v && v !== DEFAULT_CONTENT[k]) o[k] = v
  }
  return o
}

/**
 * Admin → Website: edit the wording shown across the public site.
 * Saves to settings.content (jsonb). Only keys that differ from the default
 * are stored, so future default changes still flow through.
 */
export default function WebsiteEditor() {
  const [rowId, setRowId] = useState(null)
  const [saved, setSaved] = useState({})        // overrides currently in the DB
  const [draft, setDraft] = useState({ ...DEFAULT_CONTENT })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [open, setOpen] = useState(CONTENT_SECTIONS[1].title)
  const { push, view: toastView } = useToasts()

  const load = useCallback(async () => {
    const { data, error } = await supabase.from('settings').select('*').limit(1)
    if (error) { push('error', describeError(error)); setLoading(false); return }
    const row = data?.[0]
    const stored = (row && row.content && typeof row.content === 'object') ? row.content : {}
    setRowId(row?.id ?? null)
    setSaved(stored)
    setDraft({ ...DEFAULT_CONTENT, ...normalize(stored) })
    setLoading(false)
  }, [push])

  useEffect(() => { load() }, [load])

  const overrides = useMemo(() => normalize(draft), [draft])
  const dirty = JSON.stringify(overrides) !== JSON.stringify(normalize(saved))

  const save = async () => {
    setSaving(true)
    const q = rowId
      ? supabase.from('settings').update({ content: overrides }).eq('id', rowId).select()
      : supabase.from('settings').insert({ content: overrides }).select()
    const { data, error } = await q
    setSaving(false)
    if (error || !data?.length) { push('error', describeError(error)); return }
    setRowId(data[0].id)
    setSaved(data[0].content || {})
    push('success', 'Website text saved. It is live now.')
  }

  const discard = () => {
    setDraft({ ...DEFAULT_CONTENT, ...normalize(saved) })
  }

  if (loading) return <div className="empty"><Spinner /> <span style={{ marginLeft: 8 }}>Loading website text…</span></div>

  const changedIn = (sec) => sec.fields.filter(([k]) => (draft[k] ?? '') !== DEFAULT_CONTENT[k]).length

  return (
    <div className="svc-admin">
      {toastView}
      <div className="svc-admin-head">
        <div>
          <h2>Website content</h2>
          <p>Edit the headings, intro text and button labels on every page. Empty fields use the original wording.</p>
        </div>
      </div>

      <div className="content-sections">
        {CONTENT_SECTIONS.map(sec => {
          const isOpen = open === sec.title
          const n = changedIn(sec)
          return (
            <div key={sec.title} className={`card content-section${isOpen ? ' open' : ''}`}>
              <button type="button" className="content-section-head" onClick={() => setOpen(isOpen ? null : sec.title)} aria-expanded={isOpen}>
                <span className="card-title" style={{ fontSize: '1rem' }}>{sec.title}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {n > 0 && <span className="count-chip">{n} customised</span>}
                  <span className="content-chevron" aria-hidden="true">⌄</span>
                </span>
              </button>
              {isOpen && (
                <div className="content-section-body">
                  <div className="form-grid">
                    {sec.fields.map(([key, label, hint, long]) => {
                      const changed = (draft[key] ?? '') !== DEFAULT_CONTENT[key]
                      return (
                        <div className={`form-group${long || sec.fields.length < 3 ? ' full' : ''}`} key={key}>
                          <label htmlFor={`ct-${key}`} style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                            <span>{label}</span>
                            {changed && (
                              <button type="button" className="link-btn" onClick={() => setDraft(d => ({ ...d, [key]: DEFAULT_CONTENT[key] }))}>Reset</button>
                            )}
                          </label>
                          {long ? (
                            <textarea id={`ct-${key}`} rows={3} value={draft[key] ?? ''} placeholder={DEFAULT_CONTENT[key]} onChange={e => setDraft(d => ({ ...d, [key]: e.target.value }))} />
                          ) : (
                            <input id={`ct-${key}`} value={draft[key] ?? ''} placeholder={DEFAULT_CONTENT[key]} onChange={e => setDraft(d => ({ ...d, [key]: e.target.value }))} />
                          )}
                          {hint && <span className="field-hint">{hint}</span>}
                        </div>
                      )
                    })}
                  </div>
                  {sec.title === 'Home page banner' && (
                    <div className="banner" style={{ marginTop: 16, padding: '22px 24px' }}>
                      <span className="banner-eyebrow">{draft.home_eyebrow || DEFAULT_CONTENT.home_eyebrow}</span>
                      <h2 style={{ fontSize: '1.5rem', lineHeight: 1.15, marginBottom: 8 }}>
                        {draft.home_title || DEFAULT_CONTENT.home_title} <span className="accent">{draft.home_title_accent || DEFAULT_CONTENT.home_title_accent}</span> {draft.home_title_end || DEFAULT_CONTENT.home_title_end}
                      </h2>
                      <p style={{ fontSize: '0.85rem' }}>{draft.home_subtitle || DEFAULT_CONTENT.home_subtitle}</p>
                    </div>
                  )}
                  <a href={sec.page} target="_blank" rel="noreferrer" className="link-btn" style={{ marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    Open this page <ArrowUpRight width={13} height={13} />
                  </a>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className={`save-bar${dirty ? ' show' : ''}`} aria-hidden={!dirty}>
        <span>You have unsaved changes</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-outline btn-sm" onClick={discard} disabled={saving}>Discard</button>
          <button className="btn-primary btn-sm" onClick={save} disabled={saving}>
            {saving ? <><Spinner light /> Saving…</> : <><CheckIcon /> Save &amp; publish</>}
          </button>
        </div>
      </div>
    </div>
  )
}
