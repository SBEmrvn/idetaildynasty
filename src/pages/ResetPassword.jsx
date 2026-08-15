import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { getErrorMessage } from '../utils/errors'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Supabase puts the token in the URL hash — this picks it up automatically
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        // session is now active, user can set new password
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }
    setLoading(true)
    const { error: err } = await supabase.auth.updateUser({ password })
    if (err) { setError(getErrorMessage(err)); setLoading(false); return }
    setDone(true)
    setLoading(false)
    setTimeout(() => navigate('/login'), 2500)
  }

  return (
    <div className="auth-page">
      <div className="auth-box">
        <div className="auth-logo">iDetail Dynasty</div>
        <p className="auth-sub">Set your new password</p>

        {error && <div className="error-msg">{error}</div>}

        {done ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
            <p style={{ color: 'var(--gold)', marginBottom: '0.5rem' }}>Password updated!</p>
            <p style={{ color: 'var(--gray)', fontSize: '0.85rem' }}>Redirecting you to login...</p>
          </div>
        ) : (
          <form className="auth-form" onSubmit={submit}>
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
              />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Repeat your password"
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
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        )}

        {!done && (
          <div className="auth-switch">
            <Link to="/login">Back to Login</Link>
          </div>
        )}
      </div>
    </div>
  )
}
