import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

export default function Register({ setUser }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' })
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  // Clear form every time this page mounts
  useEffect(() => {
    setForm({ name: '', email: '', phone: '', password: '', confirm: '' })
    setError('')
    setSuccess('')
  }, [])

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.name || !form.email || !form.password || !form.confirm) {
      setError('Please fill in all required fields.')
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .insert({ id: data.user.id, name: form.name, phone: form.phone })

    if (profileError) {
      setError(profileError.message)
      setLoading(false)
      return
    }

    setUser({ id: data.user.id, name: form.name, email: form.email })
    setSuccess('Account created successfully! Redirecting...')
    setLoading(false)
    setTimeout(() => navigate('/'), 1500)
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
        <p className="auth-sub">Create your account — it's free &amp; quick</p>

        {error && <div className="error-msg">{error}</div>}
        {success && <div className="success-msg">{success}</div>}

        <form className="auth-form" onSubmit={submit} autoComplete="off">
          <div className="form-group">
            <label>Full Name *</label>
            <input name="name" value={form.name} onChange={handle} placeholder="John Doe" autoComplete="off" />
          </div>
          <div className="form-group">
            <label>Email Address *</label>
            <input name="email" type="email" value={form.email} onChange={handle} placeholder="john@email.com" autoComplete="off" />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input name="phone" value={form.phone} onChange={handle} placeholder="+000 000 0000" autoComplete="off" />
          </div>
          <div className="form-group" style={{ position: 'relative' }}>
            <label>Password *</label>
            <input
              name="password"
              type={showPw ? 'text' : 'password'}
              value={form.password} onChange={handle}
              placeholder="Min. 6 characters"
              autoComplete="new-password"
              style={{ paddingRight: '3rem' }}
            />
            <button type="button" style={eyeBtn} onClick={() => setShowPw(p => !p)}>
              {showPw ? '🙈' : '👁️'}
            </button>
          </div>
          <div className="form-group" style={{ position: 'relative' }}>
            <label>Confirm Password *</label>
            <input
              name="confirm"
              type={showConfirm ? 'text' : 'password'}
              value={form.confirm} onChange={handle}
              placeholder="Repeat your password"
              autoComplete="new-password"
              style={{ paddingRight: '3rem' }}
            />
            <button type="button" style={eyeBtn} onClick={() => setShowConfirm(p => !p)}>
              {showConfirm ? '🙈' : '👁️'}
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
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-switch">
          Already have an account? <Link to="/login">Sign in here</Link>
        </div>
      </div>
    </div>
  )
}
