import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

export default function Dashboard({ user }) {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(null)
  const [tab, setTab] = useState('upcoming')
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    const fetch = async () => {
      const { data } = await supabase
        .from('bookings')
        .select('*')
        .eq('email', user.email)
        .order('created_at', { ascending: false })
      setBookings(data || [])
      setLoading(false)
    }
    fetch()
  }, [user, navigate])

  const cancelBooking = async (id) => {
    if (!window.confirm('Cancel this booking?')) return
    setCancelling(id)
    await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', id)
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b))
    setCancelling(null)
  }

  const statusColor = (s) => {
    if (s === 'confirmed') return '#4CAF50'
    if (s === 'completed') return '#2196F3'
    if (s === 'cancelled') return '#f44336'
    if (s === 'no-show') return '#FF9800'
    return 'var(--gold)'
  }

  const upcoming = bookings.filter(b => b.status === 'pending' || b.status === 'confirmed')
  const past = bookings.filter(b => b.status === 'completed' || b.status === 'cancelled' || b.status === 'no-show')

  if (!user) return null

  return (
    <section style={{ minHeight: '100vh', background: 'var(--black)', paddingTop: '7rem', padding: '7rem 2rem 4rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>

        {/* HEADER */}
        <div style={{ marginBottom: '2.5rem' }}>
          <p className="section-label">My Account</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', marginBottom: '0.5rem' }}>
            Welcome, <span style={{ color: 'var(--gold)' }}>{user.name}</span>
          </h1>
          <p style={{ color: 'var(--gray)' }}>{user.email}</p>
        </div>

        {/* QUICK ACTIONS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
          {[
            { label: 'Total Bookings', value: bookings.length, icon: '📅', color: 'var(--gold)' },
            { label: 'Upcoming', value: upcoming.length, icon: '⏳', color: '#4CAF50' },
            { label: 'Completed', value: bookings.filter(b => b.status === 'completed').length, icon: '✅', color: '#2196F3' },
          ].map((s, i) => (
            <div key={i} style={{ background: 'var(--dark)', border: `1px solid ${s.color}30`, padding: '1.2rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>{s.icon}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: s.color }}>{s.value}</div>
              <div style={{ color: 'var(--gray)', fontSize: '0.75rem', letterSpacing: '1px', textTransform: 'uppercase' }}>{s.label}</div>
            </div>
          ))}
        </div>

        <Link to="/booking" className="btn-primary" style={{ display: 'inline-block', marginBottom: '2.5rem' }}>+ Book New Appointment</Link>

        {/* PILL TABS */}
        {!loading && bookings.length > 0 && (
          <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '2rem', background: 'var(--dark)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '50px', padding: '0.4rem', width: 'fit-content' }}>
            {[['upcoming', `Upcoming (${upcoming.length})`], ['past', `Past (${past.length})`], ['all', `All (${bookings.length})`]].map(([key, label]) => (
              <button key={key} onClick={() => setTab(key)} style={{
                background: tab === key ? 'var(--gold)' : 'transparent',
                border: 'none', color: tab === key ? 'var(--black)' : 'var(--gray)',
                fontFamily: 'var(--font-body)', fontSize: '0.75rem',
                letterSpacing: '1.5px', textTransform: 'uppercase',
                cursor: 'pointer', padding: '0.5rem 1.1rem',
                borderRadius: '50px', fontWeight: tab === key ? '500' : '300',
                transition: 'all 0.25s', whiteSpace: 'nowrap'
              }}>{label}</button>
            ))}
          </div>
        )}

        {loading ? (
          <p style={{ color: 'var(--gray)', textAlign: 'center', padding: '3rem' }}>Loading your bookings...</p>
        ) : bookings.length === 0 ? (
          <div style={{ background: 'var(--dark)', border: '1px solid rgba(201,168,76,0.2)', padding: '3rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--gray)', marginBottom: '1.5rem' }}>You haven't made any bookings yet.</p>
            <Link to="/booking" className="btn-primary">Book Your First Detail</Link>
          </div>
        ) : (
          <>
            {/* UPCOMING */}
            {(tab === 'upcoming' || tab === 'all') && upcoming.length > 0 && (
              <div style={{ marginBottom: '2.5rem' }}>
                <h3 style={{ color: 'var(--gold)', fontSize: '0.8rem', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '1rem' }}>Upcoming Appointments</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {upcoming.map(b => (
                    <div key={b.id} style={{ background: 'var(--dark)', border: '1px solid rgba(201,168,76,0.2)', padding: '1.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.8rem' }}>
                        <div>
                          <p style={{ color: 'var(--white)', fontWeight: '500', fontSize: '1rem' }}>{b.service}</p>
                          <p style={{ color: 'var(--gray)', fontSize: '0.85rem', marginTop: '0.2rem' }}>📅 {b.date} at {b.time}</p>
                          {b.car_model && <p style={{ color: 'var(--gray)', fontSize: '0.85rem' }}>🚗 {b.car_model}</p>}
                        </div>
                        <span style={{ color: statusColor(b.status), border: `1px solid ${statusColor(b.status)}`, padding: '0.2rem 0.8rem', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                          {b.status}
                        </span>
                      </div>
                      {b.admin_notes && (
                        <p style={{ color: 'var(--gold)', fontSize: '0.82rem', background: 'rgba(201,168,76,0.08)', padding: '0.5rem 0.8rem', marginBottom: '0.8rem' }}>
                          📝 Note from us: {b.admin_notes}
                        </p>
                      )}
                      {b.status !== 'cancelled' && (
                        <button
                          onClick={() => cancelBooking(b.id)}
                          disabled={cancelling === b.id}
                          style={{ background: 'rgba(244,67,54,0.1)', color: '#f44336', border: '1px solid #f44336', padding: '0.4rem 1rem', fontSize: '0.75rem', cursor: 'pointer', opacity: cancelling === b.id ? 0.6 : 1 }}
                        >
                          {cancelling === b.id ? 'Cancelling...' : 'Cancel Booking'}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PAST */}
            {(tab === 'past' || tab === 'all') && past.length > 0 && (
              <div>
                <h3 style={{ color: 'var(--gray)', fontSize: '0.8rem', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '1rem' }}>Past Bookings</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  {past.map(b => (
                    <div key={b.id} style={{ background: 'var(--dark)', border: '1px solid rgba(255,255,255,0.05)', padding: '1.2rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <p style={{ color: 'var(--gray)', fontWeight: '500' }}>{b.service}</p>
                        <p style={{ color: 'var(--gray)', fontSize: '0.82rem' }}>{b.date} at {b.time}</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ color: statusColor(b.status), fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{b.status}</span>
                        {b.status === 'completed' && (
                          <Link to="/reviews" style={{ color: 'var(--gold)', fontSize: '0.75rem', border: '1px solid var(--gold)', padding: '0.2rem 0.6rem', textDecoration: 'none' }}>
                            Leave Review
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
