import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { Card, CardHead, StatCard, PillBarChart, initials } from '../components/ui'
import {
  CalendarIcon, CalendarPlusIcon, ClockIcon, CarIcon, CheckIcon, XIcon, MailIcon, StarIcon, TrendIcon, ClipboardIcon,
} from '../components/icons'

const parseDate = (s) => {
  if (!s) return null
  const d = new Date(`${s}T00:00:00`)
  return isNaN(d) ? null : d
}

export default function Dashboard({ user }) {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(null)
  const [tab, setTab] = useState('upcoming')
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    const load = async () => {
      const { data } = await supabase
        .from('bookings')
        .select('*')
        .eq('email', user.email)
        .order('created_at', { ascending: false })
      setBookings(data || [])
      setLoading(false)
    }
    load()

    const channel = supabase.channel('dashboard-bookings')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'bookings' }, (payload) => {
        setBookings(prev => prev.map(b => b.id === payload.new.id ? payload.new : b))
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [user, navigate])

  const cancelBooking = async (id) => {
    if (!window.confirm('Cancel this booking?')) return
    setCancelling(id)
    await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', id)
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b))
    setCancelling(null)
  }

  const upcoming = bookings.filter(b => b.status === 'pending' || b.status === 'confirmed')
  const past = bookings.filter(b => b.status === 'completed' || b.status === 'cancelled' || b.status === 'no-show')
  const completed = bookings.filter(b => b.status === 'completed').length
  const cancelled = bookings.filter(b => b.status === 'cancelled').length

  // Next appointment = soonest upcoming by date
  const next = [...upcoming]
    .filter(b => parseDate(b.date))
    .sort((a, b) => parseDate(a.date) - parseDate(b.date))[0]
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const daysToNext = next ? Math.round((parseDate(next.date) - today) / 86400000) : null

  // Bookings per month, last 6 months
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth() - 5 + i, 1)
    return { key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleDateString(undefined, { month: 'short' }) }
  })
  const chart = months.map(m => {
    const value = bookings.filter(b => {
      const d = parseDate(b.date) || new Date(b.created_at)
      return d && `${d.getFullYear()}-${d.getMonth()}` === m.key
    }).length
    return { label: m.label, value, tip: `${value} booking${value === 1 ? '' : 's'}` }
  })

  if (!user) return null

  const visible = tab === 'upcoming' ? upcoming : tab === 'past' ? past : [...upcoming, ...past]

  return (
    <div className="dash-main rise">
      {/* PROFILE HEADER */}
      <Card className="profile-head">
        <div className="profile-cover" />
        <div className="profile-body">
          <div className="profile-avatar">{initials(user.name)}</div>
          <div className="profile-info">
            <h1>Welcome, {user.name}</h1>
            <div className="profile-meta">
              <span><MailIcon /> {user.email}</span>
              <span><ClipboardIcon /> {bookings.length} booking{bookings.length === 1 ? '' : 's'}</span>
            </div>
          </div>
          <div className="profile-actions">
            {upcoming.length > 0 && <span className="count-chip">{upcoming.length} upcoming</span>}
            <Link to="/booking" className="btn-primary"><CalendarPlusIcon /> Book new appointment</Link>
          </div>
        </div>
      </Card>

      {/* STATS */}
      <div className="stat-row">
        <StatCard icon={CalendarIcon} label="Total bookings" value={bookings.length} sub="Since you joined" />
        <StatCard icon={ClockIcon} tone="peach" label="Upcoming" value={upcoming.length} sub={next ? <>Next: <b>{next.date}</b></> : 'Nothing scheduled'} />
        <StatCard icon={CheckIcon} tone="turq" label="Completed" value={completed} sub={completed ? <><b>Thanks</b> for trusting us</> : 'Your first detail awaits'} />
        <StatCard icon={XIcon} tone="cream" label="Cancelled" value={cancelled} sub="Including no-shows" />
      </div>

      <div className="two-col">
        <Card>
          <CardHead title="Bookings this half-year">
            <span className="tile-icon"><TrendIcon /></span>
          </CardHead>
          <PillBarChart data={chart} hi={chart.length - 1} />
        </Card>

        <Card tone="mint" className="next-card">
          <CardHead title="Next appointment" />
          {next ? (
            <>
              <div className="big">{daysToNext <= 0 ? 'Today' : daysToNext === 1 ? 'Tomorrow' : `${daysToNext} days`}</div>
              <p className="card-label" style={{ marginTop: 6, marginBottom: 16 }}>{daysToNext > 1 ? 'until your detail' : 'get your keys ready'}</p>
              <div className="feed">
                <div className="feed-item" style={{ alignItems: 'center' }}>
                  <span className="tile-icon"><CarIcon /></span>
                  <div className="feed-body">
                    <div className="feed-title">{next.service}</div>
                    <div className="feed-meta"><span>{next.date} · {next.time}</span><span className={`status-chip ${next.status}`}>{next.status}</span></div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: 16 }}>No upcoming appointments. Treat your car to a fresh detail.</p>
              <Link to="/booking" className="btn-primary"><CalendarPlusIcon /> Book a detail</Link>
            </>
          )}
        </Card>
      </div>

      {/* BOOKINGS LIST */}
      <Card>
        <div className="card-head" style={{ flexWrap: 'wrap' }}>
          <h3 className="card-title">Appointments</h3>
          {!loading && bookings.length > 0 && (
            <div className="pill-tabs">
              {[['upcoming', `Upcoming (${upcoming.length})`], ['past', `Past (${past.length})`], ['all', `All (${bookings.length})`]].map(([key, label]) => (
                <button key={key} onClick={() => setTab(key)} style={{
                  background: tab === key ? 'var(--forest)' : 'transparent',
                  border: 'none', color: tab === key ? '#fff' : 'var(--muted)',
                  cursor: 'pointer', transition: 'all 0.25s', whiteSpace: 'nowrap',
                }}>{label}</button>
              ))}
            </div>
          )}
        </div>

        {loading ? (
          <div className="empty">Loading your bookings...</div>
        ) : bookings.length === 0 ? (
          <div className="empty">
            <p style={{ marginBottom: 16 }}>You haven't made any bookings yet.</p>
            <Link to="/booking" className="btn-primary">Book your first detail</Link>
          </div>
        ) : visible.length === 0 ? (
          <div className="empty">Nothing here yet.</div>
        ) : (
          <div className="feed">
            {visible.map(b => {
              const d = parseDate(b.date)
              const isPast = past.includes(b)
              return (
                <div key={b.id} className={`card booking-card${isPast ? ' past' : ''}`} style={{ boxShadow: 'none' }}>
                  <div className="date-tile">
                    <span className="m">{d ? d.toLocaleDateString(undefined, { month: 'short' }) : '—'}</span>
                    <span className="d">{d ? d.getDate() : '?'}</span>
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div className="bk-title">{b.service}</div>
                    <div className="bk-meta">
                      <span><ClockIcon /> {b.date} at {b.time}</span>
                      {b.car_model && <span><CarIcon /> {b.car_model}</span>}
                    </div>
                  </div>
                  <div className="bk-actions">
                    <span className={`status-chip ${b.status}`}>{b.status}</span>
                    {!isPast && b.status !== 'cancelled' && (
                      <button className="btn-danger-soft" onClick={() => cancelBooking(b.id)} disabled={cancelling === b.id}>
                        {cancelling === b.id ? 'Cancelling...' : 'Cancel'}
                      </button>
                    )}
                    {b.status === 'completed' && (
                      <Link to="/reviews" className="btn-mint" style={{ padding: '0.5rem 0.9rem', fontSize: '0.75rem' }}><StarIcon /> Leave review</Link>
                    )}
                  </div>
                  {b.admin_notes && <p className="bk-note">Note from us: {b.admin_notes}</p>}
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}
