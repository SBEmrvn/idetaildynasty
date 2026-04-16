import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { getErrorMessage } from '../utils/errors'

export default function Register({ setUser }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' })
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [sentEmail, setSentEmail] = useState('')
  const [resending, setResending] = useState(false)
  const [resendMsg, setResendMsg] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    setForm({ name: '', email: '', phone: '', password: '', confirm: '' })
    setError('')
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
      options: {
        emailRedirectTo: `${window.location.origin}/verify-email`,
        data: { name: form.name }
      }
    })

    if (signUpError) {
      setError(getErrorMessage(signUpError))
      setLoading(false)
      return
    }

    // Save profile
    await supabase.from('profiles').insert({ id: data.user.id, name: form.name, phone: form.phone })

    // Sign out immediately — user must verify email first
    await supabase.auth.signOut()
    setUser(null)

    setSentEmail(form.email)
    setSent(true)
    setLoading(false)
  }

  const resend = async () => {
    setResending(true)
    setResendMsg('')
    const { error: err } = await supabase.auth.resend({
      type: 'signup',
      email: sentEmail,
      options: { emailRedirectTo: `${window.location.origin}/verify-email` }
    })
    setResending(false)
    setResendMsg(err ? 'Could not resend. Try again shortly.' : 'Email resent! Check your inbox.')
  }

  const eyeBtn = {
    position: 'absolute', right: '1rem', bottom: '0.9rem',
    background: 'none', border: 'none', cursor: 'pointer',
    color: 'var(--gray)', fontSize: '1rem', padding: 0, lineHeight: 1
  }

  // ── SENT STATE ──────────────────────────────────────────────────────────────
  if (sent) {
    return (
      <div className="auth-page">
        <div className="auth-box" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>📧</div>
          <div className="auth-logo" style={{ marginBottom: '0.5rem' }}>Check Your Email</div>
          <p style={{ color: 'var(--gray)', fontSize: '0.9rem', lineHeight: '1.7', marginBottom: '1.5rem' }}>
            We sent a confirmation link to<br />
            <strong style={{ color: 'var(--gold)' }}>{sentEmail}</strong>
          </p>
          <div style={{ background: 'var(--dark2)', border: '1px solid rgba(201,168,76,0.15)', padding: '1.2rem', marginBottom: '1.5rem', textAlign: 'left' }}>
            {[
              { icon: '1️⃣', text: 'Open the email from iDetail Dynasty' },
              { icon: '2️⃣', text: 'Click the "Confirm your email" button' },
              { icon: '3️⃣', text: 'You\'ll be redirected and can log in' },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.5rem 0', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <span style={{ fontSize: '1.1rem' }}>{s.icon}</span>
                <span style={{ color: 'var(--gray)', fontSize: '0.85rem' }}>{s.text}</span>
              </div>
            ))}
          </div>
          <p style={{ color: 'var(--gray)', fontSize: '0.8rem', marginBottom: '0.8rem' }}>Didn't receive it? Check your spam folder or</p>
          <button
            onClick={resend} disabled={resending}
            style={{ background: 'transparent', border: '1px solid var(--gold)', color: 'var(--gold)', padding: '0.6rem 1.5rem', fontFamily: 'var(--font-body)', fontSize: '0.8rem', letterSpacing: '1.5px', textTransform: 'uppercase', cursor: resending ? 'not-allowed' : 'pointer', opacity: resending ? 0.6 : 1, marginBottom: '0.8rem' }}
          >
            {resending ? 'Resending...' : 'Resend Email'}
          </button>
          {resendMsg && <p style={{ color: resendMsg.includes('resent') ? 'var(--gold)' : '#f44336', fontSize: '0.82rem', marginBottom: '0.8rem' }}>{resendMsg}</p>}
          <div className="auth-switch"><Link to="/login">Back to Login</Link></div>
        </div>
      </div>
    )
  }

  // ── FORM ────────────────────────────────────────────────────────────────────
  return (
    <div className="auth-page">
      <div className="auth-box">
        <div className="auth-logo">iDetail Dynasty</div>
        <p className="auth-sub">Create your account — it's free &amp; quick</p>

        {error && <div className="error-msg">{error}</div>}

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
            <input name="password" type={showPw ? 'text' : 'password'} value={form.password} onChange={handle} placeholder="Min. 6 characters" autoComplete="new-password" style={{ paddingRight: '3rem' }} />
            <button type="button" style={eyeBtn} onClick={() => setShowPw(p => !p)}>{showPw ? '🙈' : '👁️'}</button>
          </div>
          <div className="form-group" style={{ position: 'relative' }}>
            <label>Confirm Password *</label>
            <input name="confirm" type={showConfirm ? 'text' : 'password'} value={form.confirm} onChange={handle} placeholder="Repeat your password" autoComplete="new-password" style={{ paddingRight: '3rem' }} />
            <button type="button" style={eyeBtn} onClick={() => setShowConfirm(p => !p)}>{showConfirm ? '🙈' : '👁️'}</button>
          </div>
          <button
            type="submit" disabled={loading}
            style={{ width: '100%', padding: '1rem', background: loading ? '#888' : 'var(--gold)', color: 'var(--black)', border: 'none', fontFamily: 'var(--font-body)', fontSize: '0.9rem', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: '500', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '0.5rem', borderRadius: '4px' }}
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
