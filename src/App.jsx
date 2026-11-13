import { useState, useEffect, lazy, Suspense, createContext, useContext } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, NavLink, Navigate, useLocation } from 'react-router-dom'
import { supabase } from './supabase'
import './index.css'
import { Logo, HomeIcon, SparkleIcon, CalendarPlusIcon, ClipboardIcon, ImageIcon, TagIcon, StarIcon, PhoneIcon, SettingsIcon, LogInIcon, LogOutIcon, UserPlusIcon, WhatsAppIcon } from './components/icons'
import { initials } from './components/ui'

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

// ─── Sidebar ─────────────────────────────────────────────────────────────────
function SideLink({ to, tip, icon: Icon, end, onClick }) {
  return (
    <li>
      <NavLink to={to} end={end} data-tip={tip} aria-label={tip} onClick={onClick}
        className={({ isActive }) => `side-link${isActive ? ' active' : ''}`}>
        <Icon />
      </NavLink>
    </li>
  )
}

function Sidebar({ user, setUser }) {
  const features = useFeatures()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  const isAdmin = user?.email?.trim().toLowerCase() === import.meta.env.VITE_ADMIN_EMAIL?.trim().toLowerCase()

  return (
    <aside className="sidebar" aria-label="Main navigation">
      <Link to="/" className="sidebar-logo" aria-label="iDetail Dynasty home"><Logo /></Link>

      <ul className="sidebar-nav">
        <SideLink to="/" end tip="Home" icon={HomeIcon} />
        <SideLink to="/services" tip="Services" icon={SparkleIcon} />
        <SideLink to="/booking" tip="Book now" icon={CalendarPlusIcon} />
        {user && features.enable_dashboard && <SideLink to="/dashboard" tip="My bookings" icon={ClipboardIcon} />}
        {features.enable_gallery && <SideLink to="/gallery" tip="Gallery" icon={ImageIcon} />}
        {features.enable_promos && <SideLink to="/promos" tip="Promos" icon={TagIcon} />}
        {features.enable_reviews && <SideLink to="/reviews" tip="Reviews" icon={StarIcon} />}
        <SideLink to="/contact" tip="Contact" icon={PhoneIcon} />
      </ul>

      <ul className="sidebar-nav bottom">
        {isAdmin && <SideLink to="/admin" tip="Admin" icon={SettingsIcon} />}
        <li className="sidebar-sep" aria-hidden="true" />
        {user ? (
          <li>
            <button className="side-link" data-tip="Log out" aria-label="Log out" onClick={handleLogout}><LogOutIcon /></button>
          </li>
        ) : (
          <>
            <SideLink to="/login" tip="Log in" icon={LogInIcon} />
            <SideLink to="/register" tip="Register" icon={UserPlusIcon} />
          </>
        )}
        {user && (
          <li style={{ marginTop: 8 }}>
            <div className="side-avatar" title={user.name}>{initials(user.name)}</div>
          </li>
        )}
      </ul>
    </aside>
  )
}

// ─── Top bar (account actions) ───────────────────────────────────────────────
function Topbar({ user, setUser }) {
  const isAdmin = user?.email?.trim().toLowerCase() === import.meta.env.VITE_ADMIN_EMAIL?.trim().toLowerCase()
  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }
  return (
    <header className="topbar">
      <Link to="/" className="mobile-brand"><span className="mb-logo"><Logo /></span>iDetail Dynasty</Link>
      <div className="topbar-actions">
        {user ? (
          <>
            {isAdmin && <Link to="/admin" className="btn-outline btn-sm"><SettingsIcon /> <span className="hide-sm">Admin</span></Link>}
            <Link to="/dashboard" className="user-chip" title="My bookings">
              <span className="user-chip-avatar">{initials(user.name)}</span>
              <span className="hide-sm">{user.name}</span>
            </Link>
            <button className="btn-primary btn-sm" onClick={handleLogout}><LogOutIcon /> Log out</button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn-outline btn-sm"><LogInIcon /> Log in</Link>
            <Link to="/register" className="btn-primary btn-sm"><UserPlusIcon /> Register</Link>
          </>
        )}
      </div>
    </header>
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
      }, 200)
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
        <div className="app-shell">
          <Sidebar user={user} setUser={setUser} />
          <main className="main">
            <Topbar user={user} setUser={setUser} />
            <AnimatedRoutes user={user} setUser={setUser} features={features} />
          </main>
        </div>

        {/* WHATSAPP FLOAT BUTTON — controlled by feature flag */}
        {features.enable_whatsapp && whatsapp && (
          <a
            className="wa-float"
            href={`https://wa.me/${whatsapp.replace(/\D/g, '')}?text=Hi%20iDetail%20Dynasty%2C%20I%27d%20like%20to%20book%20a%20detailing%20service.`}
            target="_blank" rel="noreferrer"
            title="Chat on WhatsApp"
            aria-label="Chat on WhatsApp"
          >
            <WhatsAppIcon />
          </a>
        )}
      </Router>
    </FeaturesContext.Provider>
  )
}

export default App
