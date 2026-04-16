import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabase'

export default function Home() {
  const [services, setServices] = useState([])
  const [topPromo, setTopPromo] = useState(null)
  const [info, setInfo] = useState({ phone: '+250 792 575 132', email: 'idetaildynastyrw@gmail.com', location: 'Kigali, Rwanda' })

  useEffect(() => {
    const fetchServices = async () => {
      const { data } = await supabase.from('services').select('*').eq('active', true).order('created_at').limit(4)
      setServices(data || [])
    }
    const fetchPromo = async () => {
      const { data } = await supabase.from('promos').select('*').eq('active', true).order('created_at').limit(1).single()
      setTopPromo(data || null)
    }
    const fetchInfo = async () => {
      const { data } = await supabase.from('settings').select('phone,email,location').limit(1).single()
      if (data) setInfo(data)
    }
    fetchServices()
    fetchPromo()
    fetchInfo()

    const svcChannel = supabase.channel('home-services')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'services' }, fetchServices)
      .subscribe()

    const promoChannel = supabase.channel('home-promos')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'promos' }, fetchPromo)
      .subscribe()

    return () => {
      supabase.removeChannel(svcChannel)
      supabase.removeChannel(promoChannel)
    }
  }, [])

  return (
    <>
      {/* PROMO BANNER */}
      {topPromo && (
        <div className="promo-banner">
          🔥 <span>{topPromo.title}</span> -- {topPromo.description} Use code: <span>{topPromo.code}</span>
        </div>
      )}

      {/* HERO */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">Premium Car Detailing</div>
          <h1>Your Car Deserves<br /><span>Dynasty Treatment</span></h1>
          <p>Professional detailing that restores, protects and transforms your vehicle. We don't just clean cars -- we perfect them.</p>
          <div className="hero-btns">
            <Link to="/booking" className="btn-primary">Book Appointment</Link>
            <Link to="/promos" className="btn-outline">View Promos</Link>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="services">
        <div className="services-header">
          <p className="section-label">What We Offer</p>
          <h2 className="section-title">Our Services</h2>
          <p className="section-sub">Every service is performed by hand with premium products -- because your car deserves nothing less.</p>
        </div>
        <div className="services-grid">
          {services.map((s) => (
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
              {s.activities && s.activities.trim() && (
                <ul style={{ margin: '0.8rem 0 0', padding: 0, listStyle: 'none' }}>
                  {(() => {
                    const lines = s.activities.split('\n').filter(a => a.trim())
                    const items = []
                    for (let i = 0; i < lines.length; i += 2) {
                      items.push({ title: lines[i], desc: lines[i + 1] || '' })
                    }
                    return items.slice(0, 3).map((item, i) => (
                      <li key={i} style={{ padding: '0.4rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ color: 'var(--gold)', fontSize: '0.55rem', flexShrink: 0 }}>&#10022;</span>
                          <span style={{ color: 'var(--white)', fontSize: '0.8rem', fontWeight: '500' }}>{item.title}</span>
                        </div>
                      </li>
                    ))
                  })()}
                </ul>
              )}
              <p className="service-price" style={{ marginTop: '1rem' }}>RWF {Number(s.price).toLocaleString()}</p>
              {s.suv_surcharge > 0 && (
                <p style={{ color: 'var(--gray)', fontSize: '0.75rem', marginTop: '0.2rem' }}>
                  SUV / 4x4: <span style={{ color: 'var(--gold)' }}>+RWF {Number(s.suv_surcharge).toLocaleString()}</span>
                </p>
              )}
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <Link to="/services" className="btn-outline">View All Services</Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-logo">iDetail Dynasty</div>
        <p>Premium car detailing -- done right, every time.<br />
        {info.location} | {info.phone} | {info.email}</p>
        <p style={{ marginTop: '1rem', fontSize: '0.75rem' }}>© 2026 iDetail Dynasty. All rights reserved.</p>
      </footer>
    </>
  )
}
