import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <section style={{
      minHeight: 'calc(100vh - 90px)', display: 'flex', alignItems: 'center', borderRadius: 'var(--r-xl)',
      justifyContent: 'center', textAlign: 'center',
      background: 'var(--hero-bg)',
      padding: '2rem', position: 'relative', overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at center, rgba(31,96,79,0.056) 0%, transparent 70%)'
      }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <p style={{
          fontFamily: 'var(--font-display)', fontSize: 'clamp(6rem, 20vw, 12rem)',
          color: 'var(--gold)', opacity: 0.15, lineHeight: 1, marginBottom: '-1rem'
        }}>404</p>
        <p className="section-label">Page Not Found</p>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(2rem, 5vw, 3.5rem)',
          marginBottom: '1rem'
        }}>Lost in the Detail</h1>
        <p style={{ color: 'var(--gray)', maxWidth: '400px', margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/" className="btn-primary">Back to Home</Link>
          <Link to="/booking" className="btn-outline">Book Now</Link>
        </div>
      </div>
    </section>
  )
}
