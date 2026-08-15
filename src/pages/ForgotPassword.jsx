import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabase'
import { getErrorMessage } from '../utils/errors'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email) { setError('Please enter your email address.'); return }
    setLoading(true)
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })
    if (err) { setError(getErrorMessage(err)); setLoading(false); return }
    setSent(true)
    setLoading(false)
  }

  return (
    <div className="auth-page">
      <div className="auth-box">
        <div className="auth-logo">iDetail Dynasty</div>
        <p className="auth-sub">Reset your password</p>

        {error && <div className="error-msg">{error}</div>}

        {sent ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📧</div>
            <p style={{ color: 'var(--gold)', marginBottom: '0.5rem' }}>Check your inbox!</p>
            <p style={{ color: 'var(--gray)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              We sent a password reset link to <strong style={{ color: 'var(--white)' }}>{email}</strong>
            </p>
            <Link to="/login" style={{ color: 'var(--gold)', fontSize: '0.85rem' }}>Back to Login</Link>
          </div>
        ) : (
          <form className="auth-form" onSubmit={submit}>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="john@email.com"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '1rem',
                background: loading ? '#888' : 'var(--gold)',
                color: 'var(--black)', border: 'none',
                fontFamily: 'var(--font-body)', fontSize: '0.9rem',
                letterSpacing: '2px', textTransform: 'uppercase',
                fontWeight: '500', cursor: loading ? 'not-allowed' : 'pointer',
                marginTop: '0.5rem'
              }}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        {!sent && (
          <div className="auth-switch">
            Remember your password? <Link to="/login">Sign in here</Link>
          </div>
        )}
      </div>
    </div>
  )
}
