import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { useFeatures } from '../App'
import { Card, CardHead, StatCard, WeekCalendar, HBars, initials, timeAgo } from '../components/ui'
import {
  SparkleIcon, CalendarPlusIcon, StarIcon, TagIcon, ArrowUpRight, ArrowRight, CarIcon, DropIcon,
  ShieldIcon, PinIcon, PhoneIcon, MailIcon, BellIcon, ClockIcon,
} from '../components/icons'

const SERVICE_ICONS = [CarIcon, DropIcon, ShieldIcon, SparkleIcon]

export default function Home() {
  const features = useFeatures()
  const navigate = useNavigate()
  const [services, setServices] = useState([])
  const [topPromo, setTopPromo] = useState(null)
  const [reviews, setReviews] = useState([])
  const [info, setInfo] = useState({ phone: '+000 000 0000', email: 'hello@idetaildynasty.com', location: 'Your City' })

  useEffect(() => {
    const fetchServices = async () => {
      const { data } = await supabase.from('services').select('*').eq('active', true).order('created_at')
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
    const fetchReviews = async () => {
      const { data } = await supabase.from('reviews').select('id, customer_name, service, rating, comment, created_at').order('created_at', { ascending: false })
      setReviews(data || [])
    }
    fetchServices()
    fetchPromo()
    fetchInfo()
    fetchReviews()

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

  const showReviews = features.enable_reviews
  const showPromos = features.enable_promos
  const avgRating = reviews.length ? reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length : 0
  const minPrice = services.length ? Math.min(...services.map(s => Number(s.price) || 0)) : 0
  const ratingRows = [5, 4, 3, 2, 1].map(n => ({ label: `${n}★`, value: reviews.filter(r => r.rating === n).length }))

  return (
    <div className="dash">
      <div className="dash-main rise">
        {/* WELCOME BANNER */}
        <section className="banner" style={{ padding: undefined }}>
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ maxWidth: 520 }}>
              <span className="banner-eyebrow"><SparkleIcon width={13} height={13} /> Premium car detailing</span>
              <h1 style={{ fontSize: 'clamp(1.7rem, 3.4vw, 2.5rem)', lineHeight: 1.1, marginBottom: 12 }}>
                Your car deserves <span className="accent">Dynasty</span> treatment
              </h1>
              <p style={{ fontSize: '0.92rem', lineHeight: 1.6 }}>
                Professional detailing that restores, protects and transforms your vehicle. We don't just clean cars, we perfect them.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <Link to="/booking" className="btn-peach"><CalendarPlusIcon /> Book appointment</Link>
              {showPromos && <Link to="/promos" className="btn-ghost-light">View promos</Link>}
            </div>
          </div>
        </section>

        {/* STATS */}
        <div className="stat-row rise">
          <StatCard icon={SparkleIcon} label="Services" value={services.length} sub="Hand-finished packages" />
          <StatCard icon={TagIcon} tone="peach" label="Starting from" value={minPrice} prefix="RWF " sub="Per vehicle, before extras" />
          {showReviews && reviews.length > 0 ? (
            <>
              <StatCard icon={StarIcon} tone="turq" label="Rating" value={avgRating} decimals={1} suffix=" / 5" sub={<><b>{reviews.length}</b> customer reviews</>} />
              <StatCard icon={ShieldIcon} tone="cream" label="5-star reviews" value={ratingRows[0].value} sub={reviews.length ? <><b>{Math.round((ratingRows[0].value / reviews.length) * 100)}%</b> of all ratings</> : 'Be the first to review'} />
            </>
          ) : (
            <>
              <StatCard icon={ClockIcon} tone="turq" label="Open slots" value="8am–4pm" sub="Monday to Saturday" />
              <StatCard icon={ShieldIcon} tone="cream" label="Products" value="Premium" sub="Safe on every finish" />
            </>
          )}
        </div>

        {/* SERVICES */}
        <Card>
          <CardHead title="Our services" chip={services.length || null}>
            <Link to="/services" className="icon-btn" aria-label="View all services"><ArrowUpRight /></Link>
          </CardHead>
          {services.length === 0 ? (
            <div className="empty">Services will appear here shortly.</div>
          ) : (
            <div className="svc-grid">
              {services.slice(0, 6).map((s, i) => {
                const Icon = SERVICE_ICONS[i % SERVICE_ICONS.length]
                return (
                  <Card hover key={s.id} className="svc-card">
                    <div className="svc-thumb">
                      {s.badge && <span className="svc-badge">{s.badge}</span>}
                      <Icon />
                    </div>
                    <div className="svc-body">
                      <h4 className="svc-name">{s.name}</h4>
                      {s.description && <p className="svc-desc">{s.description}</p>}
                      <div className="svc-foot">
                        <div className="svc-price">
                          <small>{s.suv_surcharge > 0 ? `SUV +RWF ${Number(s.suv_surcharge).toLocaleString()}` : 'From'}</small>
                          RWF {Number(s.price).toLocaleString()}
                        </div>
                        <Link to="/booking" className="icon-btn dark" aria-label={`Book ${s.name}`}><ArrowRight /></Link>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </Card>

        {/* RATINGS + CONTACT */}
        <div className="two-col">
          {showReviews && (
            <Card>
              <CardHead title="Customer ratings">
                <Link to="/reviews" className="icon-btn" aria-label="All reviews"><ArrowUpRight /></Link>
              </CardHead>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 14 }}>
                <span style={{ font: '700 2.2rem/1 var(--font-display)', letterSpacing: '-0.04em' }}>{reviews.length ? avgRating.toFixed(1) : '–'}</span>
                <span className="stars">{'★'.repeat(Math.round(avgRating))}{'☆'.repeat(5 - Math.round(avgRating))}</span>
              </div>
              <HBars rows={ratingRows} />
            </Card>
          )}
          <Card tone="warm">
            <CardHead title="Visit us" />
            <div className="feed">
              {[
                { Icon: PinIcon, label: 'Location', value: info.location },
                { Icon: PhoneIcon, label: 'Phone', value: info.phone, href: `tel:${info.phone}` },
                { Icon: MailIcon, label: 'Email', value: info.email, href: `mailto:${info.email}` },
              ].map(({ Icon, label, value, href }) => (
                <a key={label} href={href} className="feed-item" style={{ textDecoration: 'none', alignItems: 'center' }}>
                  <span className="tile-icon"><Icon /></span>
                  <div className="feed-body">
                    <div className="card-label">{label}</div>
                    <div className="feed-title" style={{ overflowWrap: 'anywhere' }}>{value}</div>
                  </div>
                </a>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <aside className="dash-side rise">
        <Card>
          <WeekCalendar onPick={(d) => navigate(`/booking?date=${d}`)} />
          <p className="card-label" style={{ marginTop: 12, textAlign: 'center' }}>Tap a day to start a booking</p>
        </Card>

        {showPromos && topPromo && (
          <Card tone="peach">
            <div className="card-head">
              <span className="promo-tag" style={{ margin: 0 }}>{topPromo.tag || 'Offer'}</span>
              <Link to="/promos" className="icon-btn" aria-label="All promos"><ArrowUpRight /></Link>
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: 6 }}>{topPromo.title}</h3>
            <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: 14 }}>{topPromo.description}</p>
            {topPromo.code && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', border: '1px dashed rgba(238,154,108,0.6)', borderRadius: 12, padding: '10px 14px' }}>
                <span style={{ fontWeight: 700, letterSpacing: '0.12em', color: 'var(--forest)' }}>{topPromo.code}</span>
                <span className="card-label">promo code</span>
              </div>
            )}
          </Card>
        )}

        {showReviews && (
          <Card>
            <CardHead title="Latest reviews">
              <span className="icon-btn dark" aria-hidden="true" style={{ cursor: 'default' }}><BellIcon /></span>
            </CardHead>
            {reviews.length === 0 ? (
              <div className="empty">
                <p style={{ marginBottom: 12 }}>No reviews yet.</p>
                <Link to="/reviews" className="btn-mint" style={{ padding: '0.55rem 1rem', fontSize: '0.8rem' }}><StarIcon /> Write the first one</Link>
              </div>
            ) : (
              <div className="feed">
                {reviews.slice(0, 4).map(r => (
                  <div className="feed-item" key={r.id}>
                    <span className="feed-avatar">{initials(r.customer_name)}</span>
                    <div className="feed-body">
                      <div className="feed-title">
                        {r.customer_name}{r.service ? <span style={{ color: 'var(--muted)', fontWeight: 400 }}> · {r.service}</span> : null}
                      </div>
                      {r.comment && <p style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: 3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{r.comment}</p>}
                      <div className="feed-meta">
                        <span className="stars">{'★'.repeat(r.rating || 0)}</span>
                        <span>{timeAgo(r.created_at)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}
      </aside>

      {/* FOOTER */}
      <footer style={{ gridColumn: '1 / -1', marginTop: 0 }}>
        <div className="footer-logo">iDetail Dynasty</div>
        <p>Premium car detailing, done right every time. © {new Date().getFullYear()} iDetail Dynasty.</p>
      </footer>
    </div>
  )
}
