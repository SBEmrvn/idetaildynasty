import { useState, useEffect, useRef, lazy, Suspense, createContext, useContext } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, NavLink, Navigate, useLocation } from 'react-router-dom'
import { supabase } from './supabase'
import './index.css'

const Home = lazy(() => import('./pages/Home'))
const Booking = lazy(() => import('./pages/Booking'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Promos = lazy(() => import('./pages/Promos'))
const Services = lazy(() => import('./pages/Services'))
const Admin = lazy(() => import('./pages/Admin'))
const Gallery = lazy(() => import('./pages/Gallery'))
const Reviews = lazy(() => import('./pages/Reviews'))
const Contact = lazy(() => import('./pages/Contact'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))
const NotFound = lazy(() => import('./pages/NotFound'))

// ─── Feature Flags Context ───────────────────────────────────────────────────
export const FeaturesContext = createContext({})
export const useFeatures = () => useContext(FeaturesContext)

const DEFAULT_FEATURES = {
  enable_reviews: true,
  enable_gallery: true,
  enable_promos: true,
  enable_whatsapp: true,
  enable_photo_upload: false,
  enable_price_calculator: false,
  enable_dashboard: true,
}

// ─── Scroll To Top ────────────────────────────────────────────────────────────
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }) }, [pathname])
  return null
}

// ─── Navbar ──────────────────────────────────────────────────────────────────
function Navbar({ user, setUser }) {
  const features = useFeatures()
  const [menuOpen, setMenuOpen] = useState(false)
  const navRef = useRef(null)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setMenuOpen(false)
  }

  const close = () => setMenuOpen(false)

  // Close menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuOpen && navRef.current && !navRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  const isAdmin = user?.email?.trim().toLowerCase() === import.meta.env.VITE_ADMIN_EMAIL?.trim().toLowerCase()

  const navLinkClass = ({ isActive }) => isActive ? 'nav-link-active' : undefined

  return (
    <nav ref={navRef}>
      <Link to="/" className="nav-logo" onClick={close}>iDetail Dynasty</Link>

      <ul className={`nav-links${menuOpen ? ' nav-open' : ''}`}>
        <li><NavLink to="/" end className={navLinkClass} onClick={close}>Home</NavLink></li>
        <li><NavLink to="/services" className={navLinkClass} onClick={close}>Services</NavLink></li>
        {features.enable_gallery && <li><NavLink to="/gallery" className={navLinkClass} onClick={close}>Gallery</NavLink></li>}
        {features.enable_promos && <li><NavLink to="/promos" className={navLinkClass} onClick={close}>Promos</NavLink></li>}
        {features.enable_reviews && <li><NavLink to="/reviews" className={navLinkClass} onClick={close}>Reviews</NavLink></li>}
        <li><NavLink to="/contact" className={navLinkClass} onClick={close}>Contact</NavLink></li>
        <li><NavLink to="/booking" className={navLinkClass} onClick={close}>Book Now</NavLink></li>
        {user && features.enable_dashboard && <li><NavLink to="/dashboard" className={navLinkClass} onClick={close}>My Bookings</NavLink></li>}
        <li className="nav-mobile-action">
          {user
            ? <button className="nav-btn" onClick={handleLogout}>Logout</button>
            : <Link to="/register" className="nav-btn" onClick={close}>Register</Link>
          }
        </li>
      </ul>

      <div className="nav-right nav-desktop-action">
        {user && <span style={{ color: 'var(--gold)', fontSize: '0.82rem', marginRight: '0.5rem' }}>👤 {user.name}</span>}
        {isAdmin && <NavLink to="/admin" onClick={close} style={{ color: 'var(--gold)', fontSize: '0.78rem', letterSpacing: '1px', marginRight: '0.8rem', textDecoration: 'none' }}>⚙ Admin</NavLink>}
        {!user && <NavLink to="/login" className={navLinkClass} onClick={close} style={{ marginRight: '0.5rem', fontSize: '0.78rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--gray)', textDecoration: 'none' }}>Login</NavLink>}
        {user ? (
          <button className="nav-btn-pill" onClick={handleLogout}>Logout</button>
        ) : (
          <Link to="/register" className="nav-btn-pill" onClick={close}>Register</Link>
        )}
      </div>

      <button
        className="nav-hamburger"
        onClick={() => setMenuOpen(o => !o)}
        aria-label="Toggle menu"
      >
        <span /><span /><span />
      </button>
    </nav>
  )
}

// ─── Animated Routes ─────────────────────────────────────────────────────────
function AnimatedRoutes({ user, setUser, features }) {
  const location = useLocation()
  const [displayLocation, setDisplayLocation] = useState(location)
  const [stage, setStage] = useState('enter')

  useEffect(() => {
    if (location.pathname !== displayLocation.pathname) {
      setStage('exit')
      const t = setTimeout(() => {
        setDisplayLocation(location)
        setStage('enter')
      }, 700)
      return () => clearTimeout(t)
    }
  }, [location, displayLocation])

  return (
    <div className="page-wrap">
      <div className={`page-transition page-${stage}`}>
      <Suspense fallback={null}>
        <Routes location={displayLocation}>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/booking" element={<Booking user={user} />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/register" element={<Register setUser={setUser} />} />
          <Route path="/admin" element={<Admin user={user} />} />
          <Route path="/gallery" element={features.enable_gallery ? <Gallery /> : <Navigate to="/" />} />
          <Route path="/promos" element={features.enable_promos ? <Promos /> : <Navigate to="/" />} />
          <Route path="/reviews" element={features.enable_reviews ? <Reviews user={user} /> : <Navigate to="/" />} />
          <Route path="/dashboard" element={features.enable_dashboard ? <Dashboard user={user} /> : <Navigate to="/" />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      </div>
    </div>
  )
}

// ─── App ─────────────────────────────────────────────────────────────────────
function App() {
  const [user, setUser] = useState(null)
  const [whatsapp, setWhatsapp] = useState('')
  const [features, setFeatures] = useState(DEFAULT_FEATURES)

  // Auth listener
  useEffect(() => {
    // Sign out any stale session on app load
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) setUser(null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null)
        return
      }
      if (session?.user) {
        supabase.from('profiles').select('name, phone').eq('id', session.user.id).single()
          .then(({ data: profile }) => {
            setUser({ id: session.user.id, name: profile?.name || 'Customer', email: session.user.email })
          })
      } else {
        setUser(null)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  // Settings + feature flags listener
  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from('settings').select('*').limit(1).single()
      if (!data) return
      if (data.whatsapp) setWhatsapp(data.whatsapp)
      setFeatures({
        enable_reviews:          data.enable_reviews          ?? true,
        enable_gallery:          data.enable_gallery          ?? true,
        enable_promos:           data.enable_promos           ?? true,
        enable_whatsapp:         data.enable_whatsapp         ?? true,
        enable_photo_upload:     data.enable_photo_upload     ?? false,
        enable_price_calculator: data.enable_price_calculator ?? false,
        enable_dashboard:        data.enable_dashboard        ?? true,
      })
    }
    fetchSettings()
    const channel = supabase.channel('app-settings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, fetchSettings)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  return (
    <FeaturesContext.Provider value={features}>
      <Router>
        <ScrollToTop />
        <Navbar user={user} setUser={setUser} />
        <AnimatedRoutes user={user} setUser={setUser} features={features} />

        {/* WHATSAPP FLOAT BUTTON — controlled by feature flag */}
        {features.enable_whatsapp && whatsapp && (
          <a
            href={`https://wa.me/${whatsapp.replace(/\D/g, '')}?text=Hi%20iDetail%20Dynasty%2C%20I%27d%20like%20to%20book%20a%20detailing%20service.`}
            target="_blank" rel="noreferrer"
            style={{
              position: 'fixed', bottom: '2rem', right: '2rem',
              background: '#25D366', color: '#fff',
              width: '56px', height: '56px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.6rem', zIndex: 999,
              boxShadow: '0 4px 20px rgba(37,211,102,0.4)',
              textDecoration: 'none', transition: 'transform 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            title="Chat on WhatsApp"
          >
            💬
          </a>
        )}
      </Router>
    </FeaturesContext.Provider>
  )
}

export default App
