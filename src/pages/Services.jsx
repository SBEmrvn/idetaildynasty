import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabase'
import { useFeatures } from '../App'

export default function Services() {
  const features = useFeatures()
  const [services, setServices] = useState([])
  const [calcService, setCalcService] = useState('')
  const [calcSize, setCalcSize] = useState('sedan')
  const [filter, setFilter] = useState('all')
  const [info, setInfo] = useState({ phone: '+250 792 575 132', email: 'idetaildynastyrw@gmail.com', location: 'Kigali, Rwanda' })

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('services').select('*').eq('active', true).order('created_at')
      setServices(data || [])
    }
    fetch()

    const fetchInfo = async () => {
      const { data } = await supabase.from('settings').select('phone,email,location').limit(1).single()
      if (data) setInfo(data)
    }
    fetchInfo()

    const channel = supabase.channel('services-public')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'services' }, fetch)
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  const cats = ['all', ...new Set(services.map(s => s.category).filter(Boolean))]
  const filtered = filter === 'all' ? services : services.filter(s => s.category === filter)

  return (
    <>
      {/* HERO */}
      <section className="page-hero" style={{
        textAlign: 'center',
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(31,96,79,0.064) 0%, transparent 70%)' }} />
        <div style={{ position: 'relative', zIndex: 1, padding: '0 2rem' }}>
          <p className="section-label">What We Offer</p>
          <h1 className="section-title">Our Services</h1>
          <p className="section-sub" style={{ margin: '0 auto 2rem' }}>
            Every service is performed by hand with premium products — because your car deserves nothing less.
          </p>
          <Link to="/booking" className="btn-primary">Book Any Service</Link>
        </div>
      </section>

      {/* SERVICES GRID */}
      <section className="services">
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

          {/* FILTER PILLS */}
          {cats.length > 1 && (
            <div className="pill-tabs" style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', background: 'var(--dark)', border: '1px solid rgba(31,96,79,0.12)', borderRadius: '50px', padding: '0.4rem', width: 'fit-content', margin: '0 auto 2.5rem' }}>
              {cats.map(c => (
                <button key={c} onClick={() => setFilter(c)} style={{
                  background: filter === c ? 'var(--gold)' : 'transparent',
                  border: 'none', color: filter === c ? '#fff' : 'var(--gray)',
                  fontFamily: 'var(--font-body)', fontSize: '0.75rem',
                  letterSpacing: '1.5px', textTransform: 'uppercase',
                  cursor: 'pointer', padding: '0.5rem 1.1rem',
                  borderRadius: '50px', fontWeight: filter === c ? '500' : '300',
                  transition: 'all 0.25s', whiteSpace: 'nowrap'
                }}>{c === 'all' ? 'All Services' : c}</button>
              ))}
            </div>
          )}

          <div className="services-grid">
            {filtered.map((s) => (
              <div className="service-card" key={s.id} style={{ position: 'relative', border: s.badge ? '1px solid rgba(31,96,79,0.4)' : undefined }}>

                {/* BADGE */}
                {s.badge && (
                  <span style={{
                    position: 'absolute', top: '-1px', right: '1.5rem',
                    background: 'var(--gold)', color: 'var(--black)',
                    fontSize: '0.65rem', fontWeight: '600',
                    letterSpacing: '1.5px', textTransform: 'uppercase',
                    padding: '0.25rem 0.8rem',
                  }}>{s.badge}</span>
                )}

                {/* NAME & DESC */}
                <h3 className="service-name" style={{ marginTop: s.badge ? '0.8rem' : 0 }}>{s.name}</h3>
                <p className="service-desc">{s.description}</p>

                {/* ACTIVITIES */}
                {s.activities && s.activities.trim() ? (
                  <ul style={{ margin: '1rem 0 0', padding: 0, listStyle: 'none', maxHeight: '220px', overflowY: 'auto' }}>
                    {(() => {
                      const lines = s.activities.split('\n').filter(a => a.trim())
                      const items = []
                      for (let i = 0; i < lines.length; i += 2) {
                        items.push({ title: lines[i], desc: lines[i + 1] || '' })
                      }
                      return items.map((item, i) => (
                        <li key={i} style={{ padding: '0.5rem 0', borderBottom: '1px solid rgba(16,52,43,0.05)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ color: 'var(--gold)', fontSize: '0.55rem', flexShrink: 0 }}>&#10022;</span>
                            <span style={{ color: 'var(--white)', fontSize: '0.82rem', fontWeight: '500' }}>{item.title}</span>
                          </div>
                          {item.desc && <p style={{ color: 'var(--gray)', fontSize: '0.78rem', lineHeight: '1.5', marginTop: '0.2rem', paddingLeft: '1rem' }}>{item.desc}</p>}
                        </li>
                      ))
                    })()}
                  </ul>
                ) : (
                  <p style={{ color: 'rgba(31,96,79,0.24)', fontSize: '0.78rem', marginTop: '0.8rem', fontStyle: 'italic' }}>Activities coming soon</p>
                )}

                {/* SPACER */}
                <div style={{ flexGrow: 1 }} />

                {/* PRICE */}
                <div style={{ marginTop: '1.4rem', background: 'linear-gradient(140deg, var(--mint-soft), var(--turquoise))', borderRadius: 'var(--r-md)', padding: '1rem 1.1rem', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>Price</span>
                    <span style={{ font: '700 1.6rem/1 var(--font-display)', letterSpacing: '-0.04em', color: 'var(--forest)' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, marginRight: '0.3rem', letterSpacing: 0 }}>RWF</span>{Number(s.price).toLocaleString()}
                    </span>
                  </div>
                  {s.suv_surcharge > 0 && (
                    <span style={{ fontSize: '0.72rem', color: 'var(--forest-3)', background: '#fff', padding: '0.35rem 0.6rem', borderRadius: '99px', fontWeight: 600 }}>
                      SUV / 4x4 +{Number(s.suv_surcharge).toLocaleString()}
                    </span>
                  )}
                </div>

                <div style={{ flexGrow: 1 }} />

                {/* BOOK BUTTON */}
                <Link to="/booking" className="btn-primary" style={{ marginTop: '1rem', width: '100%' }}>
                  Book this service
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICE CALCULATOR */}
      {features.enable_price_calculator && (
        <section style={{ background: 'var(--dark)', padding: '4rem 2rem', borderTop: '1px solid rgba(31,96,79,0.08)' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
            <p className="section-label">Estimate Your Cost</p>
            <h2 className="section-title" style={{ marginBottom: '2rem' }}>Price Calculator</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Select Service</label>
                <select value={calcService} onChange={e => setCalcService(e.target.value)}>
                  <option value="">-- Choose a service --</option>
                  {services.map(s => <option key={s.id} value={s.price}>{s.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Vehicle Size</label>
                <select value={calcSize} onChange={e => setCalcSize(e.target.value)}>
                  <option value="sedan">Sedan / Hatchback</option>
                  <option value="suv">SUV / Crossover</option>
                  <option value="truck">Truck / Van</option>
                </select>
              </div>
            </div>
            {calcService && (
              <div style={{ marginTop: '2rem', background: 'var(--dark2)', border: '1px solid rgba(31,96,79,0.24)', padding: '2rem' }}>
                <p style={{ color: 'var(--gray)', fontSize: '0.8rem', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Estimated Price</p>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', color: 'var(--gold)' }}>
                  RWF {Math.round(parseFloat(calcService) * (calcSize === 'suv' ? 1.2 : calcSize === 'truck' ? 1.4 : 1)).toLocaleString()}
                </p>
                <p style={{ color: 'var(--gray)', fontSize: '0.8rem', marginTop: '0.5rem' }}>Final price confirmed at booking</p>
                <Link to="/booking" className="btn-primary" style={{ display: 'inline-block', marginTop: '1.5rem' }}>Book Now</Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer>
        <div className="footer-logo">iDetail Dynasty</div>
        <p>Premium car detailing — done right, every time.<br />
          {info.location} | {info.phone} | {info.email}
        </p>
        <p style={{ marginTop: '1rem', fontSize: '0.75rem' }}>© 2026 iDetail Dynasty. All rights reserved.</p>
      </footer>
    </>
  )
}
