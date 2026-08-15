import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabase'

export default function Gallery() {
  const [items, setItems] = useState([])
  const [filter, setFilter] = useState('all')
  const [info, setInfo] = useState({ phone: '+000 000 0000', email: 'hello@idetaildynasty.com', location: 'Kigali, Rwanda' })

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

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }} className="gallery-grid">
              {filtered.map(item => (
                <div key={item.id} style={{ background: 'var(--dark)', border: '1px solid rgba(201,168,76,0.15)', overflow: 'hidden' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px' }}>
                    {[{ url: item.before_url, label: 'BEFORE', labelStyle: { background: 'rgba(0,0,0,0.7)', color: 'var(--gray)' } },
                      { url: item.after_url,  label: 'AFTER',  labelStyle: { background: 'rgba(201,168,76,0.85)', color: 'var(--black)' } }
                    ].map(({ url, label, labelStyle }) => (
                      <div key={label} style={{ position: 'relative', paddingBottom: '100%', background: 'var(--dark2)', overflow: 'hidden' }}>
                        {url
                          ? <img src={url} alt={label} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }} />
                          : <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ color: 'rgba(255,255,255,0.15)', fontSize: '0.75rem', letterSpacing: '2px' }}>NO IMAGE</span></div>
                        }
                        <span style={{ position: 'absolute', bottom: '0.5rem', left: '0.5rem', ...labelStyle, fontSize: '0.65rem', fontWeight: '600', padding: '0.2rem 0.6rem', letterSpacing: '1.5px' }}>{label}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ padding: '1rem 1.2rem' }}>
                    <p style={{ color: 'var(--white)', fontWeight: '500', marginBottom: '0.2rem' }}>{item.title || 'Detail Job'}</p>
                    {item.service && <p style={{ color: 'var(--gold)', fontSize: '0.8rem' }}>{item.service}</p>}
                    {item.caption && <p style={{ color: 'var(--gray)', fontSize: '0.82rem', marginTop: '0.3rem' }}>{item.caption}</p>}
                  </div>
                </div>
              ))}
            </div>
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
