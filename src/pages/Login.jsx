import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

export default function Login({ setUser }) {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  // Clear form every time this page mounts
  useEffect(() => {
    setForm({ email: '', password: '' })
    setError('')
  }, [])

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    })

    if (signInError) {
      setError('Invalid email or password. Please try again.')
      setLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('name, phone')
      .eq('id', data.user.id)
      .single()

    setUser({ id: data.user.id, name: profile?.name || 'Customer', email: data.user.email })
    setLoading(false)
    navigate('/')
  }

  const eyeBtn = {
    position: 'absolute', right: '1rem', bottom: '0.9rem',
    background: 'none', border: 'none', cursor: 'pointer',
    color: 'var(--gray)', fontSize: '1rem', padding: 0, lineHeight: 1
  }

  return (
    <div className="auth-page">
      <div className="auth-box">
        <div className="auth-logo">iDetail Dynasty</div>
        <p className="auth-sub">Welcome back — sign in to your account</p>

        {error && <div className="error-msg">{error}</div>}

        <form className="auth-form" onSubmit={submit} autoComplete="off">
          <div className="form-group">
            <label>Email Address</label>
            <input
              name="email" type="email"
              value={form.email} onChange={handle}
              placeholder="john@email.com"
              autoComplete="off"
            />
          </div>
          <div className="form-group" style={{ position: 'relative' }}>
            <label>Password</label>
            <input
              name="password"
              type={showPw ? 'text' : 'password'}
              value={form.password} onChange={handle}
              placeholder="••••••••"
              autoComplete="new-password"
              style={{ paddingRight: '3rem' }}
            />
            <button type="button" style={eyeBtn} onClick={() => setShowPw(p => !p)}>
              {showPw ? '🙈' : '👁️'}
            </button>
          </div>
          <button
            type="submit" disabled={loading}
            style={{
              width: '100%', padding: '1rem',
              background: loading ? '#888' : 'var(--gold)',
              color: 'var(--black)', border: 'none',
              fontFamily: 'var(--font-body)', fontSize: '0.9rem',
              letterSpacing: '2px', textTransform: 'uppercase',
              fontWeight: '500', cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '0.5rem', borderRadius: '4px'
            }}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-switch">
          Don't have an account? <Link to="/register">Register here</Link>
        </div>
        <div className="auth-switch" style={{ marginTop: '0.8rem' }}>
          <Link to="/forgot-password" style={{ color: 'var(--gray)', fontSize: '0.8rem' }}>
            Forgot your password?
          </Link>
        </div>
      </div>
    </div>
  )
}
