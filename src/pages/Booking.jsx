import { useState, useEffect } from 'react'
import { useContent } from '../content'
import { Link, useSearchParams } from 'react-router-dom'
import { supabase } from '../supabase'
import { useFeatures } from '../App'
import { getErrorMessage } from '../utils/errors'

const timeSlots = [
  '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'
]

export default function Booking({ user }) {
  const c = useContent()
  const features = useFeatures()
  const [searchParams] = useSearchParams()
  const presetDate = /^\d{4}-\d{2}-\d{2}$/.test(searchParams.get('date') || '') ? searchParams.get('date') : ''
  const [services, setServices] = useState([])
  const [servicesState, setServicesState] = useState('loading')
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    service: '',
    date: presetDate,
    time: '',
    carModel: '',
    notes: ''
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetch = async () => {
      const { data, error } = await supabase.from('services').select('id, name, price, badge, suv_surcharge, duration').eq('active', true).order('created_at')
      if (error) { setServicesState('error'); return }
      setServices(data || [])
      setServicesState('ready')
    }
    fetch()

    const channel = supabase.channel('services-booking')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'services' }, fetch)
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.name || !form.email || !form.service || !form.date || !form.time) {
      setError('Please fill in all required fields.')
      return
    }

    setLoading(true)

    // Check for existing booking at same date + time
    const { data: existing } = await supabase
      .from('bookings')
      .select('id')
      .eq('date', form.date)
      .eq('time', form.time)
      .neq('status', 'cancelled')
      .limit(1)

    if (existing && existing.length > 0) {
      setError('That time slot is already booked. Please choose a different time.')
      setLoading(false)
      return
    }

    const { error: bookingError } = await supabase
      .from('bookings')
      .insert({
        user_id: user?.id || null,
        name: form.name,
        email: form.email,
        phone: form.phone,
        car_model: form.carModel,
        service: form.service,
        date: form.date,
        time: form.time,
        notes: form.notes,
        status: 'pending'
      })

    if (bookingError) {
      setError(getErrorMessage(bookingError))
      console.error(bookingError)
      setLoading(false)
      return
    }

    setLoading(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <section className="booking" style={{ minHeight: '100vh', paddingTop: '1rem' }}>
        <div className="booking-container" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>✅</div>
          <p className="section-label">Booking Confirmed</p>
          <h2 className="section-title">{c.booking_done_title}</h2>
          <p style={{ color: 'var(--gray)', marginBottom: '0.8rem' }}>
            Thank you <strong style={{ color: 'var(--gold)' }}>{form.name}</strong>!
            Your appointment has been received.
          </p>
          <p style={{ color: 'var(--gray)', marginBottom: '0.5rem' }}>
            📅 <strong style={{ color: 'var(--white)' }}>{form.date}</strong> at{' '}
            <strong style={{ color: 'var(--white)' }}>{form.time}</strong>
          </p>
          <p style={{ color: 'var(--gray)', marginBottom: '2rem' }}>
            🚗 <strong style={{ color: 'var(--white)' }}>{form.service}</strong>
          </p>
          <p style={{ color: 'var(--gray)', fontSize: '0.85rem', marginBottom: '2rem' }}>
            We'll be in touch at{' '}
            <span style={{ color: 'var(--gold)' }}>{form.email}</span>
          </p>
          <Link to="/" className="btn-primary">Back to Home</Link>
        </div>
      </section>
    )
  }

  return (
    <section className="booking" style={{ minHeight: '100vh', paddingTop: '1rem' }}>
      <div className="booking-container">
        <div className="booking-header">
          <p className="section-label">{c.booking_label}</p>
          <h2 className="section-title">{c.booking_title}</h2>
          <p className="section-sub" style={{ margin: '0 auto' }}>
            {c.booking_subtitle}
          </p>
          {!user && (
            <p style={{ color: 'var(--gray)', fontSize: '0.85rem', marginTop: '1rem' }}>
              Have an account?{' '}
              <Link to="/login" style={{ color: 'var(--gold)' }}>Login</Link>{' '}
              to auto-fill your details.
            </p>
          )}
        </div>

        {error && <div className="error-msg" style={{ marginBottom: '1.5rem' }}>{error}</div>}

        <form onSubmit={submit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Full Name *</label>
              <input name="name" value={form.name} onChange={handle} placeholder="Your full name" />
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input name="email" type="email" value={form.email} onChange={handle} placeholder="you@example.com" />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input name="phone" value={form.phone} onChange={handle} placeholder="+250 7XX XXX XXX" />
            </div>
            <div className="form-group">
              <label>Car Model</label>
              <input name="carModel" value={form.carModel} onChange={handle} placeholder="e.g. Toyota Corolla 2020" />
            </div>
            <div className="form-group full">
              <label>Select Service *</label>
              <select name="service" value={form.service} onChange={handle}>
                <option value="">{servicesState === 'loading' ? 'Loading services…' : servicesState === 'error' ? 'Could not load services, please refresh' : '— Choose a service —'}</option>
                {services.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.badge ? `★ ` : ''}{s.name} — RWF {Number(s.price).toLocaleString()}{s.suv_surcharge > 0 ? ` (+${Number(s.suv_surcharge).toLocaleString()} SUV)` : ''}{s.duration ? ` · ${s.duration}` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Preferred Date *</label>
              <input
                name="date" type="date" value={form.date} onChange={handle}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="form-group">
              <label>Preferred Time *</label>
              <select name="time" value={form.time} onChange={handle}>
                <option value="">— Choose a time —</option>
                {timeSlots.map((t, i) => <option key={i} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group full">
              <label>Additional Notes</label>
              <textarea
                name="notes" value={form.notes} onChange={handle}
                placeholder="Any special requests or details about your car..."
              />
            </div>
            {features.enable_photo_upload && (
              <div className="form-group full">
                <label>Upload Car Photo (optional)</label>
                <input
                  type="file" accept="image/*"
                  style={{ background: 'var(--dark2)', border: '1px solid rgba(31,96,79,0.16)', color: 'var(--gray)', padding: '0.7rem 1rem', width: '100%', fontFamily: 'var(--font-body)', fontSize: '0.85rem' }}
                  onChange={e => setForm({ ...form, photo: e.target.files[0] })}
                />
                <p style={{ color: 'var(--gray)', fontSize: '0.75rem', marginTop: '0.3rem' }}>Help us prepare by seeing your car's condition beforehand.</p>
              </div>
            )}
            <div className="form-submit">
              <button type="submit" disabled={loading}
                style={{ opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
                {loading ? 'Confirming Booking...' : 'Confirm Booking'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  )
}
