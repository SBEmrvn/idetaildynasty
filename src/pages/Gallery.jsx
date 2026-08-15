import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabase'

export default function Gallery() {
  const [items, setItems] = useState([])
  const [filter, setFilter] = useState('all')
  const [info, setInfo] = useState({ phone: '+000 000 0000', email: 'hello@idetaildynasty.com', location: 'Kigali, Rwanda' })
  const [lightbox, setLightbox] = useState(null) // { item, imgIndex }

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') setLightbox(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('gallery').select('*').order('created_at', { ascending: false })
      setItems(data || [])
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

  const serviceNames = ['all', ...new Set(items.map(i => i.service).filter(Boolean))]
  const filtered = filter === 'all' ? items : items.filter(i => i.service === filter)

  return (
    <>
      <section style={{ paddingTop: '8rem', paddingBottom: '4rem', textAlign: 'center', background: 'linear-gradient(135deg, #0A0A0A 0%, #1a1200 50%, #0A0A0A 100%)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(201,168,76,0.08) 0%, transparent 70%)' }} />
        <div style={{ position: 'relative', zIndex: 1, padding: '0 2rem' }}>
          <p className="section-label">Our Work</p>
          <h1 className="section-title">Before &amp; After</h1>
          <p className="section-sub" style={{ margin: '0 auto 2rem' }}>Real results from real cars. See the Dynasty difference.</p>
          <Link to="/booking" className="btn-primary">Book Your Detail</Link>
        </div>
      </section>

      <section style={{ background: 'var(--black)', padding: '4rem 2rem' }}>
        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <p style={{ color: 'var(--gray)', fontSize: '1rem' }}>Gallery coming soon -- check back after our first jobs!</p>
            <Link to="/booking" className="btn-primary" style={{ display: 'inline-block', marginTop: '1.5rem' }}>Be Our First Client</Link>
          </div>
        ) : (
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

            {/* FILTER PILLS */}
            {serviceNames.length > 1 && (
              <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '2.5rem', flexWrap: 'wrap', background: 'var(--dark)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '50px', padding: '0.4rem', width: 'fit-content' }}>
                {serviceNames.map(s => (
                  <button key={s} onClick={() => setFilter(s)} style={{
                    background: filter === s ? 'var(--gold)' : 'transparent',
                    border: 'none', color: filter === s ? 'var(--black)' : 'var(--gray)',
                    fontFamily: 'var(--font-body)', fontSize: '0.75rem',
                    letterSpacing: '1.5px', textTransform: 'uppercase',
                    cursor: 'pointer', padding: '0.5rem 1.1rem',
                    borderRadius: '50px', fontWeight: filter === s ? '500' : '300',
                    transition: 'all 0.25s', whiteSpace: 'nowrap'
                  }}>{s === 'all' ? `All (${items.length})` : s}</button>
                ))}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
              {filtered.map(item => {
                const imgs = item.images?.length ? item.images : [item.before_url, item.after_url].filter(Boolean)
                return (
                  <div key={item.id} onClick={() => setLightbox({ item, imgIndex: 0, imgs })} style={{ background: 'var(--dark)', border: '1px solid rgba(201,168,76,0.15)', overflow: 'hidden', cursor: 'pointer', transition: 'border-color 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(201,168,76,0.5)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(201,168,76,0.15)'}
                  >
                    {/* COVER */}
                    <div style={{ position: 'relative', paddingBottom: '65%', overflow: 'hidden', background: 'var(--dark2)' }}>
                      {imgs[0] && <img src={imgs[0]} alt="cover" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />}
                      <span style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'rgba(0,0,0,0.7)', color: 'var(--gold)', fontSize: '0.7rem', padding: '0.2rem 0.6rem' }}>📷 {imgs.length}</span>
                    </div>
                    {/* THUMBNAIL STRIP */}
                    {imgs.length > 1 && (
                      <div style={{ display: 'flex', gap: '2px', height: '55px' }}>
                        {imgs.slice(1, 5).map((url, i) => (
                          <div key={i} style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
                            <img src={url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            {i === 3 && imgs.length > 5 && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.75rem' }}>+{imgs.length - 5}</div>}
                          </div>
                        ))}
                      </div>
                    )}
                    <div style={{ padding: '1rem 1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ color: 'var(--white)', fontWeight: '500', marginBottom: '0.2rem' }}>{item.title || 'Detail Job'}</p>
                        {item.service && <p style={{ color: 'var(--gold)', fontSize: '0.8rem' }}>{item.service}</p>}
                      </div>
                      <span style={{ color: 'var(--gold)', fontSize: '0.72rem', letterSpacing: '1px', whiteSpace: 'nowrap', marginLeft: '1rem' }}>TAP ↗</span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* LIGHTBOX */}
            {lightbox && (() => {
              const { item, imgIndex, imgs } = lightbox
              return (
                <div onClick={() => setLightbox(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.96)', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                  {/* CLOSE */}
                  <button onClick={() => setLightbox(null)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: '1px solid rgba(201,168,76,0.4)', color: 'var(--gold)', fontSize: '1.2rem', width: '2.5rem', height: '2.5rem', cursor: 'pointer', borderRadius: '50%' }}>✕</button>

                  {/* COUNTER + TITLE */}
                  <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                    <p style={{ color: 'var(--white)', fontWeight: '500', fontSize: '1.1rem' }}>{item.title || 'Detail Job'}</p>
                    {item.service && <p style={{ color: 'var(--gold)', fontSize: '0.8rem', letterSpacing: '1px' }}>{item.service}</p>}
                    <p style={{ color: 'var(--gray)', fontSize: '0.75rem', marginTop: '0.3rem' }}>{imgIndex + 1} / {imgs.length}</p>
                  </div>

                  {/* MAIN IMAGE */}
                  <div onClick={e => e.stopPropagation()} style={{ position: 'relative', maxWidth: '900px', width: '100%' }}>
                    <img src={imgs[imgIndex]} alt={`Photo ${imgIndex + 1}`} style={{ width: '100%', maxHeight: '68vh', objectFit: 'contain', display: 'block', borderRadius: '2px' }} />
                    {imgs.length > 1 && (
                      <>
                        <button onClick={e => { e.stopPropagation(); setLightbox(prev => ({ ...prev, imgIndex: (prev.imgIndex - 1 + imgs.length) % imgs.length })) }}
                          style={{ position: 'absolute', left: '-3rem', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: '1px solid rgba(201,168,76,0.4)', color: 'var(--gold)', fontSize: '1.4rem', width: '2.5rem', height: '2.5rem', cursor: 'pointer', borderRadius: '50%' }}>‹</button>
                        <button onClick={e => { e.stopPropagation(); setLightbox(prev => ({ ...prev, imgIndex: (prev.imgIndex + 1) % imgs.length })) }}
                          style={{ position: 'absolute', right: '-3rem', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: '1px solid rgba(201,168,76,0.4)', color: 'var(--gold)', fontSize: '1.4rem', width: '2.5rem', height: '2.5rem', cursor: 'pointer', borderRadius: '50%' }}>›</button>
                      </>
                    )}
                  </div>

                  {/* THUMBNAILS */}
                  {imgs.length > 1 && (
                    <div onClick={e => e.stopPropagation()} style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '900px' }}>
                      {imgs.map((url, i) => (
                        <div key={i} onClick={() => setLightbox(prev => ({ ...prev, imgIndex: i }))} style={{ width: '60px', height: '60px', border: `2px solid ${i === imgIndex ? 'var(--gold)' : 'rgba(255,255,255,0.1)'}`, overflow: 'hidden', cursor: 'pointer', flexShrink: 0, transition: 'border-color 0.2s' }}>
                          <img src={url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      ))}
                    </div>
                  )}

                  {item.caption && <p style={{ color: 'var(--gray)', fontSize: '0.82rem', marginTop: '1rem', textAlign: 'center', maxWidth: '600px', lineHeight: '1.6' }}>{item.caption}</p>}
                </div>
              )
            })()}
          </div>
        )}
      </section>

      <footer>
        <div className="footer-logo">iDetail Dynasty</div>
        <p>Premium car detailing -- done right, every time.<br />
          {info.location} | {info.phone} | {info.email}</p>
        <p style={{ marginTop: '1rem', fontSize: '0.75rem' }}>© 2026 iDetail Dynasty. All rights reserved.</p>
      </footer>
    </>
  )
}
