import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabase'

const WHATSAPP = 'https://wa.me/250792575132?text=Hi%20iDetail%20Dynasty%2C%20I%27d%20like%20to%20claim%20my%2030%25%20launch%20discount.'
const WHATSAPP_REFERRAL = 'https://wa.me/250792575132?text=Hi%2C%20I%27d%20like%20to%20get%20my%20referral%20code.'
const WHATSAPP_EV = 'https://wa.me/250792575132?text=Hi%2C%20I%20drive%20an%20EV%20and%20would%20like%20to%20claim%20my%20permanent%2010%25%20discount.'
const WHATSAPP_GENERAL = 'https://wa.me/250792575132?text=Hi%20iDetail%20Dynasty%2C%20I%27d%20like%20to%20book%20a%20service.'

const stamps = [1, 2, 3, 4, 5]

const testimonials = [
  {
    stars: 5,
    text: '"My car looked brand new after the full detail. The paint correction on my Fortuner was unbelievable — I had scratches I thought were permanent."',
    initials: 'JM',
    name: 'Jean-Marie K.',
    service: 'Full Detail · Kigali'
  },
  {
    stars: 5,
    text: '"Professional, punctual, and the before/after photos they sent were amazing. Booked the monthly subscription immediately after my first wash."',
    initials: 'AS',
    name: 'Amira S.',
    service: 'Monthly Subscriber · Gasabo'
  },
  {
    stars: 5,
    text: '"Got the EV discount on my Tesla. Interior cleaning was spotless and they understood exactly how to handle the car. Will be back every month."',
    initials: 'PH',
    name: 'Patrick H.',
    service: 'EV Client · Nyarutarama'
  }
]

export default function Promos() {
  const [slotsLeft] = useState(6)
  const [monthSlotsLeft] = useState(14)

  return (
    <>
      {/* ANNOUNCEMENT BAR */}
      <div style={{
        position: 'fixed', top: '70px', left: 0, right: 0, zIndex: 99,
        background: 'linear-gradient(90deg, #1a1200, #C9A84C, #1a1200)',
        padding: '0.55rem 2rem',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem',
        flexWrap: 'wrap'
      }}>
        <span style={{ color: '#0A0A0A', fontSize: '0.78rem', fontWeight: '600', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
          🚀 Launch Offer — 30% off your first service. Limited to 20 bookings only.
        </span>
        <a href={WHATSAPP} target="_blank" rel="noreferrer" style={{
          background: '#0A0A0A', color: '#C9A84C', padding: '0.3rem 1rem',
          borderRadius: '50px', fontSize: '0.72rem', fontWeight: '600',
          letterSpacing: '1.5px', textTransform: 'uppercase', textDecoration: 'none',
          whiteSpace: 'nowrap'
        }}>Book Now</a>
      </div>

      {/* HERO */}
      <section style={{
        paddingTop: '11rem', paddingBottom: '5rem', textAlign: 'center',
        background: 'linear-gradient(135deg, #0A0A0A 0%, #1a1200 50%, #0A0A0A 100%)',
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(201,168,76,0.1) 0%, transparent 70%)' }} />
        <div style={{ position: 'relative', zIndex: 1, padding: '0 2rem', maxWidth: '700px', margin: '0 auto' }}>
          <p className="section-label">Exclusive Offers — Kigali</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.8rem, 7vw, 5rem)', fontWeight: '700', lineHeight: 1.05, marginBottom: '1.2rem' }}>
            Your car deserves<br /><span style={{ color: 'var(--gold)' }}>dynasty-level care.</span>
          </h1>
          <p style={{ color: 'var(--gray)', fontSize: '1rem', lineHeight: '1.7', marginBottom: '2rem', maxWidth: '520px', margin: '0 auto 2rem' }}>
            Professional car detailing — interior, exterior, paint correction, tyre &amp; headlight restoration. Serving Kigali with premium mobile detailing.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2rem' }}>
            <a href={WHATSAPP} target="_blank" rel="noreferrer" className="btn-primary">
              Claim your 30% launch discount
            </a>
            <Link to="/services" className="btn-outline">View all services</Link>
          </div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)',
            borderRadius: '50px', padding: '0.5rem 1.2rem'
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4CAF50', display: 'inline-block', animation: 'pulse 2s infinite' }} />
            <span style={{ color: 'var(--gold)', fontSize: '0.82rem', fontWeight: '500' }}>
              {monthSlotsLeft} of 20 slots remaining this month
            </span>
          </div>
        </div>
      </section>

      {/* MAIN PROMOS */}
      <section style={{ background: 'var(--black)', padding: '5rem 2rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <p className="section-label" style={{ textAlign: 'center' }}>Current Promotions</p>
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '0.8rem' }}>Deals built for Kigali</h2>
          <p style={{ color: 'var(--gray)', textAlign: 'center', maxWidth: '520px', margin: '0 auto 3.5rem', lineHeight: '1.7', fontSize: '0.95rem' }}>
            Every offer below is designed to give you real value — not gimmicks. Book directly via WhatsApp, no apps needed.
          </p>

          {/* 3 FEATURED PROMO CARDS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>

            {/* LAUNCH OFFER */}
            <div style={{ background: 'var(--dark)', border: '1px solid rgba(201,168,76,0.4)', borderRadius: '16px', overflow: 'hidden', position: 'relative' }}>
              <div style={{ background: 'linear-gradient(90deg, #1a1200, #C9A84C, #1a1200)', height: '3px' }} />
              <div style={{ padding: '2rem' }}>
                <span style={{ background: 'var(--gold)', color: 'var(--black)', fontSize: '0.65rem', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', padding: '0.25rem 0.8rem', borderRadius: '50px' }}>Grand Opening</span>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '4rem', color: 'var(--gold)', fontWeight: '700', lineHeight: 1, margin: '1rem 0 0.5rem' }}>30%<span style={{ fontSize: '1.8rem' }}> OFF</span></div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', marginBottom: '0.8rem' }}>30% off your first service</h3>
                <p style={{ color: 'var(--gray)', fontSize: '0.88rem', lineHeight: '1.6', marginBottom: '1.2rem' }}>
                  New clients only. Valid on any service from basic wash to full detail. First 20 bookings only — once they're gone, this deal is gone.
                </p>
                <p style={{ color: 'var(--gray)', fontSize: '0.75rem', marginBottom: '1.5rem' }}>
                  <span style={{ color: 'var(--gold)' }}>New clients</span> · First visit · Any service
                </p>
                <a href={WHATSAPP} target="_blank" rel="noreferrer" style={{
                  display: 'block', textAlign: 'center', background: 'var(--gold)', color: 'var(--black)',
                  padding: '0.85rem', borderRadius: '50px', textDecoration: 'none',
                  fontSize: '0.8rem', fontWeight: '600', letterSpacing: '1.5px', textTransform: 'uppercase'
                }}>Book on WhatsApp</a>
              </div>
            </div>

            {/* REFERRAL */}
            <div style={{ background: 'var(--dark)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '16px', overflow: 'hidden' }}>
              <div style={{ background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.3), transparent)', height: '3px' }} />
              <div style={{ padding: '2rem' }}>
                <span style={{ background: 'rgba(201,168,76,0.15)', color: 'var(--gold)', fontSize: '0.65rem', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', padding: '0.25rem 0.8rem', borderRadius: '50px', border: '1px solid rgba(201,168,76,0.3)' }}>Referral</span>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '4rem', color: 'var(--gold)', fontWeight: '700', lineHeight: 1, margin: '1rem 0 0.5rem' }}>15%<span style={{ fontSize: '1.8rem' }}> EACH</span></div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', marginBottom: '0.8rem' }}>Bring a friend — both save 15%</h3>
                <p style={{ color: 'var(--gray)', fontSize: '0.88rem', lineHeight: '1.6', marginBottom: '1.2rem' }}>
                  Refer a friend to iDetail Dynasty and when they book their first service, you both receive 15% off your next visit. No expiry. No cap.
                </p>
                <p style={{ color: 'var(--gray)', fontSize: '0.75rem', marginBottom: '1.5rem' }}>
                  <span style={{ color: 'var(--gold)' }}>Unlimited referrals</span> · Ongoing
                </p>
                <a href={WHATSAPP_REFERRAL} target="_blank" rel="noreferrer" style={{
                  display: 'block', textAlign: 'center', background: 'transparent', color: 'var(--gold)',
                  padding: '0.85rem', borderRadius: '50px', textDecoration: 'none',
                  fontSize: '0.8rem', fontWeight: '600', letterSpacing: '1.5px', textTransform: 'uppercase',
                  border: '1px solid var(--gold)'
                }}>Get your referral code</a>
              </div>
            </div>

            {/* EV DISCOUNT */}
            <div style={{ background: 'var(--dark)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '16px', overflow: 'hidden' }}>
              <div style={{ background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.3), transparent)', height: '3px' }} />
              <div style={{ padding: '2rem' }}>
                <span style={{ background: 'rgba(76,175,80,0.15)', color: '#4CAF50', fontSize: '0.65rem', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', padding: '0.25rem 0.8rem', borderRadius: '50px', border: '1px solid rgba(76,175,80,0.3)' }}>EV Owners</span>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '4rem', color: '#4CAF50', fontWeight: '700', lineHeight: 1, margin: '1rem 0 0.5rem' }}>10%<span style={{ fontSize: '1.8rem' }}> ALWAYS</span></div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', marginBottom: '0.8rem' }}>Electric vehicle permanent discount</h3>
                <p style={{ color: 'var(--gray)', fontSize: '0.88rem', lineHeight: '1.6', marginBottom: '1.2rem' }}>
                  Drive an EV? Get a permanent 10% discount on every service, every time. Rwanda's roads deserve cleaner cars — we're here for that movement.
                </p>
                <p style={{ color: 'var(--gray)', fontSize: '0.75rem', marginBottom: '1.5rem' }}>
                  <span style={{ color: '#4CAF50' }}>Every visit</span> · All EV models
                </p>
                <a href={WHATSAPP_EV} target="_blank" rel="noreferrer" style={{
                  display: 'block', textAlign: 'center', background: 'transparent', color: '#4CAF50',
                  padding: '0.85rem', borderRadius: '50px', textDecoration: 'none',
                  fontSize: '0.8rem', fontWeight: '600', letterSpacing: '1.5px', textTransform: 'uppercase',
                  border: '1px solid #4CAF50'
                }}>Claim EV discount</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MORE WAYS TO SAVE */}
      <section style={{ background: 'var(--dark)', padding: '5rem 2rem', borderTop: '1px solid rgba(201,168,76,0.1)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <p className="section-label" style={{ textAlign: 'center' }}>More Ways to Save</p>
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '0.8rem' }}>Built around your lifestyle</h2>
          <p style={{ color: 'var(--gray)', textAlign: 'center', maxWidth: '480px', margin: '0 auto 3rem', fontSize: '0.95rem', lineHeight: '1.7' }}>
            Whether you need your car done once or every week, we have an offer that fits.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.2rem' }}>
            {[
              { icon: '📅', title: 'Monthly Wash Subscription', desc: '4 basic exterior washes per month for RWF 60,000. Pay once, save 15%, skip the queue.', tag: 'Save RWF 15,600/month', tagColor: 'var(--gold)' },
              { icon: '👥', title: 'Bring a Friend Discount', desc: 'Refer someone new and you both walk away with 15% off your next booking.', tag: 'Ongoing · No expiry', tagColor: 'var(--gold)' },
              { icon: '🛞', title: 'Free Tyre Dressing Add-On', desc: 'Every wash this month includes a complimentary tyre shine. No extra charge, no request needed.', tag: 'This month only', tagColor: '#FF9800' },
              { icon: '🎂', title: 'Birthday Month Treat', desc: 'Book in your birthday month and receive 20% off any service — our gift to you.', tag: 'Tell us your birthday', tagColor: 'var(--gold)' },
              { icon: '🚗', title: 'Fleet & Corporate Rates', desc: 'Running a fleet? NGO, hotel, or business with 3+ vehicles? Get a dedicated monthly rate with invoicing.', tag: 'Contact for quote', tagColor: 'var(--gold)' },
              { icon: '⭐', title: 'Leave a Review, Get a Reward', desc: 'Drop us a Google or Facebook review and your next visit includes a free interior freshener spray.', tag: 'After first visit', tagColor: 'var(--gold)' },
            ].map((item, i) => (
              <div key={i} style={{ background: 'var(--dark2)', border: '1px solid rgba(201,168,76,0.12)', borderRadius: '14px', padding: '1.8rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.8rem' }}>{item.icon}</div>
                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', color: 'var(--white)', marginBottom: '0.6rem' }}>{item.title}</h4>
                <p style={{ color: 'var(--gray)', fontSize: '0.85rem', lineHeight: '1.6', marginBottom: '1rem' }}>{item.desc}</p>
                <span style={{ color: item.tagColor, fontSize: '0.75rem', fontWeight: '500', letterSpacing: '1px' }}>{item.tag}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LOYALTY STAMPS */}
      <section style={{ background: 'var(--black)', padding: '5rem 2rem', borderTop: '1px solid rgba(201,168,76,0.1)' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <p className="section-label">Loyalty Programme</p>
          <h2 className="section-title" style={{ marginBottom: '0.8rem' }}>Every 5th wash is on us</h2>
          <p style={{ color: 'var(--gray)', fontSize: '0.95rem', lineHeight: '1.7', marginBottom: '3rem', maxWidth: '460px', margin: '0 auto 3rem' }}>
            Book any wash service and collect a stamp. Reach 5 and your next basic exterior wash is completely free. No app, no fuss — tracked via WhatsApp.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            {stamps.map((s, i) => (
              <div key={i} style={{
                width: '72px', height: '72px', borderRadius: '50%',
                background: i < 3 ? 'var(--gold)' : i === 4 ? 'rgba(201,168,76,0.08)' : 'rgba(201,168,76,0.08)',
                border: i === 4 ? '2px dashed rgba(201,168,76,0.4)' : '2px solid var(--gold)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexDirection: 'column',
                transition: 'all 0.3s'
              }}>
                {i === 4 ? (
                  <>
                    <span style={{ fontSize: '1.4rem' }}>🎁</span>
                    <span style={{ color: 'var(--gold)', fontSize: '0.55rem', fontWeight: '700', letterSpacing: '1px', marginTop: '2px' }}>FREE</span>
                  </>
                ) : i < 3 ? (
                  <span style={{ color: 'var(--black)', fontSize: '1.4rem' }}>✦</span>
                ) : (
                  <span style={{ color: 'rgba(201,168,76,0.3)', fontSize: '1.4rem' }}>✦</span>
                )}
              </div>
            ))}
          </div>
          <p style={{ color: 'var(--gray)', fontSize: '0.8rem', marginBottom: '2rem' }}>
            Example: 3 stamps collected — just 1 more to go before your free wash
          </p>
          <a href={WHATSAPP_GENERAL} target="_blank" rel="noreferrer" className="btn-primary">
            Start collecting today
          </a>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ background: 'var(--dark)', padding: '5rem 2rem', borderTop: '1px solid rgba(201,168,76,0.1)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <p className="section-label" style={{ textAlign: 'center' }}>What Clients Say</p>
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '3rem' }}>Real results. Real people.</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {testimonials.map((t, i) => (
              <div key={i} style={{ background: 'var(--dark2)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '14px', padding: '2rem' }}>
                <div style={{ color: '#FF9800', fontSize: '1rem', marginBottom: '1rem' }}>{'★'.repeat(t.stars)}</div>
                <p style={{ color: 'var(--white)', fontSize: '0.9rem', lineHeight: '1.7', marginBottom: '1.5rem', fontStyle: 'italic' }}>{t.text}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '50%',
                    background: 'var(--gold)', color: 'var(--black)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-display)', fontSize: '0.85rem', fontWeight: '700', flexShrink: 0
                  }}>{t.initials}</div>
                  <div>
                    <p style={{ color: 'var(--white)', fontSize: '0.85rem', fontWeight: '500' }}>{t.name}</p>
                    <p style={{ color: 'var(--gold)', fontSize: '0.75rem' }}>{t.service}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{
        background: 'linear-gradient(135deg, #0A0A0A 0%, #1a1200 50%, #0A0A0A 100%)',
        padding: '6rem 2rem', textAlign: 'center',
        borderTop: '1px solid rgba(201,168,76,0.2)', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(201,168,76,0.08) 0%, transparent 70%)' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '600px', margin: '0 auto' }}>
          <p className="section-label">Ready to transform your car?</p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 3.5rem)', marginBottom: '1rem' }}>
            Claim your launch discount today.
          </h2>
          <p style={{ color: 'var(--gray)', fontSize: '1rem', marginBottom: '0.5rem' }}>
            Only <strong style={{ color: 'var(--gold)' }}>{slotsLeft} slots left</strong> this month.
          </p>
          <p style={{ color: 'var(--gray)', fontSize: '0.88rem', marginBottom: '2.5rem' }}>
            Book in 60 seconds — no forms, no waiting.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href={WHATSAPP} target="_blank" rel="noreferrer" className="btn-primary">
              💬 Book on WhatsApp now
            </a>
            <a href="tel:+250792575132" className="btn-outline">
              📞 Call us directly
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-logo">iDetail Dynasty</div>
        <p>Premium car detailing — done right, every time.<br />
          📍 Kigali, Rwanda &nbsp;|&nbsp; 📞 +250 792 575 132 &nbsp;|&nbsp; ✉️ idetaildynastyrw@gmail.com
        </p>
        <p style={{ marginTop: '1rem', fontSize: '0.75rem' }}>© 2026 iDetail Dynasty. All rights reserved.</p>
      </footer>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </>
  )
}
