import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabase'

export default function Reviews({ user }) {
  const [reviews, setReviews] = useState([])
  const [form, setForm] = useState({ customer_name: user?.name || '', service: '', rating: 5, comment: '' })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState({ phone: '+000 000 0000', email: 'hello@idetaildynasty.com', location: 'Kigali, Rwanda' })
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('reviews').select('*').order('created_at', { ascending: false })
      setReviews(data || [])
    }
    fetch()
    const fetchInfo = async () => {
      const { data } = await supabase.from('settings').select('phone,email,location').limit(1).single()
      if (data) setInfo(data)
    }
    fetchInfo()
    const channel = supabase.channel('reviews-public')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reviews' }, fetch)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.customer_name || !form.comment) { setError('Please fill in your name and review.'); return }
    setLoading(true)
    const { error: err } = await supabase.from('reviews').insert({ ...form, rating: parseInt(form.rating) })
    if (err) { setError('Something went wrong. Please try again.'); setLoading(false); return }
    setSubmitted(true)
    setLoading(false)
  }

  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1) : null
  const filteredReviews = filter === 'all' ? reviews : reviews.filter(r => r.rating === parseInt(filter))

  return (
    <>
      {/* HERO */}
      <section style={{ paddingTop: '8rem', paddingBottom: '4rem', textAlign: 'center', background: 'linear-gradient(135deg, #0A0A0A 0%, #1a1200 50%, #0A0A0A 100%)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(201,168,76,0.08) 0%, transparent 70%)' }} />
        <div style={{ position: 'relative', zIndex: 1, padding: '0 2rem' }}>
          <p className="section-label">What Clients Say</p>
          <h1 className="section-title">Reviews</h1>
          {avgRating && (
            <div style={{ marginTop: '1rem' }}>
              <span style={{ color: '#FF9800', fontSize: '1.5rem' }}>{'★'.repeat(Math.round(avgRating))}{'☆'.repeat(5 - Math.round(avgRating))}</span>
              <p style={{ color: 'var(--gold)', fontSize: '1.1rem', marginTop: '0.3rem' }}>{avgRating} / 5 &nbsp;·&nbsp; {reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
            </div>
          )}
        </div>
      </section>

      <section style={{ background: 'var(--black)', padding: '4rem 2rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>

          {/* LEAVE A REVIEW */}
          <div style={{ background: 'var(--dark)', border: '1px solid rgba(201,168,76,0.2)', padding: '2rem', marginBottom: '3rem' }}>
            <p className="section-label">Share Your Experience</p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', marginBottom: '1.5rem' }}>Leave a Review</h2>
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🙏</div>
                <p style={{ color: 'var(--gold)', fontSize: '1.1rem' }}>Thank you for your review!</p>
                <p style={{ color: 'var(--gray)', marginTop: '0.5rem' }}>It means a lot to us.</p>
              </div>
            ) : (
              <form onSubmit={submit}>
                {error && <div className="error-msg" style={{ marginBottom: '1rem' }}>{error}</div>}
                <div className="form-grid">
                  <div className="form-group">
                    <label>Your Name *</label>
                    <input value={form.customer_name} onChange={e => setForm({ ...form, customer_name: e.target.value })} placeholder="John Doe" />
                  </div>
                  <div className="form-group">
                    <label>Service Received</label>
                    <input value={form.service} onChange={e => setForm({ ...form, service: e.target.value })} placeholder="e.g. Full Detail Package" />
                  </div>
                  <div className="form-group">
                    <label>Rating</label>
                    <select value={form.rating} onChange={e => setForm({ ...form, rating: e.target.value })}>
                      <option value={5}>⭐⭐⭐⭐⭐ — Excellent</option>
                      <option value={4}>⭐⭐⭐⭐ — Very Good</option>
                      <option value={3}>⭐⭐⭐ — Good</option>
                      <option value={2}>⭐⭐ — Fair</option>
                      <option value={1}>⭐ — Poor</option>
                    </select>
                  </div>
                  <div className="form-group full">
                    <label>Your Review *</label>
                    <textarea value={form.comment} onChange={e => setForm({ ...form, comment: e.target.value })} placeholder="Tell us about your experience..." />
                  </div>
                  <div className="form-submit">
                    <button type="submit" disabled={loading} style={{ opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
                      {loading ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>

          {/* FILTER PILLS */}
          {reviews.length > 0 && (
            <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '2rem', flexWrap: 'wrap', background: 'var(--dark)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '50px', padding: '0.4rem', width: 'fit-content' }}>
              {[['all', `All (${reviews.length})`], ['5', `5★ (${reviews.filter(r=>r.rating===5).length})`], ['4', `4★ (${reviews.filter(r=>r.rating===4).length})`], ['3', `3★ (${reviews.filter(r=>r.rating===3).length})`], ['2', `2★ (${reviews.filter(r=>r.rating<=2).length})`]].map(([key, label]) => (
                <button key={key} onClick={() => setFilter(key)} style={{
                  background: filter === key ? 'var(--gold)' : 'transparent',
                  border: 'none', color: filter === key ? 'var(--black)' : 'var(--gray)',
                  fontFamily: 'var(--font-body)', fontSize: '0.75rem',
                  letterSpacing: '1.5px', textTransform: 'uppercase',
                  cursor: 'pointer', padding: '0.5rem 1.1rem',
                  borderRadius: '50px', fontWeight: filter === key ? '500' : '300',
                  transition: 'all 0.25s', whiteSpace: 'nowrap'
                }}>{label}</button>
              ))}
            </div>
          )}

          {/* REVIEWS LIST */}
          {filteredReviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <p style={{ color: 'var(--gray)' }}>No reviews yet — be the first!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {filteredReviews.map(r => (
                <div key={r.id} style={{ background: 'var(--dark)', border: '1px solid rgba(201,168,76,0.15)', padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.8rem' }}>
                    <div>
                      <p style={{ color: 'var(--white)', fontWeight: '500' }}>{r.customer_name || 'Anonymous'}</p>
                      {r.service && <p style={{ color: 'var(--gold)', fontSize: '0.8rem' }}>{r.service}</p>}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ color: '#FF9800' }}>{'★'.repeat(r.rating || 0)}{'☆'.repeat(5 - (r.rating || 0))}</span>
                      <p style={{ color: 'var(--gray)', fontSize: '0.75rem', marginTop: '0.2rem' }}>{new Date(r.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <p style={{ color: 'var(--gray)', fontSize: '0.9rem', lineHeight: '1.6' }}>{r.comment}</p>
                  {r.admin_reply && (
                    <div style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', padding: '0.8rem 1rem', marginTop: '1rem' }}>
                      <p style={{ color: 'var(--gold)', fontSize: '0.72rem', letterSpacing: '1px', marginBottom: '0.3rem' }}>REPLY FROM IDETAIL DYNASTY</p>
                      <p style={{ color: 'var(--gray)', fontSize: '0.85rem' }}>{r.admin_reply}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section style={{ background: 'var(--dark)', padding: '4rem 2rem', textAlign: 'center', borderTop: '1px solid rgba(201,168,76,0.15)' }}>
        <p className="section-label">Ready?</p>
        <h2 className="section-title" style={{ marginBottom: '1.5rem' }}>Experience It Yourself</h2>
        <Link to="/booking" className="btn-primary">Book Now</Link>
      </section>

      <footer>
        <div className="footer-logo">iDetail Dynasty</div>
        <p>Premium car detailing — done right, every time.<br />
          📍 {info.location} &nbsp;|&nbsp; 📞 {info.phone} &nbsp;|&nbsp; ✉️ {info.email}</p>
        <p style={{ marginTop: '1rem', fontSize: '0.75rem' }}>© 2026 iDetail Dynasty. All rights reserved.</p>
      </footer>
    </>
  )
}
