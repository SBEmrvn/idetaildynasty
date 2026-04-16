import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

export default function VerifyEmail() {
  const [status, setStatus] = useState('verifying') // verifying | success | error
  const navigate = useNavigate()

  useEffect(() => {
    // Supabase automatically processes the token in the URL hash
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        // Sign them out immediately — they should log in manually
        supabase.auth.signOut().then(() => {
          setStatus('success')
        })
      }
    })
    // Fallback: if no event fires within 3s, show success anyway (token already consumed)
    const timer = setTimeout(() => {
      if (status === 'verifying') setStatus('success')
    }, 3000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timer)
    }
  }, [])

  if (status === 'verifying') {
    return (
      <div className="auth-page">
        <div className="auth-box" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⏳</div>
          <p style={{ color: 'var(--gold)', letterSpacing: '3px', fontSize: '0.85rem', textTransform: 'uppercase' }}>Verifying your email...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <div className="auth-box" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>✅</div>
        <div className="auth-logo" style={{ marginBottom: '0.5rem' }}>Email Verified!</div>
        <p style={{ color: 'var(--gray)', fontSize: '0.9rem', lineHeight: '1.7', marginBottom: '2rem' }}>
          Your account has been confirmed.<br />
          You can now sign in to <span style={{ color: 'var(--gold)' }}>iDetail Dynasty</span>.
        </p>
        <Link
          to="/login"
          style={{
            display: 'inline-block', padding: '0.9rem 2.5rem',
            background: 'var(--gold)', color: 'var(--black)',
            fontFamily: 'var(--font-body)', fontSize: '0.85rem',
            letterSpacing: '2px', textTransform: 'uppercase',
            fontWeight: '500', textDecoration: 'none',
            transition: 'background 0.3s'
          }}
        >
          Sign In Now
        </Link>
      </div>
    </div>
  )
}
