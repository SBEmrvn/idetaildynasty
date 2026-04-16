import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { getErrorMessage } from '../utils/errors'

export default function Login({ setUser }) {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [unverified, setUnverified] = useState(false)
  const [resending, setResending] = useState(false)
  const [resendMsg, setResendMsg] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    setForm({ email: '', password: '' })
    setError('')
  }, [])

  const handle = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setUnverified(false)
    setResendMsg('')
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setUnverified(false)
    setLoading(true)

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    })

    if (signInError) {
      const msg = signInError.message?.toLowerCase() || ''
      if (msg.includes('email not confirmed')) {
        setUnverified(true)
      } else {
        setError(getErrorMessage(signInError))
      }
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

  const resend = async () => {
    setResending(true)
    setResendMsg('')
    const { error: err } = await supabase.auth.resend({
      type: 'signup',
      email: form.email,
      options: { emailRedirectTo: `${window.location.origin}/verify-email` }
    })
    setResending(false)
    setResendMsg(err ? 'Could not resend. Try again shortly.' : 'Verification email resent! Check your inbox.')
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

        {unverified && (
          <div style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.4)', padding: '1rem 1.2rem', marginBottom: '1rem', borderRadius: '4px' }}>
            <p style={{ color: 'var(--gold)', fontSize: '0.88rem', marginBottom: '0.5rem' }}>
              📧 Please verify your email before signing in.
            </p>
            <p style={{ color: 'var(--gray)', fontSize: '0.8rem', marginBottom: '0.8rem' }}>
              Check your inbox for the confirmation link we sent to <strong style={{ color: 'var(--white)' }}>{form.email}</strong>.
            </p>
            <button
              onClick={resend} disabled={resending}
              style={{ background: 'transparent', border: '1px solid var(--gold)', color: 'var(--gold)', padding: '0.45rem 1.2rem', fontFamily: 'var(--font-body)', fontSize: '0.75rem', letterSpacing: '1.5px', textTransform: 'uppercase', cursor: resending ? 'not-allowed' : 'pointer', opacity: resending ? 0.6 : 1 }}
            >
              {resending ? 'Resending...' : 'Resend Verification Email'}
            </button>
            {resendMsg && <p style={{ color: resendMsg.includes('resent') ? '#4CAF50' : '#f44336', fontSize: '0.8rem', marginTop: '0.5rem' }}>{resendMsg}</p>}
          </div>
        )}

        <form className="auth-form" onSubmit={submit} autoComplete="off">
          <div className="form-group">
            <label>Email Address</label>
            <input name="email" type="email" value={form.email} onChange={handle} placeholder="john@email.com" autoComplete="off" />
          </div>
          <div className="form-group" style={{ position: 'relative' }}>
            <label>Password</label>
            <input name="password" type={showPw ? 'text' : 'password'} value={form.password} onChange={handle} placeholder="••••••••" autoComplete="new-password" style={{ paddingRight: '3rem' }} />
            <button type="button" style={eyeBtn} onClick={() => setShowPw(p => !p)}>{showPw ? '🙈' : '👁️'}</button>
          </div>
          <button
            type="submit" disabled={loading}
            style={{ width: '100%', padding: '1rem', background: loading ? '#888' : 'var(--gold)', color: 'var(--black)', border: 'none', fontFamily: 'var(--font-body)', fontSize: '0.9rem', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: '500', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '0.5rem', borderRadius: '4px' }}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-switch">
          Don't have an account? <Link to="/register">Register here</Link>
        </div>
        <div className="auth-switch" style={{ marginTop: '0.8rem' }}>
          <Link to="/forgot-password" style={{ color: 'var(--gray)', fontSize: '0.8rem' }}>Forgot your password?</Link>
        </div>
      </div>
    </div>
  )
}
