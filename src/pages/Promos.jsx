import { useState } from 'react'
import { Link } from 'react-router-dom'

const WA_LAUNCH   = 'https://wa.me/250792575132?text=Hi%20iDetail%20Dynasty%2C%20I%27d%20like%20to%20claim%20my%2030%25%20launch%20discount.'
const WA_REFERRAL = 'https://wa.me/250792575132?text=Hi%2C%20I%27d%20like%20to%20get%20my%20referral%20code.'
const WA_EV       = 'https://wa.me/250792575132?text=Hi%2C%20I%20drive%20an%20EV%20and%20would%20like%20to%20claim%20my%20permanent%2010%25%20discount.'
const WA_GENERAL  = 'https://wa.me/250792575132?text=Hi%20iDetail%20Dynasty%2C%20I%27d%20like%20to%20book%20a%20service.'

const testimonials = [
  { stars: 5, text: '"My car looked brand new after the full detail. The paint correction on my Fortuner was unbelievable — I had scratches I thought were permanent."', initials: 'JM', name: 'Jean-Marie K.', service: 'Full Detail · Kigali' },
  { stars: 5, text: '"Professional, punctual, and the before/after photos they sent were amazing. Booked the monthly subscription immediately after my first wash."', initials: 'AS', name: 'Amira S.', service: 'Monthly Subscriber · Gasabo' },
  { stars: 5, text: '"Got the EV discount on my Tesla. Interior cleaning was spotless and they understood exactly how to handle the car. Will be back every month."', initials: 'PH', name: 'Patrick H.', service: 'EV Client · Nyarutarama' },
]

const secondary = [
  { icon: '📅', title: 'Monthly Wash Subscription', desc: '4 basic exterior washes per month for RWF 60,000. Pay once, save 15%, skip the queue.', tag: 'Save RWF 15,600/month' },
  { icon: '👥', title: 'Bring a Friend Discount', desc: 'Refer someone new and you both walk away with 15% off your next booking.', tag: 'Ongoing · No expiry' },
  { icon: '🛞', title: 'Free Tyre Dressing Add-On', desc: 'Every wash this month includes a complimentary tyre shine. No extra charge, no request needed.', tag: 'This month only' },
  { icon: '🎂', title: 'Birthday Month Treat', desc: 'Book in your birthday month and receive 20% off any service — our gift to you.', tag: 'Tell us your birthday' },
  { icon: '🚗', title: 'Fleet & Corporate Rates', desc: 'Running a fleet? NGO, hotel, or business with 3+ vehicles? Get a dedicated monthly rate with invoicing.', tag: 'Contact for quote' },
  { icon: '⭐', title: 'Leave a Review, Get a Reward', desc: 'Drop us a Google or Facebook review and your next visit includes a free interior freshener spray.', tag: 'After first visit' },
]

export default function Promos() {
  const [slotsLeft] = useState(6)
  const [monthSlots] = useState(14)

  return (
    <>
      <style>{`
        .promo-announce {
          position: fixed; top: 70px; left: 0; right: 0; z-index: 98;
          background: linear-gradient(90deg, #1a1200, #C9A84C 40%, #E8C96D 50%, #C9A84C 60%, #1a1200);
          padding: 0.6rem 2rem;
          display: flex; align-items: center; justify-content: center; gap: 1.2rem;
          flex-wrap: wrap;
        }
        .promo-announce span { color: #0A0A0A; font-size: 0.78rem; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; }
        .promo-announce a { background: #0A0A0A; color: #C9A84C; padding: 0.3rem 1.1rem; border-radius: 50px; font-size: 0.7rem; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; text-decoration: none; white-space: nowrap; transition: all 0.2s; }
        .promo-announce a:hover { background: #1a1200; color: #E8C96D; }

        .promo-hero { padding: 11rem 2rem 6rem; text-align: center; background: linear-gradient(160deg, #0A0A0A 0%, #1a1200 45%, #0A0A0A 100%); position: relative; overflow: hidden; }
        .promo-hero::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 40%, rgba(201,168,76,0.12) 0%, transparent 65%); }
        .promo-hero-inner { position: relative; z-index: 1; max-width: 680px; margin: 0 auto; }
        .promo-hero h1 { font-family: var(--font-display); font-size: clamp(2.8rem, 7vw, 5.5rem); font-weight: 700; line-height: 1.05; margin-bottom: 1.2rem; }
        .promo-hero h1 span { color: var(--gold); }
        .promo-hero p { color: var(--gray); font-size: 1rem; line-height: 1.75; max-width: 500px; margin: 0 auto 2.2rem; }
        .promo-hero-btns { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; margin-bottom: 2rem; }
        .promo-slot-badge { display: inline-flex; align-items: center; gap: 0.6rem; background: rgba(201,168,76,0.08); border: 1px solid rgba(201,168,76,0.25); border-radius: 50px; padding: 0.55rem 1.4rem; }
        .promo-slot-dot { width: 8px; height: 8px; border-radius: 50%; background: #4CAF50; animation: promoPulse 2s infinite; flex-shrink: 0; }
        .promo-slot-badge span { color: var(--gold); font-size: 0.82rem; font-weight: 500; }
        @keyframes promoPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.85)} }

        .promo-section { padding: 5rem 2rem; }
        .promo-section-dark { background: var(--dark); border-top: 1px solid rgba(201,168,76,0.1); }
        .promo-section-black { background: var(--black); border-top: 1px solid rgba(201,168,76,0.1); }
        .promo-section-gradient { background: linear-gradient(135deg, #0A0A0A 0%, #1a1200 50%, #0A0A0A 100%); border-top: 1px solid rgba(201,168,76,0.2); position: relative; overflow: hidden; }
        .promo-section-gradient::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse at center, rgba(201,168,76,0.08) 0%, transparent 70%); }
        .promo-center { text-align: center; }
        .promo-max { max-width: 1100px; margin: 0 auto; }
        .promo-sub { color: var(--gray); font-size: 0.95rem; line-height: 1.75; max-width: 500px; margin: 0 auto 3.5rem; }

        /* FEATURED 3 CARDS */
        .promo-featured-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; }
        .promo-featured-card { background: var(--dark2); border-radius: 20px; overflow: hidden; display: flex; flex-direction: column; transition: transform 0.3s, box-shadow 0.3s; }
        .promo-featured-card:hover { transform: translateY(-6px); box-shadow: 0 20px 60px rgba(201,168,76,0.12); }
        .promo-featured-card.gold { border: 1px solid rgba(201,168,76,0.5); }
        .promo-featured-card.outline { border: 1px solid rgba(201,168,76,0.2); }
        .promo-featured-card.green { border: 1px solid rgba(76,175,80,0.3); }
        .promo-card-bar { height: 3px; }
        .promo-card-bar.gold { background: linear-gradient(90deg, #1a1200, #C9A84C, #E8C96D, #C9A84C, #1a1200); }
        .promo-card-bar.outline { background: linear-gradient(90deg, transparent, rgba(201,168,76,0.4), transparent); }
        .promo-card-bar.green { background: linear-gradient(90deg, transparent, #4CAF50, transparent); }
        .promo-card-body { padding: 2rem; flex: 1; display: flex; flex-direction: column; }
        .promo-card-tag { display: inline-block; font-size: 0.65rem; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; padding: 0.3rem 0.9rem; border-radius: 50px; margin-bottom: 1rem; }
        .promo-card-tag.gold { background: var(--gold); color: var(--black); }
        .promo-card-tag.outline { background: rgba(201,168,76,0.12); color: var(--gold); border: 1px solid rgba(201,168,76,0.3); }
        .promo-card-tag.green { background: rgba(76,175,80,0.12); color: #4CAF50; border: 1px solid rgba(76,175,80,0.3); }
        .promo-big-number { font-family: var(--font-display); font-size: clamp(3rem, 6vw, 4.5rem); font-weight: 700; line-height: 1; margin-bottom: 0.5rem; }
        .promo-big-number.gold { color: var(--gold); }
        .promo-big-number.green { color: #4CAF50; }
        .promo-card-title { font-family: var(--font-display); font-size: 1.35rem; margin-bottom: 0.8rem; color: var(--white); }
        .promo-card-desc { color: var(--gray); font-size: 0.88rem; line-height: 1.65; margin-bottom: 1rem; flex: 1; }
        .promo-card-meta { font-size: 0.75rem; margin-bottom: 1.5rem; color: var(--gray); }
        .promo-card-meta span { font-weight: 500; }
        .promo-card-meta span.gold { color: var(--gold); }
        .promo-card-meta span.green { color: #4CAF50; }
        .promo-cta-btn { display: block; text-align: center; padding: 0.9rem; border-radius: 50px; font-size: 0.78rem; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; text-decoration: none; transition: all 0.25s; cursor: pointer; border: none; font-family: var(--font-body); }
        .promo-cta-btn.gold-fill { background: var(--gold); color: var(--black); }
        .promo-cta-btn.gold-fill:hover { background: var(--gold-light); }
        .promo-cta-btn.gold-outline { background: transparent; color: var(--gold); border: 1px solid var(--gold); }
        .promo-cta-btn.gold-outline:hover { background: var(--gold); color: var(--black); }
        .promo-cta-btn.green-outline { background: transparent; color: #4CAF50; border: 1px solid #4CAF50; }
        .promo-cta-btn.green-outline:hover { background: #4CAF50; color: var(--black); }

        /* SECONDARY CARDS */
        .promo-secondary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.2rem; }
        .promo-secondary-card { background: var(--dark2); border: 1px solid rgba(201,168,76,0.1); border-radius: 16px; padding: 1.8rem; transition: border-color 0.3s, transform 0.3s; }
        .promo-secondary-card:hover { border-color: rgba(201,168,76,0.35); transform: translateY(-3px); }
        .promo-secondary-icon { font-size: 2rem; margin-bottom: 0.8rem; }
        .promo-secondary-title { font-family: var(--font-display); font-size: 1.1rem; color: var(--white); margin-bottom: 0.6rem; }
        .promo-secondary-desc { color: var(--gray); font-size: 0.85rem; line-height: 1.6; margin-bottom: 0.8rem; }
        .promo-secondary-tag { color: var(--gold); font-size: 0.75rem; font-weight: 500; letter-spacing: 1px; }

        /* LOYALTY */
        .promo-stamps { display: flex; justify-content: center; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
        .promo-stamp { width: 76px; height: 76px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-direction: column; transition: transform 0.3s; }
        .promo-stamp:hover { transform: scale(1.08); }
        .promo-stamp.filled { background: var(--gold); border: 2px solid var(--gold); }
        .promo-stamp.empty { background: rgba(201,168,76,0.06); border: 2px solid rgba(201,168,76,0.2); }
        .promo-stamp.free { background: rgba(201,168,76,0.06); border: 2px dashed rgba(201,168,76,0.4); }

        /* TESTIMONIALS */
        .promo-testi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; }
        .promo-testi-card { background: var(--dark2); border: 1px solid rgba(201,168,76,0.12); border-radius: 16px; padding: 2rem; transition: border-color 0.3s; }
        .promo-testi-card:hover { border-color: rgba(201,168,76,0.3); }
        .promo-testi-stars { color: #FF9800; font-size: 1rem; margin-bottom: 1rem; letter-spacing: 2px; }
        .promo-testi-text { color: var(--white); font-size: 0.9rem; line-height: 1.75; margin-bottom: 1.5rem; font-style: italic; }
        .promo-testi-author { display: flex; align-items: center; gap: 0.8rem; }
        .promo-testi-avatar { width: 42px; height: 42px; border-radius: 50%; background: var(--gold); color: var(--black); display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-size: 0.85rem; font-weight: 700; flex-shrink: 0; }
        .promo-testi-name { color: var(--white); font-size: 0.85rem; font-weight: 500; }
        .promo-testi-service { color: var(--gold); font-size: 0.75rem; margin-top: 0.1rem; }

        /* FINAL CTA */
        .promo-final-inner { position: relative; z-index: 1; max-width: 600px; margin: 0 auto; text-align: center; }
        .promo-final-inner h2 { font-family: var(--font-display); font-size: clamp(2rem, 5vw, 3.5rem); margin-bottom: 1rem; }
        .promo-final-btns { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }

        @media (max-width: 768px) {
          .promo-featured-grid { grid-template-columns: 1fr; }
          .promo-secondary-grid { grid-template-columns: 1fr; }
          .promo-testi-grid { grid-template-columns: 1fr; }
          .promo-stamp { width: 60px; height: 60px; }
          .promo-hero { padding: 9rem 1.2rem 4rem; }
        }
      `}</style>

      {/* ANNOUNCEMENT BAR */}
      <div className="promo-announce">
        <span>🚀 Launch Offer — 30% off your first service. Limited to 20 bookings only.</span>
        <a href={WA_LAUNCH} target="_blank" rel="noreferrer">Book Now</a>
      </div>

      {/* HERO */}
      <section className="promo-hero">
        <div className="promo-hero-inner">
          <p className="section-label">Exclusive Offers — Kigali</p>
          <h1>Your car deserves<br /><span>dynasty-level care.</span></h1>
          <p>Professional car detailing — interior, exterior, paint correction, tyre &amp; headlight restoration. Serving Kigali with premium mobile detailing.</p>
          <div className="promo-hero-btns">
            <a href={WA_LAUNCH} target="_blank" rel="noreferrer" className="btn-primary">Claim your 30% launch discount</a>
            <Link to="/services" className="btn-outline">View all services</Link>
          </div>
          <div className="promo-slot-badge">
            <span className="promo-slot-dot" />
            <span>{monthSlots} of 20 slots remaining this month</span>
          </div>
        </div>
      </section>

      {/* FEATURED PROMOS */}
      <section className="promo-section promo-section-black">
        <div className="promo-max">
          <p className="section-label promo-center">Current Promotions</p>
          <h2 className="section-title promo-center" style={{ marginBottom: '0.8rem' }}>Deals built for Kigali</h2>
          <p className="promo-sub">Every offer below is designed to give you real value — not gimmicks. Book directly via WhatsApp, no apps needed.</p>

          <div className="promo-featured-grid">

            {/* LAUNCH */}
            <div className="promo-featured-card gold">
              <div className="promo-card-bar gold" />
              <div className="promo-card-body">
                <span className="promo-card-tag gold">Grand Opening</span>
                <div className="promo-big-number gold">30%<span style={{ fontSize: '1.8rem' }}> OFF</span></div>
                <h3 className="promo-card-title">30% off your first service</h3>
                <p className="promo-card-desc">New clients only. Valid on any service from basic wash to full detail. First 20 bookings only — once they're gone, this deal is gone.</p>
                <p className="promo-card-meta"><span className="gold">New clients</span> · First visit · Any service</p>
                <a href={WA_LAUNCH} target="_blank" rel="noreferrer" className="promo-cta-btn gold-fill">Book on WhatsApp</a>
              </div>
            </div>

            {/* REFERRAL */}
            <div className="promo-featured-card outline">
              <div className="promo-card-bar outline" />
              <div className="promo-card-body">
                <span className="promo-card-tag outline">Referral</span>
                <div className="promo-big-number gold">15%<span style={{ fontSize: '1.8rem' }}> EACH</span></div>
                <h3 className="promo-card-title">Bring a friend — both save 15%</h3>
                <p className="promo-card-desc">Refer a friend to iDetail Dynasty and when they book their first service, you both receive 15% off your next visit. No expiry. No cap.</p>
                <p className="promo-card-meta"><span className="gold">Unlimited referrals</span> · Ongoing</p>
                <a href={WA_REFERRAL} target="_blank" rel="noreferrer" className="promo-cta-btn gold-outline">Get your referral code</a>
              </div>
            </div>

            {/* EV */}
            <div className="promo-featured-card green">
              <div className="promo-card-bar green" />
              <div className="promo-card-body">
                <span className="promo-card-tag green">EV Owners</span>
                <div className="promo-big-number green">10%<span style={{ fontSize: '1.8rem' }}> ALWAYS</span></div>
                <h3 className="promo-card-title">Electric vehicle permanent discount</h3>
                <p className="promo-card-desc">Drive an EV? Get a permanent 10% discount on every service, every time. Rwanda's roads deserve cleaner cars — we're here for that movement.</p>
                <p className="promo-card-meta"><span className="green">Every visit</span> · All EV models</p>
                <a href={WA_EV} target="_blank" rel="noreferrer" className="promo-cta-btn green-outline">Claim EV discount</a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECONDARY OFFERS */}
      <section className="promo-section promo-section-dark">
        <div className="promo-max">
          <p className="section-label promo-center">More Ways to Save</p>
          <h2 className="section-title promo-center" style={{ marginBottom: '0.8rem' }}>Built around your lifestyle</h2>
          <p className="promo-sub">Whether you need your car done once or every week, we have an offer that fits.</p>
          <div className="promo-secondary-grid">
            {secondary.map((item, i) => (
              <div key={i} className="promo-secondary-card">
                <div className="promo-secondary-icon">{item.icon}</div>
                <h4 className="promo-secondary-title">{item.title}</h4>
                <p className="promo-secondary-desc">{item.desc}</p>
                <span className="promo-secondary-tag">{item.tag}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LOYALTY */}
      <section className="promo-section promo-section-black">
        <div style={{ maxWidth: '580px', margin: '0 auto', textAlign: 'center' }}>
          <p className="section-label">Loyalty Programme</p>
          <h2 className="section-title" style={{ marginBottom: '0.8rem' }}>Every 5th wash is on us</h2>
          <p style={{ color: 'var(--gray)', fontSize: '0.95rem', lineHeight: '1.75', maxWidth: '440px', margin: '0 auto 3rem' }}>
            Book any wash service and collect a stamp. Reach 5 and your next basic exterior wash is completely free. No app, no fuss — tracked via WhatsApp.
          </p>
          <div className="promo-stamps">
            {[0,1,2,3,4].map(i => (
              <div key={i} className={`promo-stamp ${i < 3 ? 'filled' : i === 4 ? 'free' : 'empty'}`}>
                {i === 4 ? (
                  <>
                    <span style={{ fontSize: '1.5rem' }}>🎁</span>
                    <span style={{ color: 'var(--gold)', fontSize: '0.55rem', fontWeight: '700', letterSpacing: '1px', marginTop: '2px' }}>FREE</span>
                  </>
                ) : i < 3 ? (
                  <span style={{ color: 'var(--black)', fontSize: '1.4rem' }}>✦</span>
                ) : (
                  <span style={{ color: 'rgba(201,168,76,0.25)', fontSize: '1.4rem' }}>✦</span>
                )}
              </div>
            ))}
          </div>
          <p style={{ color: 'var(--gray)', fontSize: '0.8rem', marginBottom: '2rem' }}>
            Example: 3 stamps collected — just 1 more to go before your free wash
          </p>
          <a href={WA_GENERAL} target="_blank" rel="noreferrer" className="btn-primary">Start collecting today</a>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="promo-section promo-section-dark">
        <div className="promo-max">
          <p className="section-label promo-center">What Clients Say</p>
          <h2 className="section-title promo-center" style={{ marginBottom: '3rem' }}>Real results. Real people.</h2>
          <div className="promo-testi-grid">
            {testimonials.map((t, i) => (
              <div key={i} className="promo-testi-card">
                <div className="promo-testi-stars">{'★'.repeat(t.stars)}</div>
                <p className="promo-testi-text">{t.text}</p>
                <div className="promo-testi-author">
                  <div className="promo-testi-avatar">{t.initials}</div>
                  <div>
                    <p className="promo-testi-name">{t.name}</p>
                    <p className="promo-testi-service">{t.service}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="promo-section promo-section-gradient">
        <div className="promo-final-inner">
          <p className="section-label">Ready to transform your car?</p>
          <h2>Claim your launch<br />discount today.</h2>
          <p style={{ color: 'var(--gray)', fontSize: '1rem', marginBottom: '0.5rem' }}>
            Only <strong style={{ color: 'var(--gold)' }}>{slotsLeft} slots left</strong> this month.
          </p>
          <p style={{ color: 'var(--gray)', fontSize: '0.88rem', marginBottom: '2.5rem' }}>
            Book in 60 seconds — no forms, no waiting.
          </p>
          <div className="promo-final-btns">
            <a href={WA_LAUNCH} target="_blank" rel="noreferrer" className="btn-primary">💬 Book on WhatsApp now</a>
            <a href="tel:+250792575132" className="btn-outline">📞 Call us directly</a>
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
    </>
  )
}
