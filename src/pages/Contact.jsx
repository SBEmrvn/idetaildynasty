import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabase'


export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState({
    phone: '+250 000 000 000',
    whatsapp: '+250000000000',
    email: 'hello@idetaildynasty.com',
    location: 'Kigali, Rwanda',
    business_hours: ''
  })

  useEffect(() => {
    const fetchInfo = async () => {
      const { data } = await supabase.from('settings').select('*').limit(1).single()
      if (data) setInfo(data)
    }
    fetchInfo()
    const channel = supabase.channel('settings-contact')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, fetchInfo)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.name || !form.email || !form.message) {
      setError('Please fill in all required fields.')
      return
    }
    setLoading(true)
    const { error: err } = await supabase.from('contact_messages').insert({ ...form })
    if (err) { setError('Something went wrong. Please try again.'); setLoading(false); return }
    setSent(true)
    setLoading(false)
  }

  const defaultHours = [
    ['Monday – Friday', '8:00 AM – 6:00 PM'],
    ['Saturday', '8:00 AM – 4:00 PM'],
    ['Sunday', 'Closed'],
  ]

  return (
    <>
      {/* HERO */}
      <section style={{ paddingTop: '8rem', paddingBottom: '4rem', textAlign: 'center', background: 'linear-gradient(135deg, #0A0A0A 0%, #1a1200 50%, #0A0A0A 100%)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(201,168,76,0.08) 0%, transparent 70%)' }} />
        <div style={{ position: 'relative', zIndex: 1, padding: '0 2rem' }}>
          <p className="section-label">Get In Touch</p>
          <h1 className="section-title">Contact Us</h1>
          <p className="section-sub" style={{ margin: '0 auto' }}>We're here to help. Reach out any way you prefer.</p>
        </div>
      </section>

      <section style={{ background: 'var(--black)', padding: '4rem 2rem' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>

          {/* LEFT — CONTACT INFO */}
          <div>
            <p className="section-label">Reach Us</p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: '2rem' }}>Let's Talk</h2>

            {/* WHATSAPP */}
            <a
              href={`https://wa.me/${(info.whatsapp || '').replace(/\D/g, '')}?text=Hi%20iDetail%20Dynasty%2C%20I%27d%20like%20to%20book%20a%20detailing%20service.`}
              target="_blank" rel="noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--dark)', border: '1px solid rgba(37,211,102,0.3)', padding: '1.2rem 1.5rem', marginBottom: '1rem', textDecoration: 'none', transition: 'border-color 0.3s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#25D366'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(37,211,102,0.3)'}
            >
              <span style={{ fontSize: '1.8rem' }}>💬</span>
              <div>
                <p style={{ color: '#25D366', fontSize: '0.75rem', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '0.2rem' }}>WhatsApp</p>
                <p style={{ color: 'var(--white)', fontSize: '0.95rem' }}>{info.whatsapp || info.phone}</p>
                <p style={{ color: 'var(--gray)', fontSize: '0.78rem' }}>Fastest response — tap to chat</p>
              </div>
            </a>

            {/* PHONE */}
            <a
              href={`tel:${(info.phone || '').replace(/\s/g, '')}`}
              style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--dark)', border: '1px solid rgba(201,168,76,0.2)', padding: '1.2rem 1.5rem', marginBottom: '1rem', textDecoration: 'none', transition: 'border-color 0.3s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--gold)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(201,168,76,0.2)'}
            >
              <span style={{ fontSize: '1.8rem' }}>📞</span>
              <div>
                <p style={{ color: 'var(--gold)', fontSize: '0.75rem', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Call Us</p>
                <p style={{ color: 'var(--white)', fontSize: '0.95rem' }}>{info.phone}</p>
                <p style={{ color: 'var(--gray)', fontSize: '0.78rem' }}>Mon–Sat, 8am–6pm</p>
              </div>
            </a>

            {/* EMAIL */}
            <a
              href={`mailto:${info.email}`}
              style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--dark)', border: '1px solid rgba(201,168,76,0.2)', padding: '1.2rem 1.5rem', marginBottom: '1rem', textDecoration: 'none', transition: 'border-color 0.3s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--gold)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(201,168,76,0.2)'}
            >
              <span style={{ fontSize: '1.8rem' }}>✉️</span>
              <div>
                <p style={{ color: 'var(--gold)', fontSize: '0.75rem', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Email</p>
                <p style={{ color: 'var(--white)', fontSize: '0.95rem' }}>{info.email}</p>
                <p style={{ color: 'var(--gray)', fontSize: '0.78rem' }}>We reply within 24 hours</p>
              </div>
            </a>

            {/* LOCATION */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--dark)', border: '1px solid rgba(201,168,76,0.2)', padding: '1.2rem 1.5rem', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '1.8rem' }}>📍</span>
              <div>
                <p style={{ color: 'var(--gold)', fontSize: '0.75rem', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Location</p>
                <p style={{ color: 'var(--white)', fontSize: '0.95rem' }}>{info.location}</p>
                <p style={{ color: 'var(--gray)', fontSize: '0.78rem' }}>Mobile detailing available too</p>
              </div>
            </div>

            {/* BUSINESS HOURS */}
            <div style={{ background: 'var(--dark)', border: '1px solid rgba(201,168,76,0.2)', padding: '1.5rem' }}>
              <p style={{ color: 'var(--gold)', fontSize: '0.75rem', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '1rem' }}>Business Hours</p>
              {(info.business_hours
                ? info.business_hours.split('\n').map(line => {
                    const idx = line.indexOf(':')
                    return idx === -1 ? [line, ''] : [line.slice(0, idx).trim(), line.slice(idx + 1).trim()]
                  })
                : defaultHours
              ).map(([day, hours], i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ color: 'var(--gray)', fontSize: '0.85rem' }}>{day}</span>
                  <span style={{ color: hours === 'Closed' ? '#f44336' : 'var(--white)', fontSize: '0.85rem' }}>{hours}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — CONTACT FORM */}
          <div>
            <p className="section-label">Send a Message</p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: '2rem' }}>Quick Enquiry</h2>
            {sent ? (
              <div style={{ background: 'var(--dark)', border: '1px solid rgba(201,168,76,0.2)', padding: '3rem', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                <p style={{ color: 'var(--gold)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>Message Sent!</p>
                <p style={{ color: 'var(--gray)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>We'll get back to you within 24 hours.</p>
                <Link to="/booking" className="btn-primary">Book an Appointment</Link>
              </div>
            ) : (
              <form onSubmit={submit}>
                {error && <div className="error-msg" style={{ marginBottom: '1rem' }}>{error}</div>}
                <div className="form-grid">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="John Doe" />
                  </div>
                  <div className="form-group">
                    <label>Email *</label>
                    <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="john@email.com" />
                  </div>
                  <div className="form-group full">
                    <label>Phone</label>
                    <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+250 000 000 000" />
                  </div>
                  <div className="form-group full">
                    <label>Message *</label>
                    <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="How can we help you?" style={{ minHeight: '140px' }} />
                  </div>
                  <div className="form-submit">
                    <button type="submit" disabled={loading} style={{ opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
                      {loading ? 'Sending...' : 'Send Message'}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      <footer>
        <div className="footer-logo">iDetail Dynasty</div>
        <p>Premium car detailing — done right, every time.<br />
          📍 {info.location} &nbsp;|&nbsp; 📞 {info.phone} &nbsp;|&nbsp; ✉️ {info.email}
        </p>
        <p style={{ marginTop: '1rem', fontSize: '0.75rem' }}>© 2026 iDetail Dynasty. All rights reserved.</p>
      </footer>
    </>
  )
}
