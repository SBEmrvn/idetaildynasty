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
      <section style={{
        paddingTop: '8rem', paddingBottom: '4rem',
        textAlign: 'center',
        background: 'linear-gradient(135deg, #0A0A0A 0%, #1a1200 50%, #0A0A0A 100%)',
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(201,168,76,0.08) 0%, transparent 70%)' }} />
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
            <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '2.5rem', flexWrap: 'wrap', background: 'var(--dark)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '50px', padding: '0.4rem', width: 'fit-content', margin: '0 auto 2.5rem' }}>
              {cats.map(c => (
                <button key={c} onClick={() => setFilter(c)} style={{
                  background: filter === c ? 'var(--gold)' : 'transparent',
                  border: 'none', color: filter === c ? 'var(--black)' : 'var(--gray)',
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
              <div className="service-card" key={s.id} style={{ position: 'relative', border: s.badge ? '1px solid rgba(201,168,76,0.5)' : undefined }}>
                {s.badge && (
                  <span style={{
                    position: 'absolute', top: '-1px', right: '1.5rem',
                    background: 'var(--gold)', color: 'var(--black)',
                    fontSize: '0.65rem', fontWeight: '600',
                    letterSpacing: '1.5px', textTransform: 'uppercase',
                    padding: '0.25rem 0.8rem',
                  }}>{s.badge}</span>
                )}
                <h3 className="service-name" style={{ marginTop: s.badge ? '0.8rem' : 0 }}>{s.name}</h3>
                <p className="service-desc">{s.description}</p>
                {s.activities && s.activities.trim() ? (
                  <ul style={{ margin: '1rem 0 0', padding: 0, listStyle: 'none', maxHeight: '220px', overflowY: 'auto' }}>
                    {(() => {
                      const lines = s.activities.split('\n').filter(a => a.trim())
                      const items = []
                      for (let i = 0; i < lines.length; i += 2) {
                        items.push({ title: lines[i], desc: lines[i + 1] || '' })
                      }
                      return items.map((item, i) => (
                        <li key={i} style={{ padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
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
                  <p style={{ color: 'rgba(201,168,76,0.3)', fontSize: '0.78rem', marginTop: '0.8rem', fontStyle: 'italic' }}>Activities coming soon</p>
                )}
                <div style={{ flexGrow: 1 }} />
                <div style={{ textAlign: 'center', margin: '1.8rem 0 0', position: 'relative' }}>
                  {/* ROPE */}
                  <div style={{
                    width: '2px',
                    height: '28px',
                    background: 'repeating-linear-gradient(180deg, #a07830 0px, #c9a84c 3px, #a07830 6px)',
                    margin: '0 auto',
                    borderRadius: '1px',
                  }} />
                  {/* SERRATED CIRCLE TAG */}
                  <div style={{
                    position: 'relative',
                    width: 'clamp(180px, 40vw, 280px)',
                    height: 'clamp(180px, 40vw, 280px)',
                    margin: '0 auto',
                    animation: 'tagSwing 3s ease-in-out infinite',
                    transformOrigin: 'top center',
                  }}>
                    <svg viewBox="0 0 110 110" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
                      <defs>
                        <radialGradient id={`tg${s.id}`} cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="#2a1f00" />
                          <stop offset="100%" stopColor="#1a1200" />
                        </radialGradient>
                      </defs>
                      <path
                        d="M55,4 L59,12 L68,8 L69,17 L78,16 L76,25 L85,27 L80,35 L88,40 L81,46 L87,53 L79,57 L82,65 L74,66 L74,75 L66,73 L63,82 L55,78 L47,82 L44,73 L36,75 L36,66 L28,65 L31,57 L23,53 L29,46 L22,40 L30,35 L25,27 L34,25 L32,16 L41,17 L42,8 L51,12 Z"
                        fill={`url(#tg${s.id})`}
                        stroke="#C9A84C"
                        strokeWidth="1.5"
                      />
                      <circle cx="55" cy="14" r="3" fill="none" stroke="#C9A84C" strokeWidth="1.5" />
                    </svg>
                    <div style={{
                      position: 'absolute', inset: 0,
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                      paddingBottom: '45px',
                      gap: '4px',
                    }}>
                      <span style={{ color: '#E8C96D', fontSize: 'clamp(0.7rem, 1.5vw, 1.1rem)', letterSpacing: '3px', textTransform: 'uppercase', fontFamily: 'var(--font-body)', fontWeight: '500' }}>RWF</span>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.4rem, 3.5vw, 3rem)', color: '#FFD966', fontWeight: '700', lineHeight: 1 }}>
                        {Number(s.price).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  {s.suv_surcharge > 0 && (
                    <p style={{ color: '#aaa', fontSize: '0.73rem', marginTop: '0.6rem' }}>
                      SUV / 4x4 <span style={{ color: '#E8C96D' }}>+RWF {Number(s.suv_surcharge).toLocaleString()}</span>
                    </p>
                  )}
                </div>
                <div style={{ flexGrow: 1 }} />
                <Link to="/booking" style={{
                  display: 'block', textAlign: 'center',
                  marginTop: '1.5rem', padding: '0.65rem 1.5rem',
                  background: 'transparent',
                  border: '1px solid var(--gold)', color: 'var(--gold)',
                  fontSize: '0.78rem', letterSpacing: '1.5px',
                  textTransform: 'uppercase', textDecoration: 'none',
                  borderRadius: '50px', transition: 'all 0.25s',
                  fontFamily: 'var(--font-body)', fontWeight: '500'
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--gold)'; e.currentTarget.style.color = 'var(--black)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--gold)' }}
                >
                  Book This
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICE CALCULATOR */}
      {features.enable_price_calculator && (
        <section style={{ background: 'var(--dark)', padding: '4rem 2rem', borderTop: '1px solid rgba(201,168,76,0.1)' }}>
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
              <div style={{ marginTop: '2rem', background: 'var(--dark2)', border: '1px solid rgba(201,168,76,0.3)', padding: '2rem' }}>
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
        <p>Premium car detailing -- done right, every time.<br />
          {info.location} | {info.phone} | {info.email}
        </p>
        <p style={{ marginTop: '1rem', fontSize: '0.75rem' }}>© 2026 iDetail Dynasty. All rights reserved.</p>
      </footer>
    </>
  )
}
