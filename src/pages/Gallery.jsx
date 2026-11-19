import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useContent } from '../content'
import { Link } from 'react-router-dom'
import { supabase } from '../supabase'
import BeforeAfter from '../components/BeforeAfter'
import { ImageIcon, CalendarPlusIcon, ChevronLeft, ChevronRight, XIcon, ArrowUpRight } from '../components/icons'

// Admin uploads store photos in order: first = before, second = after, rest = extra shots.
const photosOf = (item) => (item.images?.length ? item.images : [item.before_url, item.after_url]).filter(Boolean)

// "INTERIOR DETAILING " → "Interior Detailing"; mixed-case text is left as typed.
const tidy = (s = '') => {
  const t = String(s).trim().replace(/\s+/g, ' ')
  if (!t || t !== t.toUpperCase() || !/[A-Z]/.test(t)) return t
  return t.toLowerCase().replace(/\b([a-z])/g, (m) => m.toUpperCase()).replace(/\b(And|Or|Of|The|With)\b/g, (w) => w.toLowerCase()).replace(/^./, (m) => m.toUpperCase())
}

const normalize = (item) => {
  const photos = photosOf(item)
  return {
    ...item,
    photos,
    hasCompare: photos.length >= 2,
    title: tidy(item.title) || 'Detail job',
    service: tidy(item.service),
    caption: (item.caption || '').trim(),
  }
}

function Lightbox({ jobs, index, onClose, onJob }) {
  const job = jobs[index]
  const [mode, setMode] = useState(job.hasCompare ? 'compare' : 'photos')
  const [photo, setPhoto] = useState(0)
  const touchX = useRef(null)
  const panelRef = useRef(null)

  const step = useCallback((d) => {
    if (mode === 'photos' && job.photos.length > 1) setPhoto(p => (p + d + job.photos.length) % job.photos.length)
    else if (jobs.length > 1) onJob((index + d + jobs.length) % jobs.length)
  }, [mode, job, jobs.length, index, onJob])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      // In compare mode the arrows belong to the slider when it has focus
      if (e.target?.closest?.('.gl-stage .ba-knob')) return
      if (e.key === 'ArrowRight') step(1)
      if (e.key === 'ArrowLeft') step(-1)
    }
    window.addEventListener('keydown', onKey)
    panelRef.current?.querySelector('.gl-icon')?.focus({ preventScroll: true })
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev }
  }, [onClose, step])

  const label = mode === 'photos'
    ? (job.hasCompare && photo === 0 ? 'Before' : job.hasCompare && photo === 1 ? 'After' : `Photo ${photo + 1}`)
    : null

  return (
    <div className="gl-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }} role="dialog" aria-modal="true" aria-label={job.title}>
      <div className="gl-panel" ref={panelRef}>
        <header className="gl-head">
          <div style={{ minWidth: 0 }}>
            <h3>{job.title}</h3>
            <p>{job.service}{jobs.length > 1 && <span> · Job {index + 1} of {jobs.length}</span>}</p>
          </div>
          <div className="gl-head-actions">
            {job.hasCompare && job.photos.length > 0 && (
              <div className="gl-switch" role="tablist" aria-label="View mode">
                <button role="tab" aria-selected={mode === 'compare'} className={mode === 'compare' ? 'on' : ''} onClick={() => setMode('compare')}>Compare</button>
                <button role="tab" aria-selected={mode === 'photos'} className={mode === 'photos' ? 'on' : ''} onClick={() => setMode('photos')}>Photos ({job.photos.length})</button>
              </div>
            )}
            <button className="gl-icon" onClick={onClose} aria-label="Close"><XIcon /></button>
          </div>
        </header>

        <div
          className="gl-stage"
          onTouchStart={(e) => { touchX.current = e.touches[0].clientX }}
          onTouchEnd={(e) => {
            if (mode === 'compare' || touchX.current == null) return
            const dx = e.changedTouches[0].clientX - touchX.current
            if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1)
            touchX.current = null
          }}
        >
          {mode === 'compare' && job.hasCompare ? (
            <BeforeAfter key={job.id} before={job.photos[0]} after={job.photos[1]} alt={job.title} className="ba-xl" eager />
          ) : (
            <div className="gl-photo">
              <img key={job.photos[photo]} src={job.photos[photo]} alt={`${job.title} ${label || ''}`} />
              {label && <span className={`ba-tag ${photo === 0 && job.hasCompare ? 'before' : 'after'}`}>{label}</span>}
            </div>
          )}
          {(jobs.length > 1 || (mode === 'photos' && job.photos.length > 1)) && (
            <>
              <button className="gl-nav prev" onClick={() => step(-1)} aria-label={mode === 'photos' ? 'Previous photo' : 'Previous job'}><ChevronLeft /></button>
              <button className="gl-nav next" onClick={() => step(1)} aria-label={mode === 'photos' ? 'Next photo' : 'Next job'}><ChevronRight /></button>
            </>
          )}
        </div>

        <footer className="gl-foot">
          {job.photos.length > 1 && (
            <div className="gl-thumbs">
              {job.photos.map((url, i) => (
                <button key={url + i} className={`gl-thumb${mode === 'photos' && photo === i ? ' on' : ''}`} onClick={() => { setMode('photos'); setPhoto(i) }} aria-label={`Show photo ${i + 1}`}>
                  <img src={url} alt="" loading="lazy" />
                  {job.hasCompare && i < 2 && <span>{i === 0 ? 'Before' : 'After'}</span>}
                </button>
              ))}
            </div>
          )}
          {job.caption && <p className="gl-caption">{job.caption}</p>}
          <Link to="/booking" className="btn-peach" onClick={onClose} style={{ alignSelf: 'flex-start' }}><CalendarPlusIcon /> Book {job.service ? job.service.toLowerCase() : 'this detail'}</Link>
        </footer>
      </div>
    </div>
  )
}

function JobCard({ job, onOpen }) {
  return (
    <article className="card gl-card">
      <div className="gl-media">
        {job.hasCompare ? (
          <BeforeAfter before={job.photos[0]} after={job.photos[1]} alt={job.title} hint={false} />
        ) : job.photos[0] ? (
          <button className="gl-single" onClick={onOpen} aria-label={`Open ${job.title}`}><img src={job.photos[0]} alt={job.title} loading="lazy" decoding="async" /></button>
        ) : (
          <div className="gl-single empty"><ImageIcon /></div>
        )}
        {job.photos.length > 2 && <span className="gl-count"><ImageIcon /> {job.photos.length}</span>}
      </div>
      <div className="gl-body">
        {job.service && <span className="mini-chip">{job.service}</span>}
        <h3 className="gl-title">{job.title}</h3>
        {job.caption && <p className="gl-excerpt">{job.caption}</p>}
        <div className="gl-actions">
          <button className="btn-outline btn-sm" onClick={onOpen}>View full job <ArrowUpRight /></button>
        </div>
      </div>
    </article>
  )
}

export default function Gallery() {
  const c = useContent()
  const [raw, setRaw] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [info, setInfo] = useState({ phone: '+000 000 0000', email: 'hello@idetaildynasty.com', location: 'Kigali, Rwanda' })
  const [open, setOpen] = useState(null) // index into `filtered`

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('gallery').select('*').order('created_at', { ascending: false })
      setRaw(data || [])
      setLoading(false)
    }
    fetch()
    const fetchInfo = async () => {
      const { data } = await supabase.from('settings').select('phone,email,location').limit(1).single()
      if (data) setInfo(data)
    }
    fetchInfo()
    const channel = supabase.channel('gallery-public')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gallery' }, fetch)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  const items = useMemo(() => raw.map(normalize).filter(i => i.photos.length), [raw])
  const services = useMemo(() => {
    const m = new Map()
    items.forEach(i => { if (i.service) m.set(i.service, (m.get(i.service) || 0) + 1) })
    return [...m.entries()]
  }, [items])
  const filtered = filter === 'all' ? items : items.filter(i => i.service === filter)
  const [featured, ...rest] = filtered
  const totalPhotos = items.reduce((n, i) => n + i.photos.length, 0)

  return (
    <>
      <section className="page-hero" style={{ textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'relative', zIndex: 1, padding: '0 2rem' }}>
          <p className="section-label">{c.gallery_label}</p>
          <h1 className="section-title">{c.gallery_title}</h1>
          <p className="section-sub" style={{ margin: '0 auto 1.6rem' }}>{c.gallery_subtitle}</p>
          <Link to="/booking" className="btn-primary">{c.gallery_cta}</Link>
          {items.length > 0 && (
            <div className="gl-stats">
              <span><b>{items.length}</b> transformation{items.length === 1 ? '' : 's'}</span>
              <span><b>{totalPhotos}</b> photos</span>
              {services.length > 0 && <span><b>{services.length}</b> service{services.length === 1 ? '' : 's'}</span>}
            </div>
          )}
        </div>
      </section>

      <section className="gl-section">
        {loading ? (
          <div className="gl-grid">
            {[0, 1, 2].map(i => <div key={i} className="card gl-card skeleton"><div className="gl-media" /><div className="gl-body"><i /><i /><i /></div></div>)}
          </div>
        ) : items.length === 0 ? (
          <div className="empty" style={{ padding: '4rem 1rem' }}>
            <p style={{ marginBottom: '1.2rem' }}>Our gallery is coming soon. Check back after our first jobs!</p>
            <Link to="/booking" className="btn-primary">Be our first client</Link>
          </div>
        ) : (
          <>
            {services.length > 1 && (
              <div className="gl-filters" role="tablist" aria-label="Filter by service">
                <button role="tab" aria-selected={filter === 'all'} className={filter === 'all' ? 'on' : ''} onClick={() => setFilter('all')}>
                  All <span>{items.length}</span>
                </button>
                {services.map(([name, n]) => (
                  <button key={name} role="tab" aria-selected={filter === name} className={filter === name ? 'on' : ''} onClick={() => setFilter(name)}>
                    {name} <span>{n}</span>
                  </button>
                ))}
              </div>
            )}

            {featured && (
              <article className="card gl-feature" key={featured.id}>
                <div className="gl-feature-media">
                  {featured.hasCompare
                    ? <BeforeAfter before={featured.photos[0]} after={featured.photos[1]} alt={featured.title} eager />
                    : <button className="gl-single" onClick={() => setOpen(0)}><img src={featured.photos[0]} alt={featured.title} /></button>}
                </div>
                <div className="gl-feature-body">
                  <span className="gl-eyebrow">Featured transformation</span>
                  <h2>{featured.title}</h2>
                  {featured.service && <span className="mini-chip" style={{ alignSelf: 'flex-start' }}>{featured.service}</span>}
                  {featured.caption && <p className="gl-story">{featured.caption}</p>}
                  {featured.caption.length > 380 && (
                    <button className="link-btn" style={{ alignSelf: 'flex-start' }} onClick={() => setOpen(0)}>Read the full story</button>
                  )}
                  <div className="gl-feature-actions">
                    <Link to="/booking" className="btn-primary"><CalendarPlusIcon /> Book this service</Link>
                    <button className="btn-outline" onClick={() => setOpen(0)}>All photos ({featured.photos.length})</button>
                  </div>
                </div>
              </article>
            )}

            {rest.length > 0 && (
              <>
                <div className="gl-subhead">
                  <h3>More transformations</h3>
                  <span>{rest.length} job{rest.length === 1 ? '' : 's'}</span>
                </div>
                <div className="gl-grid">
                  {rest.map((job, i) => <JobCard key={job.id} job={job} onOpen={() => setOpen(i + 1)} />)}
                </div>
              </>
            )}
          </>
        )}
      </section>

      {open != null && filtered[open] && (
        <Lightbox key={filtered[open].id} jobs={filtered} index={open} onJob={setOpen} onClose={() => setOpen(null)} />
      )}

      <footer>
        <div className="footer-logo">{c.brand_name}</div>
        <p>{c.footer_tagline}<br />
          {info.location} | {info.phone} | {info.email}</p>
        <p style={{ marginTop: '1rem', fontSize: '0.75rem' }}>© {new Date().getFullYear()} {c.brand_name}. All rights reserved.</p>
      </footer>
    </>
  )
}
